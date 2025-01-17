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
                  msgId:(NSString *)msgId
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

RCT_EXTERN_METHOD(encryptFile:(NSDictionary *)obj
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(decryptFile:(NSString *)inputFilePath 
                  keyString:(NSString *)keyString
                  iv:(NSString *)iv
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(startDownload:(NSString *)downloadURL
                  msgId:(NSString *)msgId
                  fileSize:(nonnull NSNumber *)fileSize
                  chunkSize:(nonnull NSNumber *)chunkSize
                  cachePath:(NSString *)cachePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancelDownload:(NSString *)msgId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancelAllDownloads:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(pauseDownload:(NSString *)msgId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
