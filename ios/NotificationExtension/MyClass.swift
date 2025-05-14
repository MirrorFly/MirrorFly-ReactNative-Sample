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
  func getMessage(userInfo: [String: Any], completion: @escaping ([String: Any]?) -> Void) {
      var dict = [String: Any]()

      // Use empty strings if the keys are not present
      let messageID = userInfo["message_id"] as? String ?? userInfo["notify_id"] as? String ?? ""
      let content = userInfo["message_content"] as? String ?? ""
      let chat_type = userInfo["chat_type"] as? String ?? ""
      let group_name = userInfo["group_name"] as? String ?? ""
      let type = userInfo["type"] as? String ?? ""
      let userjid = userInfo["from_user"] as? String ?? ""

      
    if ["added", "removed"].contains(where: { content.contains($0) }) {
        if let aps = userInfo["aps"] as? [String: Any],
           let alert = aps["alert"] as? [String: Any],
           let body = alert["body"] as? String,
           let title = alert["title"] as? String,
           let groupName = userInfo["group_name"] as? String {

            let trimmedGroupName = groupName.trimmingCharacters(in: .whitespacesAndNewlines)
            var cleanBody = body.trimmingCharacters(in: .whitespacesAndNewlines)

            // Build a regex to match any variation like "group_name:", "group_name :", "group_name :  "
            let regexPattern = "^" + NSRegularExpression.escapedPattern(for: trimmedGroupName) + "\\s*:\\s*"

            if let regex = try? NSRegularExpression(pattern: regexPattern, options: [.caseInsensitive]) {
                let range = NSRange(location: 0, length: cleanBody.utf16.count)
                cleanBody = regex.stringByReplacingMatches(in: cleanBody, options: [], range: range, withTemplate: "")
                    .trimmingCharacters(in: .whitespacesAndNewlines)
            }

            dict["nickName"] = title
            dict["message"] = cleanBody

            DispatchQueue.main.async {
                completion(dict)
            }
            return
        }
    }
    
      removeInvalidMessage(forIDs: [messageID], onCompletion: { notification in
          switch type {
          case "text":
              let val = convertToDictionary(text: self.run(messageID: messageID, content: content))
              let rawNickName = val?["nickName"] as? String ?? ""
              let number = userjid.components(separatedBy: "@").first ?? ""

              var decryptedNickName = rawNickName
              if !number.isEmpty {
                  decryptedNickName = FlyEncryption.encryptDecryptData(key: number, data: rawNickName, encrypt: false, isForProfileName: true)
              }

              // Optionally prepend group name if it's a group chat
              if chat_type == "normal", let groupName = userInfo["group_name"] as? String {
                  dict["nickName"] = "\(groupName)@ \(decryptedNickName)"
              } else {
                  dict["nickName"] = decryptedNickName
              }

              dict["message"] = val?["message"]
          case "image":
              dict["message"] = "📷 Image"
          case "video":
              dict["message"] = "📽️ Video"
          case "audio":
              dict["message"] = "🎵 Audio"
          case "file":
              dict["message"] = "📄 File"
          case "location":
              dict["message"] = "📌 Location"
          case "contact":
              dict["message"] = "👤 Contact"
          case "recall":
              dict["messageID"] = messageID
              dict["message"] = "This message was deleted"
          default:
              dict["message"] = "Unknown message format"
          }
        
        if (dict["nickName"] == nil || (dict["nickName"] as? String)?.isEmpty == true),
           let groupName = userInfo["group_name"] as? String {
            dict["nickName"] = groupName
        }
          // Call completion with the final dict
          DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + Double(1.0 * Double(NSEC_PER_SEC)) / Double(NSEC_PER_SEC), execute: { [self] in
              completion(dict)
          })
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


