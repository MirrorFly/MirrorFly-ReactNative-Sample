//
//  sendDeliveredApiCall.swift
//  NotificationExtension
//
//  Created by user on 29/09/23.
//

import Foundation


//func getTokenFromReactNative() -> String? {
//
//    let RCTStorageDirectory = "delivered_api_url"
//    let RCTManifestFileName = "mirrorFlyToken"
//
//    let fileManager = FileManager.default
//
//    let appSupportDirectory = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
//
//    let mySupportDirectory = appSupportDirectory!.appendingPathComponent(Bundle.main.bundleIdentifier!)
//
//    let storageDirectory = mySupportDirectory.appendingPathComponent(RCTStorageDirectory)
//
//    let storageFile = storageDirectory.appendingPathComponent(RCTManifestFileName)
//
//    if fileManager.fileExists(atPath: storageFile.path) {
//
//        do {
//
//            let stringFromFile = try String(contentsOf: storageFile, encoding: .utf8)
//
//            let data = stringFromFile.data(using: .utf8, allowLossyConversion: false)
//
//            let json = try? JSONSerialization.jsonObject(with: data!, options: .mutableContainers)
//
//            let dict = json as? [String: String]
//
//            return dict?["@token"] ?? nil
//
//        }
//        catch {
//
//            return nil
//
//        }
//
//    }
//
//    return nil
//
//}

//@objc
//class ApiCall: NSObject {
//  public func sendMessageReceivedStatusApiService( userInfo: [AnyHashable : Any]?,
//  completionHandler : @escaping ([String : Any]) -> Void) {
//    NSLog("sendMessageReceivedStatusApiService userInfo", userInfo!)
//  let url = "URL"
//  let message_Id = userInfo?["message_id"] as? String
//  var fromUser = userInfo?["from_user"] as? String
//  //Comes Only For Group Chat Push
//  var sentFrom = userInfo?["sent_from"] as? String
//  //Comes Only For Single Chat Push
//  var toUser = userInfo?["to_user"] as? String
//  var messageType = userInfo?["type"] as? String
//  let chatType = (userInfo?["chat_type"] as? String) ?? "chat"
//  let messageContent = userInfo?["message_content"] as? String
//  let messageTime = userInfo?["message_time"] as? String
//  var isGroup = false
//  var isCarbon = false
//  if chatType == "normal" {
//  isGroup = true
//  }
//  var params : [String : Any] = [:]
//  var lastMessageTime : Double? = nil
//  if FlyDefaults.lastMessageTime == "0" {
//  lastMessageTime = nil
//  }else{
//  lastMessageTime = FlyDefaults.lastMessageTime.replacingOccurrences(of: ".0", with:
//  "").toDouble()
//  }
//  if isGroup{
//  if (sentFrom ?? "") == FlyDefaults.myJid{
//  isCarbon = true
//  }
//  var groupId = (fromUser ?? "").components(separatedBy: "@").first!
//  params = [
//  "messageId": message_Id ?? "",
//  "messageTo": sentFrom ?? "",
//  "messageFrom" : FlyDefaults.myJid ,
//  "chatType" : chatType ,
//  "carbon" : isCarbon,
//  "groupId" : groupId,
//  "offline" : true,
//  "lastMessageDateTime" : lastMessageTime,
//  "deviceId" : FlyUtils.getDeviceID()
//  ]
//  }else{
//  if (fromUser ?? "") == FlyDefaults.myJid{
//  isCarbon = true
//
//  }
//  params = [
//  "messageId": message_Id ?? "",
//  "messageTo": isCarbon ? FlyDefaults.myJid : fromUser ?? "",
//  "messageFrom" : FlyDefaults.myJid ,
//  "chatType" : chatType ,
//  "carbon" : isCarbon,
//  "offline" : true,
//  "lastMessageDateTime" : lastMessageTime,
//  "deviceId" : FlyUtils.getDeviceID()
//  ]
//  }
//  print("#push-api userinfo \(userInfo)")
//  print("#push-api \(url) params \(params)")
//  let headers: HTTPHeaders
//  let authtoken = FlyDefaults.authtoken
//  headers = [
//  FlyConstants.authorization: authtoken]
//  // Call a method to make a request with serverz
//  RequestManager.shared.performPushPostRequest(restEnd: url, headers: headers,
//  method: .put, params: params) { [weak self] (isSuccess, flyError, flyData) in
//  var content : [String: Any] = [:]
//  if isSuccess {
//  if let messageContent = flyData["messageContent"] as?
//
//  [(String,String,String,NSNumber,String,String?,ProfileDetails?,metaData:String?,topicID:String?)]
//  {
//
//  content["messageContent"] = messageContent
//  }
//  }else{
//  content["messageContent"] = "You have pending messages"
//  print("#push-api Delivered Api Error")
//  }
//  completionHandler(content)
//  }
//  }
//
//}
