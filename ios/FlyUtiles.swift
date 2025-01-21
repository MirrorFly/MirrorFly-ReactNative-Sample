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
import CommonCrypto

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
  var iv : String
  var chunksCounter : Int = 0
  var lastChunkFileUrl : URL? = nil
  var folderName : String!
  var fileExtension :String!
  var cancelStream : Bool = false
  var sendEvent: (String, [String: Any]) -> Void
  
  public init(fileURL: URL, folderURL: URL, fileName: String, key: String, iv: String, sendEvent: @escaping (String, [String: Any]) -> Void) {
    self.fileURL = fileURL
    self.folderURL = folderURL
    self.fileName = fileName
    self.key = key
    self.iv = iv
    self.sendEvent = sendEvent
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
    let initializationVector = [UInt8](self.iv.utf8)
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
  
  func decryptStreaming(at path: URL, fileName: String, key: String, iv: String, msgId:String) -> (URL, String, Int)? {
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
            let (_,totalBytesWritten) = decrypt(
                  sc: streamCryptor,
                  inputStream: inputStream,
                  outputStream: outputStream,
                  bufferSize: 5242880,
                  msgId:msgId
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
              return (filePath, key, totalBytesWritten)
          }
      }
      
      return nil
  }
  
  func decrypt(sc : StreamCryptor,  inputStream: InputStream, outputStream: OutputStream, bufferSize: Int, msgId:String) -> (bytesRead: Int, bytesWritten: Int) {
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
            // Emit progress update
            let progressParams: [String: Any] = [
              "msgId": msgId,
              "totalBytesWritten": totalBytesWritten,
            ]
            
            self.sendEvent("decyption", progressParams)
            
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

/**
 Utility class to encrypt and decryption of messages.
 */
public struct FlyEncryption {
    
    private let key: Data
    private let iv: Data
    
    // MARK: - Initialzier
    public init?(encryptionKey: String, initializationVector: String) {
        guard encryptionKey.count == kCCKeySizeAES128 || encryptionKey.count == kCCKeySizeAES256, let keyData = encryptionKey.data(using: .utf8) else {
            print("Error: Failed to set a key.")
            return nil
        }
        guard initializationVector.count == kCCBlockSizeAES128, let ivData = initializationVector.data(using: .utf8) else {
            print("Error: Failed to set an initial vector.")
            return nil
        }
        key = keyData
        iv  = ivData
    }
  
  public static func randomString(of length: Int) -> String {
    if length < 1 {
      return "randomString argument passed for id is empty"
    }
    let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    var s = ""
    for _ in 0 ..< length {
      s.append(letters.randomElement()!)
    }
    return s
  }
    
    /**
     Generate 256SHA Key for a given String
     */
    static public func sha256(_ key: String, length: Int) -> String? {
        
        let s = key.cString(using: String.Encoding.ascii)
        let keyData = NSData.init(bytes: s, length: strlen(s!))
        let digestLength = Int(CC_SHA256_DIGEST_LENGTH)
        var hashValue = [UInt8](repeating: 0, count: digestLength)
        CC_SHA256(keyData.bytes, UInt32(keyData.length), &hashValue)
        let out = NSData.init(bytes: hashValue, length: digestLength)
        
        if out.length == 0{
            return nil
        }
        
        let buffer  = UnsafeRawBufferPointer(start: out.bytes, count: out.length)
        let hexString = NSMutableString.init(capacity: (out.length * 2))
        for i in 0..<out.length{
            hexString.appendFormat("%02x", buffer[i])
        }
        let hash = hexString
        hash.replacingOccurrences(of: " ", with: "")
        hash.replacingOccurrences(of: "<", with: "")
        hash.replacingOccurrences(of: ">", with: "")
        if out.length > hash.length{
            return hash as String
        }
        else{
            return hash.substring(to: out.length)
        }
    }
    
    /**
     Encrypt a given String
     */
    public func encrypt(string: String) -> Data? {
        return crypt(data: string.data(using: .utf8), option: CCOperation(kCCEncrypt))
    }
    
    /**
     Decrypts the encrypted string
     */
    public func decrypt(data: Data?) -> String? {
        guard let decryptedData = crypt(data: data, option: CCOperation(kCCDecrypt)) else { return nil }
        return String(bytes: decryptedData, encoding: .utf8)
    }
    
    /**
     Crypto logic for encryption and decryption
     */
    public func crypt(data: Data?, option: CCOperation) -> Data? {
        guard let data = data else { return nil }
        
        let cryptLength = data.count + kCCBlockSizeAES128
        var cryptData   = Data(count: cryptLength)
        
        let keyLength = key.count
        let options   = CCOptions(kCCOptionPKCS7Padding)
        
        var bytesLength = Int(0)
        
        let status = cryptData.withUnsafeMutableBytes { cryptBytes in
            data.withUnsafeBytes { dataBytes in
                iv.withUnsafeBytes { ivBytes in
                    key.withUnsafeBytes { keyBytes in
                        CCCrypt(option, CCAlgorithm(kCCAlgorithmAES), options, keyBytes.baseAddress, keyLength, ivBytes.baseAddress, dataBytes.baseAddress, data.count, cryptBytes.baseAddress, cryptLength, &bytesLength)
                    }
                }
            }
        }
        
        guard UInt32(status) == UInt32(kCCSuccess) else {
            return nil
        }
        
        cryptData.removeSubrange(bytesLength..<cryptData.count)
        return cryptData
    }
    
    /**
     Encrypts the file at a given path
     - parameter path: Folder path of the  file to be encrypted
     - parameter fileName: name of the file to be encrypted
     - returns : (URL?,String?) Tuple contains encrypted file name and encryption key
     */
    public static func encryptFile(at path : URL, fileName : String)-> (URL?,String?) {
        let fileManager = FileManager.default
        let filePath = path.appendingPathComponent(fileName)
        if fileManager.fileExists(atPath: filePath.path){
            let fileNameArray = fileName.components(separatedBy: ".")
            guard let fileNameString = fileNameArray.first , let extensionString = fileNameArray.last else {
                return (nil,nil)
            }
            guard let key = try? randomString(of: 32), let data = try? Data(contentsOf: URL(fileURLWithPath: filePath.path)) else {
                return (nil,nil)
            }
            let encryptedFileName = "\(fileNameString)-encrypted.\(extensionString)"
            if let hashedKey = FlyEncryption.sha256(key, length: 32) , let flyEncryption = FlyEncryption(encryptionKey: hashedKey, initializationVector: "FlyDefaults.IV" ){
                guard let encryptedData = flyEncryption.crypt(data: data, option: CCOperation(kCCEncrypt)) else { return (nil,nil) }
                let _ = encryptedData.base64EncodedData().write(withName: encryptedFileName , path: path)
                return (path.appendingPathComponent(encryptedFileName),key)
            }
        }
        return (nil,nil)
    }
    
    /**
     Decrypts the file at a given path
     - parameter path: Folder path of the  file to be decrypted
     - parameter fileName: name of the file to be decrypted
     - returns : (URL?,String?) Tuple contains decrypted file path and decrypted file name
     */
    public static func decryptFile(at path : URL, fileName : String, key :String) -> (URL?,String?) {
        let fileManager = FileManager.default
        let filePath = path.appendingPathComponent(fileName)
        if fileManager.fileExists(atPath: filePath.path){
            if let hashedKey = FlyEncryption.sha256(key, length: 32) , let flyEncryption = FlyEncryption(encryptionKey: hashedKey, initializationVector: "FlyDefaults.IV" ){
                guard let base64ByteData =  try? Data(contentsOf:   filePath) else { return (nil,nil) }
                if let base64DecodedByteData = Data(base64Encoded: base64ByteData){
                    if let decryptedData = flyEncryption.crypt(data: base64DecodedByteData, option:  CCOperation(kCCDecrypt)){
                        let _ = try? fileManager.removeItem(at: filePath)
                        let _ = decryptedData.write(withName: fileName, path: path)
                        return (filePath, fileName)
                    }
                }
            }
        }
        return (nil,nil)
    }
    
    public func encryptDecryptData(key:String, data : String, encrypt : Bool) -> String{
        guard let key = FlyEncryption.sha256(key, length: 32) else {
            return data
        }
        guard let flyEncryption = FlyEncryption(encryptionKey: key, initializationVector: "FlyDefaults.profileIV") else {
            return data
        }
        if encrypt {
            guard let htmlEncoding = FlyEncryption.htmlEncoding(content: data, isEncode: true) else{
                return data
            }
            guard let encryptedData  = flyEncryption.encrypt(string: htmlEncoding) else {
                return data
            }
            return encryptedData.base64EncodedString()
        } else {
            guard let decryptedData  = flyEncryption.decrypt(data:Data(base64Encoded: data)) else {
                return data
            }
            guard let htmlDecodedString = FlyEncryption.htmlEncoding(content: decryptedData, isEncode: false) else{
                return data
            }
            return htmlDecodedString
        }
    }
    
    static func encryptDecryptData(key:String, data : String, encrypt : Bool, iv : String = "FlyDefaults.profileIV", isForProfileName : Bool = false) -> String{
        guard let key = FlyEncryption.sha256(key, length: 32) else {
            return data
        }
        guard let flyEncryption = FlyEncryption(encryptionKey: key, initializationVector: iv ) else {
            return data
        }
        if encrypt {
            guard let htmlEncoding = htmlEncoding(content: data, isEncode: true) else{
                return data
            }
            guard let encryptedData  = flyEncryption.encrypt(string: htmlEncoding) else {
                return data
            }
            return encryptedData.base64EncodedString()
        } else {
            guard var decryptedData  = flyEncryption.decrypt(data:Data(base64Encoded: data)) else {
                return data
            }
            
            if isForProfileName {
                decryptedData = decryptedData.replacingOccurrences(of: "+", with: "%20")
            }
            
            guard let htmlDecodedString = htmlEncoding(content: decryptedData, isEncode: false) else{
                return data
            }
            return htmlDecodedString
        }
    }
    
    public static func htmlEncoding(content: String, isEncode : Bool)-> String? {
        if isEncode {
            let data = Data(content.utf8)
            var encodedString = String(data: data, encoding: .utf8)!
            encodedString = encodedString.replacingOccurrences(of: "\\/", with: "/")
            encodedString = encodedString.addingPercentEncoding(withAllowedCharacters: CharacterSet.urlHostAllowed) ?? ""
            let URLBase64CharacterSet = CharacterSet(charactersIn: "/+=\n").inverted
            encodedString = encodedString.addingPercentEncoding(withAllowedCharacters: URLBase64CharacterSet) ?? ""
            return encodedString
        } else {
            return content.removingPercentEncoding
        }
    }
}

extension Data {

    public func write(withName name: String, path : URL) -> URL {

        let url = path.appendingPathComponent(name)

        try! write(to: url, options: .atomicWrite)

        return url
    }
}

