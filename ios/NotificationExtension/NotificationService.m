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
  NSString *messagecontent = [self.bestAttemptContent.userInfo objectForKey:@"message_content"];
  NSString *messagetype = [self.bestAttemptContent.userInfo objectForKey:@"type"];
  NSString *userjid = [self.bestAttemptContent.userInfo objectForKey:@"from_user"];
  NSString *message_id = [self.bestAttemptContent.userInfo objectForKey:@"message_id"];
  @autoreleasepool {
    MyClass * obj = [MyClass new];
    [obj getMessageWithMessageID:message_id content:messagecontent type:messagetype completion:^(NSDictionary<NSString *,id> * dict) {
      self.bestAttemptContent.threadIdentifier =  dict[@"messageID"] ? dict[@"messageID"]: message_id;
      self.bestAttemptContent.title =  dict[@"nickName"];
      self.bestAttemptContent.body = dict[@"message"];
      self.contentHandler(self.bestAttemptContent);
    }];
  }
}

- (void)serviceExtensionTimeWillExpire {
  // Called just before the extension will be terminated by the system.
  // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
  self.contentHandler(self.bestAttemptContent);
}

@end
