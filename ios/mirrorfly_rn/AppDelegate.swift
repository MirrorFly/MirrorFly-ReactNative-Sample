import UIKit
import AVFoundation
import Firebase
import PushKit
import CallKit
import RNVoipPushNotification
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, PKPushRegistryDelegate {
  var window: UIWindow?
  var keyEvent: RNKeyEvent?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Firebase
    // FirebaseApp.configure()
    
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)
    RCTI18nUtil.sharedInstance().allowRTL(true)
    
    // VoIP PushKit registration
    RNVoipPushNotificationManager.voipRegistration()

    factory.startReactNative(
      withModuleName: "mirrorfly_rn",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
  
  // MARK: - VoIP PushKit
  // VoIP configuration section starts here
  func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
    RNVoipPushNotificationManager.didUpdate(pushCredentials, forType: type.rawValue)
  }

  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
  }
  
  // --- Handle incoming pushes
  func pushRegistry(
      _ registry: PKPushRegistry,
      didReceiveIncomingPushWith payload: PKPushPayload,
      for type: PKPushType,
      completion: @escaping () -> Void
    ) {
      // --- NOTE: apple forced us to invoke callkit ASAP when we receive voip push
      // --- see: react-native-callkeep

      // --- Retrieve information from your voip push payload
      let uuid = UUID().uuidString
      let payloadDict = payload.dictionaryPayload
      let handle = payloadDict["caller_id"] as? String ?? "unknown@mirrorfly"
      let callerId = handle.components(separatedBy: "@").first ?? "unknown"
      let callerName = payloadDict["caller_name"] as? String ?? callerId
      let hasVideoValue = payloadDict["call_type"] as? String ?? "audio"
      let hasVideo = (hasVideoValue == "video")

      let callObserver = CXCallObserver()
      let activeCallCount = callObserver.calls.count
      
      // --- this is optional, only required if you want to call `completion()` on the js side
      RNVoipPushNotificationManager.addCompletionHandler(uuid, completionHandler: completion)

      if activeCallCount < 1 {
        //  Check the Mic permission and if the permission is not provided then end the call
        RNCallKeep.reportNewIncomingCall(
          uuid,
          handle: callerId,
          handleType: "generic",
          hasVideo: hasVideo,
          localizedCallerName: callerName,
          supportsHolding: true,
          supportsDTMF: true,
          supportsGrouping: true,
          supportsUngrouping: true,
          fromPushKit: true,
          payload: payloadDict,
          withCompletionHandler: completion
        )

        if hasVideo ? !checkVideoPermission() : !checkAudioPermission() {
          RNCallKeep.endCall(withUUID: uuid, reason: 1)

          // Showing local notification for the ended incoming call
          let content = UNMutableNotificationContent()
          content.title = callerId
          content.body = "You missed \(hasVideo ? "a" : "an") \(hasVideo ? "video call" : "audio call"). Please enable permission in App Settings."
          content.sound = .default

          let request = UNNotificationRequest(identifier: "ImmediateNotification", content: content, trigger: nil)
          UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
              print("Notification error: \(error)")
            }
          }
        }
      } else {
        // --- sending the received push to JS for the incoming call (while the user is already on a call) to send busy status to the caller
        RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)
      }
      // --- You don't need to call it if you stored `completion()` and will call it on the js side.
      completion()
    }
  
    // MARK: - Permissions
    func checkAudioPermission() -> Bool {
      let status = AVCaptureDevice.authorizationStatus(for: .audio)
      if status != .authorized {
        if status == .notDetermined {
          AVCaptureDevice.requestAccess(for: .audio) { _ in }
        }
        return false
      }
      return true
    }

    func checkVideoPermission() -> Bool {
      let micStatus = AVCaptureDevice.authorizationStatus(for: .audio)
      let videoStatus = AVCaptureDevice.authorizationStatus(for: .video)

      if videoStatus != .authorized || micStatus != .authorized {
        if videoStatus == .notDetermined {
          AVCaptureDevice.requestAccess(for: .video) { _ in }
        }
        if micStatus == .notDetermined {
          AVCaptureDevice.requestAccess(for: .audio) { _ in }
        }
        return false
      }
      return true
    }
  
   // MARK: - Deep Linking
   func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
     return RCTLinkingManager.application(app, open: url, options: options)
   }
  
  // MARK: - KeyEvent Support
  override var keyCommands: [UIKeyCommand]? {
    var commands: [UIKeyCommand] = []

    if keyEvent == nil {
      keyEvent = RNKeyEvent()
    }

    if keyEvent?.isListening() == true {
      let keys = (keyEvent?.getKeys() ?? "").components(separatedBy: ",")
      let validChars = CharacterSet.uppercaseLetters

      for key in keys {
        let hasModifier = key.rangeOfCharacter(from: validChars) != nil
        let command = UIKeyCommand(input: key, modifierFlags: hasModifier ? .shift : [], action: #selector(keyInput(_:)))
        commands.append(command)
      }
    }

    return commands
  }

  @objc func keyInput(_ sender: UIKeyCommand) {
    guard let key = sender.input else { return }
    keyEvent?.send(key)
  }
}


// MARK: - ReactNativeDelegate
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
