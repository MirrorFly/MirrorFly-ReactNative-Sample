//
//  MyClass.swift
//  NotificationExtension
//
//  Created by user on 28/09/23.
//

import Foundation
import CommonCrypto
import UserNotifications

@objc
class MyClass: NSObject {
  
  @objc
  func run(messageID: String, content: String) -> String {
    guard let key = FlyEncryption.sha256(messageID, length: 32) else {
      return content
    }
    guard let flyEncryption = FlyEncryption(encryptionKey: key, initializationVector: "ddc0f15cc2c90fca") else {
      return content
    }
    guard let decryptedData = flyEncryption.decrypt(data:Data(base64Encoded: content)) else {
      return content
    }
    guard let htmlDecodedString = FlyEncryption.htmlEncoding(content: decryptedData, isEncode: false) else{
      return content
    }
    return htmlDecodedString
  }
  
  @objc
  func getMessage(messageID: String, content: String, type:String, userjid:String, completion: @escaping([String: Any]?) -> Void) {
    var dict = [String: Any]()
    removeInvalidMessage(forIDs: [messageID], onCompletion: {
      notification in
  
      switch (type) {
      case "text":
        let val = convertToDictionary(text: self.run(messageID: messageID, content: content))
        let nickName:String = val?["nickName"] as? String ?? ""
        if let number = userjid.components(separatedBy: "@").first, !number.isEmpty {
            dict["nickName"] = FlyEncryption.encryptDecryptData(key: number, data: nickName, encrypt: false, isForProfileName: true)
        } else {
            dict["nickName"] = nickName // Fallback in case `number` is nil or empty
        }
        dict["message"] = val?["message"]
        break;
      case "image":
        dict["message"] = "📷 Image"
        break;
      case "video":
        dict["message"] = "📽️ Video"
        break;
      case "audio":
        dict["message"] = "🎵 Audio"
        break;
      case "file":
        dict["message"] = "📄 File"
        break;
      case "location":
        dict["message"] = "📌 Location"
        break;
      case "contact":
        dict["message"] = "👤 Contact"
        break;
      case "recall":
        // Need to called for recall message
      //  removeNotification(messageId: messageID, n: notification)
        dict["messageID"]  = messageID
        dict["message"] = "This message was deleted"
        break;
      default:
        dict["message"] = "Unknown message format"
        break
      }
      
      DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + Double(1.0 * Double(NSEC_PER_SEC)) / Double(NSEC_PER_SEC), execute: { [self] in
        completion(dict)
      })
//      completion(dict)
    })
  }
}


func convertToDictionary(text: String) -> [String: Any]? {
  if let data = text.data(using: .utf8) {
    do {
      return try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
    } catch {
      print(error.localizedDescription)
    }
  }
  return nil
}

func removeInvalidMessage(forIDs IDs: [String]?, onCompletion: @escaping ((_ isNotificationAvailable: Bool) -> Void)) {
        let center = UNUserNotificationCenter.current()
        getNotificationsForIds(IDs, onCompletion: { resultNotificationsArray in
            if (resultNotificationsArray?.count ?? 0) != 0 {
                var removableNotificationIds: [AnyHashable] = []
                for notif in resultNotificationsArray ?? [] {
                    guard let notif = notif as? UNNotification else {
                        continue
                    }
                    removableNotificationIds.append(notif.request.identifier)
                    print("Notiifcation Identifier \(notif.request.identifier)")
                    print("Notiifcation userInfo \(notif.request.content.userInfo)")
                }
               // center.removeAllPendingNotificationRequests()
                if let removableNotificationIds = removableNotificationIds as? [String] {
                  //  center.removeAllDeliveredNotifications()
                    center.removeDeliveredNotifications(withIdentifiers: removableNotificationIds)
                }
                print("Push Status Invalid message removed")
                onCompletion(true)
            } else {
                onCompletion(false)
                print("Push Status Invalid no message available")
            }
        })
    }

    /// It is used to get notifications from notification bar
    /// @param iDs IDs of alert to be removed
    /// @param onCompletion completin block
func getNotificationsForIds(_ iDs: [AnyHashable]?, onCompletion: @escaping ((_ notificationsArray: [AnyHashable]?) -> Void)) {
        let center = UNUserNotificationCenter.current()
        center.getDeliveredNotifications(completionHandler: { notifications in
            var predicate: NSPredicate? = nil
            if let iDs = iDs {
                print("ids \(iDs)")
                predicate = NSPredicate(format: "SELF.request.content.userInfo.message_id IN %@", iDs)
            }
            var resultNotificationsArray: [UNNotification]? = nil
            if let predicate = predicate {
                resultNotificationsArray = (notifications as NSArray).filtered(using: predicate) as? [UNNotification]
                print("resultNotificationArray \(resultNotificationsArray)")
            }
            onCompletion(resultNotificationsArray)
        })
    }


