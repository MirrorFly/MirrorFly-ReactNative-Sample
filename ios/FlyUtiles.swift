//
//  FlyUtiles.swift
//  mirrorfly_rn
//
//  Created by user on 02/01/25.
//

import Foundation
import MobileCoreServices
import UniformTypeIdentifiers
import IDZSwiftCommonCrypto

extension URL {
  var attributes: [FileAttributeKey : Any]? {
    do {
      return try FileManager.default.attributesOfItem(atPath: path)
    } catch let error as NSError {
      print("FileAttribute error: \(error)")
    }
    return nil
  }
  
  var fileSize: UInt64 {
    return attributes?[.size] as? UInt64 ?? UInt64(0)
  }
  
  var fileSizeString: String {
    return ByteCountFormatter.string(fromByteCount: Int64(fileSize), countStyle: .file)
  }
  
  var creationDate: Date? {
    return attributes?[.creationDate] as? Date
  }
}

class StreamManager : NSObject {
  
  let fileManager = FileManager.default
  
  let fileURL : URL
  let folderURL : URL
  let fileName : String
  var key : String
  var chunksCounter : Int = 0
  var lastChunkFileUrl : URL? = nil
  var folderName : String!
  var fileExtension :String!
  var cancelStream : Bool = false
  
  public init(fileURL: URL, folderURL: URL, fileName: String, key: String) {
    self.fileURL = fileURL
    self.folderURL = folderURL
    self.fileName = fileName
    self.key = key
    super.init()
    self.setFolderNameAndFileExtension()
  }
  
  func setFolderNameAndFileExtension(){
    let fileNameArray = fileName.components(separatedBy: ".")
    guard let fileName = fileNameArray.first, let fileExtension = fileNameArray.last else {
      return
    }
    self.folderName = fileName
    self.fileExtension = fileExtension
  }
  
  func generateChunkFileURL(append : String) -> URL? {
    if let folderName = folderName, let fileExtension = fileExtension, !folderName.isEmpty && !fileExtension.isEmpty{
      let chunckName = "\(folderName)-\(append).\(fileExtension)"
      let chunkUrl = folderURL.appendingPathComponent(chunckName)
      if fileManager.fileExists(atPath: chunkUrl.path) && fileManager.isDeletableFile(atPath: chunkUrl.path){
        do {
          try fileManager.removeItem(atPath: chunkUrl.path)
          return chunkUrl
        } catch {
          print("Could not clear temp folder: \(error)")
          return nil
        }
      }else{
        return chunkUrl
      }
    }
    return nil
  }
  
  func startStreaming() -> (bytesWritten:Int, lastChunkFileUrl:URL){
    guard let inputStream = InputStream(url: fileURL)else {
      return (0,URL(fileURLWithPath: ""))
    }
    inputStream.open()
    guard let hashedKey = FlyEncryption.sha256(key, length: 32) else {return (-1,URL(fileURLWithPath: ""))}
    let keyBytes = [UInt8](hashedKey.utf8)
    let initializationVector = [UInt8]("ddc0f15cc2c90fca".utf8)
    let streamCryptor = StreamCryptor(operation: .encrypt, algorithm: .aes, mode: .CBC, padding: .PKCS7Padding, key: keyBytes, iv: initializationVector)
    let (_, bytesWritten,outputFileURL) = crypt(sc: streamCryptor, inputStream: inputStream)
    inputStream.close()
    print("#upload EndStreaming KEY \(key) noOfChunks \(self.chunksCounter)")
    return (bytesWritten, outputFileURL);
  }
  
  
  func crypt(sc: StreamCryptor, inputStream: InputStream) -> (bytesRead: Int, bytesWritten: Int, outputFileURL:URL) {
      var inputBuffer = Array<UInt8>(repeating: 0, count: 5242880)
      var outputBuffer = Array<UInt8>(repeating: 0, count: 5242880)
      var cryptedBytes: Int = 0
      var totalBytesWritten = 0
      var totalBytesRead = 0
      let outputFileURL = folderURL.appendingPathComponent(fileName)
      print("outputFileURL ==>",outputFileURL)
      // Open a single output stream for the entire operation
      guard let outputStream = OutputStream(url: outputFileURL, append: false) else {
          print("Failed to create output stream.")
          return (0, 0, URL(fileURLWithPath: ""))
      }
      outputStream.open()

      defer {
          // Ensure the output stream is closed at the end
          outputStream.close()
      }

      while inputStream.hasBytesAvailable {
          let bytesRead = inputStream.read(&inputBuffer, maxLength: inputBuffer.count)
          totalBytesRead += bytesRead

          _ = sc.update(bufferIn: inputBuffer, byteCountIn: bytesRead, bufferOut: &outputBuffer, byteCapacityOut: outputBuffer.count, byteCountOut: &cryptedBytes)

          if cryptedBytes > 0 {
              let bytesWritten = outputStream.write(outputBuffer, maxLength: cryptedBytes)
              totalBytesWritten += bytesWritten

              if bytesWritten != cryptedBytes {
                  print("Failed to write all bytes to the output stream.")
              }

              assert(bytesWritten == cryptedBytes)
          }

          if cancelStream {
              break
          }
      }

      // Finalize the cryptor and write any remaining bytes
      _ = sc.final(bufferOut: &outputBuffer, byteCapacityOut: outputBuffer.count, byteCountOut: &cryptedBytes)
      if cryptedBytes > 0 {
          let bytesWritten = outputStream.write(outputBuffer, maxLength: cryptedBytes)
          totalBytesWritten += bytesWritten

          if bytesWritten != cryptedBytes {
              print("Failed to write all final bytes to the output stream.")
          }
      }

      return (totalBytesRead, totalBytesWritten ,outputFileURL)
  }
  
