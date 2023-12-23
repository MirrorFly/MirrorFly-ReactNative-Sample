#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
// Push notification set-up.
#import <UserNotifications/UserNotifications.h>
#import <React/RCTAsyncLocalStorage.h>
#import <RNCPushNotificationIOS.h>
#import "mirrorfly_rn-Swift.h"
//==========================
#import <React/RCTAppSetupUtils.h>

// Voip Notification
#import <PushKit/PushKit.h>
#import <RNVoipPushNotificationManager.h>
#import <RNCallKeep.h>
#import <CallKit/CallKit.h>
#import <RNKeyEvent.h>

#if RCT_NEW_ARCH_ENABLED
#import <React/CoreModulesPlugins.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <ReactCommon/RCTTurboModuleManager.h>

#import <react/config/ReactNativeConfig.h>

static NSString *const kRNConcurrentRoot = @"concurrentRoot";

@interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
  RCTTurboModuleManager *_turboModuleManager;
  RCTSurfacePresenterBridgeAdapter *_bridgeAdapter;
  std::shared_ptr<const facebook::react::ReactNativeConfig> _reactNativeConfig;
  facebook::react::ContextContainer::Shared _contextContainer;
}
@end
#endif

@implementation AppDelegate


// Required for the register event (Push notification set-up).==========================================
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  if (@available(iOS 10.0, *)) {
    [UNUserNotificationCenter currentNotificationCenter].delegate = (id<UNUserNotificationCenterDelegate>) self;
  }
//  [[UIApplication sharedApplication] registerForRemoteNotifications];
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSLog(@"[RNCPushNotificationIOS didReceiveRemoteNotification userInfo]%@", userInfo);
  // Commented because of automatically opens chat-screen when more that 2 notification received
   [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event // Called when a user taps on a notification in the foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
  NSMutableDictionary *userData = [NSMutableDictionary dictionaryWithDictionary:response.notification.request.content.userInfo];
  [userData setObject:@YES forKey:@"userInteraction"];
  [RNCPushNotificationIOS didReceiveRemoteNotification:userData];
  NSLog(@"[RNCPushNotificationIOS didReceiveRemoteNotification userData]%@", userData);
  completionHandler();
}
//===========================================================================================================
- (BOOL)application:(UIApplication *)application
didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  // Define UNUserNotificationCenter // Push notification set-up.============================================
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  UNAuthorizationOptions options = UNAuthorizationOptionAlert + UNAuthorizationOptionSound;
  [center requestAuthorizationWithOptions:options
   completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if (!granted) {
      NSLog(@"Something went wrong");
    }
  }];
  
  [application registerForRemoteNotifications];
  //===========================================================================================================
  [FIRApp configure];
  RCTAppSetupPrepareApp(application);

  // --- register VoipPushNotification here ASAP rather than in JS. Doing this from the JS side may be too slow for some use cases
  // --- see: https://github.com/react-native-webrtc/react-native-voip-push-notification/issues/59#issuecomment-691685841  
  [RNVoipPushNotificationManager voipRegistration];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

#if RCT_NEW_ARCH_ENABLED
  _contextContainer = std::make_shared<facebook::react::ContextContainer const>();
  _reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();
  _contextContainer->insert("ReactNativeConfig", _reactNativeConfig);
  _bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc] initWithBridge:bridge contextContainer:_contextContainer];
  bridge.surfacePresenter = _bridgeAdapter.surfacePresenter;
#endif

  NSDictionary *initProps = [self prepareInitialProps];
  UIView *rootView = RCTAppSetupDefaultRootView(bridge, @"mirrorfly_rn", initProps);

  if (@available(iOS 13.0, *)) {
    rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}
// Push notification set-up.==================================================================================
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{

    //Still call the javascript onNotification handler so it can display the new message right away
  
//    NSDictionary *userInfo = notification.request.content.userInfo;
//    [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo];

    //hide push notification
    completionHandler(UNNotificationPresentationOptionAlert);
}
//=============================================================================================================
/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feture is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  // Switch this bool to turn on and off the concurrent root
  return true;
}

- (NSDictionary *)prepareInitialProps
{
  NSMutableDictionary *initProps = [NSMutableDictionary new];

#ifdef RCT_NEW_ARCH_ENABLED
  initProps[kRNConcurrentRoot] = @([self concurrentRootEnabled]);
#endif

  return initProps;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// MARK: - VoIP Notification - Receive token
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

  // --- Process the received push
  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

  if(count < 1) {
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
  }else{
      // Report and end invalid call
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
      [RNCallKeep endCallWithUUID:uuid reason:2];
  }

  
  // --- You don't need to call it if you stored `completion()` and will call it on the js side.
  completion();
}
#if RCT_NEW_ARCH_ENABLED

#pragma mark - RCTCxxBridgeDelegate

- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  _turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                             delegate:self
                                                            jsInvoker:bridge.jsCallInvoker];
  return RCTAppSetupDefaultJsExecutorFactory(bridge, _turboModuleManager);
}

#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  return RCTCoreModulesClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return nullptr;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                     initParams:
                                                         (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return RCTAppSetupDefaultModuleFromClass(moduleClass);
}

#endif

/*!
 * react-native-keyevent support
 */
RNKeyEvent *keyEvent = nil;

- (NSMutableArray<UIKeyCommand *> *)keyCommands {
  NSMutableArray *keys = [NSMutableArray new];
  
  if (keyEvent == nil) {
    keyEvent = [[RNKeyEvent alloc] init];
  }
  
  if ([keyEvent isListening]) {
    NSArray *namesArray = [[keyEvent getKeys] componentsSeparatedByString:@","];
    
    NSCharacterSet *validChars = [NSCharacterSet characterSetWithCharactersInString:@"ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
    
    for (NSString* names in namesArray) {
      NSRange  range = [names rangeOfCharacterFromSet:validChars];
      
      if (NSNotFound != range.location) {
        [keys addObject: [UIKeyCommand keyCommandWithInput:names modifierFlags:UIKeyModifierShift action:@selector(keyInput:)]];
      } else {
        [keys addObject: [UIKeyCommand keyCommandWithInput:names modifierFlags:0 action:@selector(keyInput:)]];
      }
    }
  }
  
  return keys;
}

- (void)keyInput:(UIKeyCommand *)sender {
  NSString *selected = sender.input;
  [keyEvent sendKeyEvent:selected];
}

@end
