#import <React/RCTBridgeModule.h>
#import <Photos/Photos.h>
#import <MobileCoreServices/MobileCoreServices.h>

@interface MediaConverter : NSObject <RCTBridgeModule>
@end

@implementation MediaConverter

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(convertMedia:(NSString *)uri
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if ([uri hasPrefix:@"ph://"]) {
    NSString *assetID = [uri stringByReplacingOccurrencesOfString:@"ph://" withString:@""];
    PHFetchResult<PHAsset *> *result = [PHAsset fetchAssetsWithLocalIdentifiers:@[assetID] options:nil];
    
    if (result.count == 0) {
      reject(@"E_PHOTO_NOT_FOUND", @"Photo not found", nil);
      return;
    }
    
    PHAsset *asset = result.firstObject;
    
    if (asset.mediaType == PHAssetMediaTypeImage) {
      // Handle image conversion
      [self convertImageAsset:asset resolver:resolve rejecter:reject];
    } else if (asset.mediaType == PHAssetMediaTypeVideo) {
      // Handle video conversion
      [self convertVideoAsset:asset resolver:resolve rejecter:reject];
    } else {
      reject(@"E_UNSUPPORTED_MEDIA_TYPE", @"Unsupported media type", nil);
    }
  } else {
    reject(@"E_INVALID_URI", @"Invalid URI format", nil);
  }
}

- (void)convertImageAsset:(PHAsset *)asset
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject
{
  PHImageRequestOptions *options = [[PHImageRequestOptions alloc] init];
  options.synchronous = YES;
  options.networkAccessAllowed = YES;

  [[PHImageManager defaultManager] requestImageDataForAsset:asset options:options resultHandler:^(NSData *imageData, NSString *dataUTI, UIImageOrientation orientation, NSDictionary *info) {
    if (imageData) {
      NSString *fileExtension = (__bridge_transfer NSString *)UTTypeCopyPreferredTagWithClass((__bridge CFStringRef)dataUTI, kUTTagClassFilenameExtension);
      NSString *filePath = [NSTemporaryDirectory() stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.%@", [[NSUUID UUID] UUIDString], fileExtension]];
      
      NSError *error = nil;
      [imageData writeToFile:filePath options:NSDataWritingAtomic error:&error];
      
      if (error) {
        reject(@"E_FILE_SAVE_FAILED", @"Failed to save image file", error);
      } else {
        resolve(filePath);
      }
    } else {
      reject(@"E_IMAGE_REQUEST_FAILED", @"Failed to get image data", nil);
    }
  }];
}

- (void)convertVideoAsset:(PHAsset *)asset
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject
{
  PHVideoRequestOptions *options = [[PHVideoRequestOptions alloc] init];
  options.networkAccessAllowed = YES;
  
  [[PHImageManager defaultManager] requestAVAssetForVideo:asset options:options resultHandler:^(AVAsset *avAsset, AVAudioMix *audioMix, NSDictionary *info) {
    if ([avAsset isKindOfClass:[AVURLAsset class]]) {
      AVURLAsset *urlAsset = (AVURLAsset *)avAsset;
      NSURL *url = urlAsset.URL;
      NSString *fileExtension = [url pathExtension];
      
      NSString *filePath = [NSTemporaryDirectory() stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.%@", [[NSUUID UUID] UUIDString], fileExtension]];
      NSError *error = nil;
      [[NSFileManager defaultManager] copyItemAtURL:url toURL:[NSURL fileURLWithPath:filePath] error:&error];
      
      if (error) {
        reject(@"E_VIDEO_SAVE_FAILED", @"Failed to save video file", error);
      } else {
        resolve(filePath);
      }
    } else {
      reject(@"E_VIDEO_REQUEST_FAILED", @"Failed to get video data", nil);
    }
  }];
}

@end
