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
   NSString *userjid = [self.bestAttemptContent.userInfo objectForKey:@"from_user"];
   NSString *message_id = [self.bestAttemptContent.userInfo objectForKey:@"message_id"];
   NSLog(@"[NotificationService messagecontent]%@ ", messagecontent );
   NSLog(@"[NotificationService userjid]%@ ", userjid);
  @autoreleasepool {
    MyClass * obj = [MyClass new];
    NSString *res = [obj runWithMessageID: message_id content:messagecontent];
    NSString *jsonString = res;

    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;

    id jsonObject = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];

    if ([jsonObject isKindOfClass:[NSDictionary class]]) {
        NSDictionary *jsonDict = (NSDictionary *)jsonObject;
        
        NSString *message = jsonDict[@"message"];
        NSString *messageType = jsonDict[@"message_type"];
        NSArray *mentionedUserIds = jsonDict[@"mentionedUsersIds"];
        NSString *nickName = jsonDict[@"nickName"];
        
        NSLog(@"Message: %@", message);
        NSLog(@"Message Type: %@", messageType);
        NSLog(@"Mentioned User IDs: %@", mentionedUserIds);
        NSLog(@"Nick Name: %@", nickName);
        NSLog(@"[NotificationService res]%@", res);
        self.bestAttemptContent.title = nickName;
        self.bestAttemptContent.body = message;
    } else {
        NSLog(@"Error parsing JSON: %@", error);
    }
 
  }
    // Modify the notification content here...
//    self.bestAttemptContent.title = [NSString stringWithFormat:@"%@ [modified]", self.bestAttemptContent.title];
    
    self.contentHandler(self.bestAttemptContent);
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
