//
//  MediaServiceBridge.m
//  mirrorfly_rn
//
//  Created by user on 02/01/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MediaService, NSObject)

// Declare the baseUrlInit method here
RCT_EXTERN_METHOD(baseUrlInit:(NSString *)url
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(uploadFileInChunks:(NSArray *)uploadUrls
                  filePath:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(downloadFileInChunks:(NSString *)downloadURL
                  fileSize:(nonnull NSNumber *)fileSize
                  cachePath:(NSString *)cachePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(defineValues:(NSDictionary *)obj
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
