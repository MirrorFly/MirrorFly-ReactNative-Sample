//
//  NotificationService.m
//  NotificationExtension
//
//  Created by user on 27/09/23.
//

#import "NotificationService.h"
#import "NotificationExtension-Swift.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
  self.contentHandler = contentHandler;
  self.bestAttemptContent = [request.content mutableCopy];
  NSDictionary *userInfo = [self.bestAttemptContent userInfo];
  NSString *message_id = [self.bestAttemptContent.userInfo objectForKey:@"message_id"];
  NSString *user_name = [self.bestAttemptContent.userInfo objectForKey:@"user_name"];;

  @autoreleasepool {
    MyClass * obj = [MyClass new];
    [obj getMessageWithUserInfo:userInfo completion:^(NSDictionary<NSString *,id> *dict){
      if(dict){
        self.bestAttemptContent.threadIdentifier =  dict[@"messageID"] ? dict[@"messageID"]: message_id;
        NSString *nickName =  dict[@"nickName"];
        if (nickName) {
          self.bestAttemptContent.title =  dict[@"nickName"];
        } else {
          self.bestAttemptContent.title = user_name;
          // Handle the case where both nickName and user_name are nil
          // Optional: set a default title
        }
        self.bestAttemptContent.sound = [UNNotificationSound defaultSound];
        self.bestAttemptContent.body = dict[@"message"];
        self.contentHandler(self.bestAttemptContent);
      } else{
        self.contentHandler(self.bestAttemptContent);
      }
    }];
  }
}

- (void)serviceExtensionTimeWillExpire {
  // Called just before the extension will be terminated by the system.
  // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
  self.contentHandler(self.bestAttemptContent);
}

@end
