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


public enum FlyProgress : String {
    
    case inprogress
    case success
    case failed
    case cancel
    
    public var rawValue: String {
        switch self {
        case .failed : return "failed"
        case .success : return "success"
        case .inprogress : return "inprogress"
        case .cancel : return "cancel"
        }
    }
}

public enum FlyError : String {
    
    case inprogress
    case success
    case failed
    case cancel
    
    public var rawValue: String {
        switch self {
        case .failed : return "failed"
        case .success : return "success"
        case .inprogress : return "inprogress"
        case .cancel : return "cancel"
        }
    }
}



public typealias FlyStreamDelegate = (_ isSuccess: FlyProgress ,_ error: FlyError? , _ data : (Int,URL?)) -> Void

class StreamManager : NSObject {
  
  let fileManager = FileManager.default
  
  let fileURL : URL
  let folderURL : URL
  let fileName : String
  var key : String
  var chunksCounter : Int = 0
  var folderName : String!
  var fileExtension :String!
  var streamDelegate : FlyStreamDelegate? = nil
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
  
  func startStreaming() -> Int{
    guard let inputStream = InputStream(url: fileURL)else {
        return 0
    }
    guard let hashedKey = FlyEncryption.sha256(key, length: 32) else { return -1}
    let keyBytes = [UInt8](hashedKey.utf8)
    let initializationVector = [UInt8]("ddc0f15cc2c90fca".utf8)
    let streamCryptor = StreamCryptor(operation: .encrypt, algorithm: .aes, mode: .CBC, padding: .PKCS7Padding, key: keyBytes, iv: initializationVector)
    _ = crypt(sc: streamCryptor, inputStream: inputStream)
    inputStream.open()
    return chunksCounter
  }
  
  
  func crypt(sc : StreamCryptor,  inputStream: InputStream) -> (bytesRead: Int, bytesWritten: Int) {
      var inputBuffer = Array<UInt8>(repeating:0, count: FlyConstants.bufferSize)
      var outputBuffer = Array<UInt8>(repeating:0, count: FlyConstants.bufferSize)
      var cryptedBytes : Int = 0
      var totalBytesWritten = 0
      var totalBytesRead = 0
      var lastChunkFileUrl : URL? = nil
      while inputStream.hasBytesAvailable{
          let bytesRead = inputStream.read(&inputBuffer, maxLength: inputBuffer.count)
          totalBytesRead += bytesRead
          _ = sc.update(bufferIn: inputBuffer, byteCountIn: bytesRead, bufferOut: &outputBuffer, byteCapacityOut: outputBuffer.count, byteCountOut: &cryptedBytes)
          if (cryptedBytes > 0){
              self.chunksCounter += 1
              if let chunkFileUrl = generateChunkFileURL(append: "\(self.chunksCounter)"){
                  if let outputStream = OutputStream(url: chunkFileUrl, append: false){
                      outputStream.open()
                      let bytesWritten = outputStream.write(outputBuffer, maxLength: Int(cryptedBytes))
                      outputStream.close()
                      if bytesWritten == FlyConstants.bufferSize{
                          streamDelegate?(.inprogress, nil, (self.chunksCounter,chunkFileUrl))
                      }else{
                          lastChunkFileUrl = chunkFileUrl
                      }
                      assert(bytesWritten == Int(cryptedBytes))
                      totalBytesWritten += bytesWritten
                      print("#validate bytesWritten \(bytesWritten)")
                  }
              }
          }
          if cancelStream{
              break
          }
      }
      _ = sc.final(bufferOut: &outputBuffer, byteCapacityOut: outputBuffer.count, byteCountOut: &cryptedBytes)
      if (cryptedBytes > 0){
          if let lastChunkFileUrl = lastChunkFileUrl, let outputStream = OutputStream(url: lastChunkFileUrl, append: true){
              outputStream.open()
              let bytesWritten = outputStream.write(outputBuffer, maxLength: Int(cryptedBytes))
              outputStream.close()
              streamDelegate?(.success, nil, (self.chunksCounter,lastChunkFileUrl))
              totalBytesWritten += bytesWritten
          }
      }
      if cancelStream{
          streamDelegate?(.cancel, nil,(chunksCounter, nil))
      }
      return (totalBytesRead, totalBytesWritten)
  }
  
  func cancelStreaming(){
      self.cancelStream = true
  }
}
