#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
// Push notification set-up.
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate,
// Push notification set-up.
UNUserNotificationCenterDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
