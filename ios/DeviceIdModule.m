//
//  DeviceIdModule.m
//  mirrorfly_rn
//
//  Created by user on 24/04/25.

// DeviceIdModule.m
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>


@interface RCT_EXTERN_MODULE(DeviceId, NSObject)
RCT_EXTERN_METHOD(getDeviceID:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end

