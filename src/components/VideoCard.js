import React from 'react';
import { PlayIcon, VideoIcon } from '../common/Icons';
import noPreview from '../assets/noPreview.png';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { millisToMinutesAndSeconds } from '../Helper/Chat/Utility';
import ProgressLoader from './chat/common/ProgressLoader';
import ReplyMessage from './ReplyMessage';
import ic_ballon from '../assets/ic_baloon.png';
import { getImageSource } from '../common/utils';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';

const VideoCard = props => {
  const {
    uploadStatus = 0,
    setUploadStatus,
    isSender,
    fileSize,
    messageObject = {},
    handleReplyPress,
  } = props;

  const {
    msgId = '',
    msgBody: { media },
    msgBody: {
      replyTo = '',
      media: {
        duration = 0,
        is_uploading,
        androidHeight,
        androidWidth,
        local_path = '',
        fileName,
        thumb_image = '',
      } = {},
    } = {},
  } = messageObject;

  const durationInSeconds = duration;
  const durationInMinutes = millisToMinutesAndSeconds(durationInSeconds);
  const base64ImageData = 'data:image/jpg;base64,' + thumb_image;
  const imageUrl = local_path;
  const checkDownloaded = isSender ? is_uploading === 2 : imageUrl;

  return (
    <View style={commonStyles.paddingHorizontal_4}>
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={messageObject}
          isSame={isSender}
        />
      )}
      <View style={styles.videoContainer}>
        {thumb_image ? (
          <Image
            style={styles.videoImage(androidWidth, androidHeight)}
            alt={fileName}
            source={{ uri: base64ImageData }}
          />
        ) : (
          <View style={styles.noPreviewImage}>
            <Image
              style={styles.noPreviewImage(androidWidth, androidHeight)}
              alt={fileName}
              source={getImageSource(noPreview)}
            />
          </View>
        )}
        <View style={styles.videoTimeContainer}>
          <VideoIcon
            color={thumb_image ? '#fff' : '#000'}
            width="13"
            height="13"
          />
          <Text style={styles.videoTimerText(thumb_image ? '#fff' : '#000')}>
            {durationInMinutes}
          </Text>
        </View>

        <View style={styles.progressLoaderWrapper}>
          <ProgressLoader
            isSender={isSender}
            imageUrl={imageUrl}
            media={media}
            fileSize={fileSize}
            setUploadStatus={setUploadStatus}
            msgId={msgId}
            mediaData={media}
            uploadStatus={uploadStatus}
          />
        </View>

        {!media.caption && (
          <View style={styles.messgeStatusAndTimestampWithoutCaption}>
            <ImageBackground source={ic_ballon} style={styles.imageBg}>
              {props.status}
              <Text style={styles.timestampText}>{props.timeStamp}</Text>
            </ImageBackground>
          </View>
        )}
        {checkDownloaded && (
          <View style={styles.playIconWrapper}>
            <PlayIcon width={15} height={15} />
          </View>
        )}
      </View>
      {media.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{media.caption}</Text>
          <View style={styles.messgeStatusAndTimestampWithCaption}>
            {props.status}
            <Text style={styles.timestampText}>{props.timeStamp}</Text>
          </View>
        </View>
      )}
    </View>
  );
};
export default VideoCard;

const styles = StyleSheet.create({
  imageBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 100,
    resizeMode: 'cover',
    padding: 1,
  },
  videoContainer: {
    position: 'relative',
    paddingVertical: 4,
  },
  videoImage: (w, h) => ({
    borderRadius: 5,
    resizeMode: 'cover',
    width: w,
    height: h,
  }),
  noPreviewWrapper: {
    backgroundColor: ApplicationColors.mainbg,
  },
  noPreviewImage: (w, h) => ({
    resizeMode: 'contain',
    width: w,
    height: h,
  }),
  progressLoaderWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messgeStatusAndTimestampWithoutCaption: {
    position: 'absolute',
    bottom: 5,
    right: 2,
  },
  timestampText: {
    paddingLeft: 4,
    color: ApplicationColors.white,
    fontSize: 10,
    fontWeight: '400',
  },
  captionContainer: {
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  captionText: {
    color: ApplicationColors.black,
    paddingLeft: 12,
    fontSize: 14,
  },
  messgeStatusAndTimestampWithCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  playIconWrapper: {
    backgroundColor: ApplicationColors.mainbg,
    position: 'absolute',
    top: '50%',
    left: '50%',
    // transforming X and Y for actual width of the icon plus the padding divided by 2 to make it perfectly centered ( 15(width) + 12(padding) / 2 = 13.5 )
    transform: [{ translateX: -13.5 }, { translateY: -13.5 }],
    elevation: 5,
    shadowColor: ApplicationColors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    padding: 12,
    borderRadius: 50,
  },
  videoTimeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTimerText: color => ({
    paddingHorizontal: 8,
    fontSize: 11,
    color: color,
  }),
});
