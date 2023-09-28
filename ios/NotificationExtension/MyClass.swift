//
//  MyClass.swift
//  NotificationExtension
//
//  Created by user on 28/09/23.
//

import Foundation
import CommonCrypto

@objc
class MyClass: NSObject {
  @objc
  func run(messageID: String, content: String) -> String {
    NSLog("MyClass [NotificationService messageID] ", messageID);
    NSLog("MyClass [NotificationService content] ", content);
    guard let key = FlyEncryption.sha256(messageID, length: 32) else {
      return content
    }
    NSLog("MyClass [NotificationService key] ", key);
    guard let flyEncryption = FlyEncryption(encryptionKey: key, initializationVector: "ddc0f15cc2c90fca") else {
      return content
    }
    guard let decryptedData = flyEncryption.decrypt(data:Data(base64Encoded: content)) else {
      return content
    }
    NSLog("MyClass [NotificationService decryptedData] ", decryptedData);
    guard let htmlDecodedString = FlyEncryption.htmlEncoding(content: decryptedData, isEncode: false) else{
      return content
    }
    return htmlDecodedString
  }
}
