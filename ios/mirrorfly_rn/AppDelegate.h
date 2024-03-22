#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
// Push notification set-up.
#import <UserNotifications/UserNotifications.h>
#import <PushKit/PushKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate,
// Push notification set-up.
UNUserNotificationCenterDelegate,PKPushRegistryDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
