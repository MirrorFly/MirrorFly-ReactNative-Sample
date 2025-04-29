//
//  DeviceIdModule.swift
//  mirrorfly_rn
//
//  Created by user on 24/04/25.
//
import React
import Foundation
import UIKit
import Security

@objc(DeviceId)
class DeviceId: NSObject {
  let key = "com.mirrorfly.deviceid"
  @objc
   func getDeviceID(
     _ resolve: @escaping RCTPromiseResolveBlock,
     rejecter reject: @escaping RCTPromiseRejectBlock
   ) {
     if let data = KeychainHelper.load(key: key),
        let existingUUID = String(data: data, encoding: .utf8) {
       resolve(existingUUID)
     } else {
       let uuid = UUID().uuidString.replacingOccurrences(of: "-", with: "")
       let shortened = String(uuid.prefix(8))
       if KeychainHelper.save(key: key, data: shortened.data(using: .utf8)!) {
         resolve(shortened)
       } else {
         reject("DEVICE_ID_ERROR", "Failed to save UUID to Keychain", nil)
       }
     }
   }
}


class KeychainHelper {

  static func save(key: String, data: Data) -> Bool {
    let query = [
      kSecClass: kSecClassGenericPassword,
      kSecAttrAccount: key,
      kSecValueData: data
    ] as CFDictionary

    SecItemDelete(query) // delete existing
    let status = SecItemAdd(query, nil)
    return status == errSecSuccess
  }

  static func load(key: String) -> Data? {
    let query = [
      kSecClass: kSecClassGenericPassword,
      kSecAttrAccount: key,
      kSecReturnData: kCFBooleanTrue!,
      kSecMatchLimit: kSecMatchLimitOne
    ] as CFDictionary

    var dataTypeRef: AnyObject?
    let status = SecItemCopyMatching(query, &dataTypeRef)
    if status == errSecSuccess {
      return dataTypeRef as? Data
    }
    return nil
  }
}