  func decryptStreaming(at path: URL, fileName: String, key: String, iv: String) -> (URL, String)? {
      print("#download decryptStreaming Start", fileName)
      
      // Ensure filePath is a valid file URL
      let filePath = URL(fileURLWithPath: path.appendingPathComponent(fileName).path)
      
      if fileManager.fileExists(atPath: filePath.path) {
          let fileNameArray = fileName.components(separatedBy: ".")
          
          guard let fileNameString = fileNameArray.first,
                let extensionString = fileNameArray.last else {
              return nil
          }
          
          let decryptedFileName = "decrypted-\(fileNameString).\(extensionString)"
        
          let outputURL = URL(fileURLWithPath: path.appendingPathComponent(decryptedFileName).path)
          
          if fileManager.fileExists(atPath: outputURL.path) {
              do {
                  try fileManager.removeItem(at: filePath)
              } catch (let error) {
                  print("#download decryptFile decryption 1 ERROR \(error.localizedDescription)")
                  return nil
              }
          }
          
          if let inputStream = InputStream(url: filePath),
             let outputStream = OutputStream(url: outputURL, append: false) {
              // Open streams
              inputStream.open()
              outputStream.open()
              
              // IV
              let initializationVector = [UInt8](iv.utf8)
              
              // KEY HASH
              guard let hashedKey = FlyEncryption.sha256(key, length: 32) else { return nil }
              let keyBytes = [UInt8](hashedKey.utf8)
              
              // CRYPTOR
              let streamCryptor = StreamCryptor(
                  operation: .decrypt,
                  algorithm: .aes,
                  mode: .CBC,
                  padding: .PKCS7Padding,
                  key: keyBytes,
                  iv: initializationVector
              )
              
              // DECRYPTION
            _ = decrypt(
                  sc: streamCryptor,
                  inputStream: inputStream,
                  outputStream: outputStream,
                  bufferSize: 5242880
              )
              
              // Close streams
              inputStream.close()
              outputStream.close()
              
              do {
                  try fileManager.removeItem(at: filePath)
                  try fileManager.moveItem(at: outputURL, to: filePath)
              } catch (let error) {
                  print("#download decryptStreaming decryption 2 ERROR \(error.localizedDescription)")
                  return nil
              }
              
              print("outputURL ==>", outputURL)
              print("#download decryptStreaming END \(filePath)")
              return (filePath, key)
          }
      }
      
      return nil
  }
  
  func decrypt(sc : StreamCryptor,  inputStream: InputStream, outputStream: OutputStream, bufferSize: Int) -> (bytesRead: Int, bytesWritten: Int) {
      var inputBuffer = Array<UInt8>(repeating:0, count:bufferSize)
      var outputBuffer = Array<UInt8>(repeating:0, count:bufferSize)
      var cryptedBytes : Int = 0
      var totalBytesWritten = 0
      var totalBytesRead = 0
      while inputStream.hasBytesAvailable{
          let bytesRead = inputStream.read(&inputBuffer, maxLength: inputBuffer.count)
          totalBytesRead += bytesRead
        _ = sc.update(bufferIn: inputBuffer, byteCountIn: bytesRead, bufferOut: &outputBuffer, byteCapacityOut: outputBuffer.count, byteCountOut: &cryptedBytes)
          if(cryptedBytes > 0){
              let bytesWritten = outputStream.write(outputBuffer, maxLength: Int(cryptedBytes))
              totalBytesWritten += bytesWritten
          }
      }
    _ = sc.final(bufferOut: &outputBuffer, byteCapacityOut: outputBuffer.count, byteCountOut: &cryptedBytes)
      if(cryptedBytes > 0){
          let bytesWritten = outputStream.write(outputBuffer, maxLength: Int(cryptedBytes))
          totalBytesWritten += bytesWritten
      }
      return (totalBytesRead, totalBytesWritten)
  }
  
  func cancelStreaming(){
    self.cancelStream = true
  }
}
