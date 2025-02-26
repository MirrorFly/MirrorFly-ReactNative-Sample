//
//  EncryptionAlgorithm.swift
//  CompletionHandlerApi
//
//  Created by Villian Raja on 4/29/21.
//

import Foundation
import CommonCrypto
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
      let key = randomString(of: 32)
      let data = try? Data(contentsOf: URL(fileURLWithPath: filePath.path))
      let encryptedFileName = "\(fileNameString)-encrypted.\(extensionString)"
      if let hashedKey = FlyEncryption.sha256(key, length: 32) , let flyEncryption = FlyEncryption(encryptionKey: hashedKey, initializationVector: "profileIV" ){
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
      if let hashedKey = FlyEncryption.sha256(key, length: 32) , let flyEncryption = FlyEncryption(encryptionKey: hashedKey, initializationVector: "profileIV"){
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
    guard let flyEncryption = FlyEncryption(encryptionKey: key, initializationVector: "profileIV") else {
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
  
  static func encryptDecryptData(key:String, data : String, encrypt : Bool, iv : String = "profileIV") -> String{
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
      guard let decryptedData  = flyEncryption.decrypt(data:Data(base64Encoded: data)) else {
        return data
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
  
  public static func encryptDecryptData(key:String, data : String, encrypt : Bool, iv : String = "ckIjaccWBoMNvxdbql8LJ2dmKqT5bp", isForProfileName : Bool = false) -> String{
          guard let key = FlyEncryption.sha256(key, length: 32) else {
              return data
          }
          guard let flyEncryption = FlyEncryption(encryptionKey: key, initializationVector: iv ) else {
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
  //            if !FlyUtils.isValidBase64(input: data){
  //                return data
  //            }
              if !data.isEmpty {
                  guard var decryptedData = flyEncryption.decrypt(data:Data(base64Encoded: data)) else {
                      return data
                  }
                  
                  if isForProfileName {
                      decryptedData = decryptedData.replacingOccurrences(of: "+", with: "%20")
                  }
                  
                guard let htmlDecodedString = FlyEncryption.htmlEncoding(content: decryptedData, isEncode: false) else{
                      return data
                  }
                  return htmlDecodedString
              }
              return data
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

