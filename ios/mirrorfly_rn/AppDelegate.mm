#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>

// add the below imports
#import <PushKit/PushKit.h>
#import <RNVoipPushNotificationManager.h>
#import <RNCallKeep.h>
#import <CallKit/CallKit.h>
#import <RNKeyEvent.h>
#import <AVFoundation/AVFoundation.h>
#import <UIKit/UIKit.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  self.moduleName = @"mirrorfly_rn";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  
  [RNVoipPushNotificationManager voipRegistration]; // <- add this line just before the below line

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// add the below mentioned codes just before the last `@end` line of the file.
// VoIP configuration section starts here
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)pushCredentials forType:(PKPushType)type
{
  [RNVoipPushNotificationManager didUpdatePushCredentials:pushCredentials forType:(NSString *)type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
{
  // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
}

// --- Handle incoming pushes
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)())completion
{

  // --- NOTE: apple forced us to invoke callkit ASAP when we receive voip push
  // --- see: react-native-callkeep

  // --- Retrieve information from your voip push payload
  NSString *uuid = [[NSUUID UUID] UUIDString];
  NSString *callerName = payload.dictionaryPayload[@"caller_name"];
  NSString *handle = payload.dictionaryPayload[@"caller_id"];
  NSString *callerId = [[handle componentsSeparatedByString:@"@"] objectAtIndex:0];
  NSString *hasvideoValue = payload.dictionaryPayload[@"call_type"];
  BOOL hasvideo = [hasvideoValue isEqualToString:@"video"] ? YES : NO;
  CXCallObserver *callObserver = [[CXCallObserver alloc] init];
  NSInteger count = callObserver.calls.count;
  
  // --- this is optional, only required if you want to call `completion()` on the js side
  [RNVoipPushNotificationManager addCompletionHandler:uuid completionHandler:completion];

  if(count < 1) {
    
  //  Check the Mic permission and if the permission is not provided then end the call

    AVAuthorizationStatus micPermissionStatus = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeAudio];
    
    [RNCallKeep reportNewIncomingCall: uuid
                               handle: callerId
                           handleType: @"generic"
                             hasVideo: hasvideo
                  localizedCallerName: callerId
                      supportsHolding: YES
                         supportsDTMF: YES
                     supportsGrouping: YES
                   supportsUngrouping: YES
                          fromPushKit: YES
                              payload: [payload dictionaryPayload]
                withCompletionHandler: completion];
    
    if (micPermissionStatus != AVAuthorizationStatusAuthorized) {
      [RNCallKeep endCallWithUUID:uuid reason:1]; // ending the call with reason Failed

        if (micPermissionStatus == AVAuthorizationStatusNotDetermined) {
          [AVCaptureDevice requestAccessForMediaType:AVMediaTypeAudio completionHandler:^(BOOL granted) {}];
      }
      
      // Showing local notification for the ended incoming call
      UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
      content.title = callerId;
      content.body = [NSString stringWithFormat:@"You missed %@ %@. Please enable permission in App Settings to help you connect with your friends.", hasvideo ? @"a" : @"an", hasvideo ? @"video call" : @"audio call"];
      content.sound = [UNNotificationSound defaultSound];

      UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:@"ImmediateNotification"
                                                                            content:content
                                                                            trigger:nil];

      UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
      [center addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
          if (error) {
              NSLog(@"Error scheduling local notification: %@", error);
          }
      }];
    }
  }else{
    // --- sending the received push to JS for the incoming call (while the user is already on a call) to send busy status to the caller
    [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];
  }
  
  // --- You don't need to call it if you stored `completion()` and will call it on the js side.
  completion();
}
// VoIP configuration section ends here

@end
