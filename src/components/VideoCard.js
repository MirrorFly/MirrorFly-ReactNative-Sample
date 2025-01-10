import React from 'react';
import { I18nManager, Image, ImageBackground, StyleSheet, View } from 'react-native';
import ic_ballon from '../assets/ic_baloon.png';
import noPreview from '../assets/noPreview.png';
import { PlayIcon, VideoIcon } from '../common/Icons';
import MediaProgressLoader from '../common/MediaProgressLoader';
import Text from '../common/Text';
import { getConversationHistoryTime } from '../common/timeStamp';
import { getImageSource, getMessageStatus, getThumbBase64URL, millisToMinutesAndSeconds } from '../helpers/chatHelpers';
import useMediaProgress from '../hooks/useMediaProgress';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import CaptionContainer from './CaptionContainer';
import ReplyMessage from './ReplyMessage';

function VideoCard({ item, isSender }) {
   const themeColorPalatte = useThemeColorPalatte();
   const {
      msgStatus,
      createdAt = '',
      msgId,
      msgBody: {
         replyTo = '',
         media: {
            caption = '',
            fileDetails = {},
            fileName = '',
            thumb_image = '',
            file_size: fileSize = '',
            androidHeight = 0,
            androidWidth = 0,
            is_downloaded = 0,
            is_uploading = 0,
            local_path = '',
            duration = 0,
         } = {},
      } = {},
      editMessageId,
   } = item;
   const imageUrl =
      is_uploading === 2 && is_downloaded === 2 ? local_path || fileDetails?.uri : getThumbBase64URL(thumb_image);

   const { mediaStatus, downloadMedia, retryUploadMedia, cancelProgress } = useMediaProgress({
      mediaUrl: imageUrl,
      uploadStatus: is_uploading || 0,
      downloadStatus: is_downloaded || 0,
      msgId: msgId,
   });

   const durationInMinutes = millisToMinutesAndSeconds(duration);

   const checkDownloaded = is_uploading === 2 && is_downloaded === 2;

   return (
      <View
         style={[
            commonStyles.paddingHorizontal_4,
            commonStyles.bg_color(
               isSender ? themeColorPalatte.chatSenderPrimaryColor : themeColorPalatte.chatReceiverPrimaryColor,
            ),
         ]}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSender={isSender} />}
         <View style={styles.videoContainer}>
            {thumb_image ? (
               <Image
                  style={styles.videoImage(androidWidth, androidHeight)}
                  alt={fileName}
                  source={{ uri: getThumbBase64URL(thumb_image) }}
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
               <VideoIcon color={thumb_image ? '#fff' : '#000'} width="13" height="13" />
               <Text style={[styles.videoTimerText, commonStyles.textColor(thumb_image ? '#fff' : '#000')]}>
                  {durationInMinutes}
               </Text>
            </View>

            <View style={styles.progressLoaderWrapper}>
               <MediaProgressLoader
                  mediaStatus={mediaStatus}
                  onDownload={downloadMedia}
                  onUpload={retryUploadMedia}
                  onCancel={cancelProgress}
                  msgId={msgId}
                  fileSize={fileSize}
               />
            </View>

            {!Boolean(caption) && (
               <View style={styles.messgeStatusAndTimestampWithoutCaption}>
                  <ImageBackground source={getImageSource(ic_ballon)} style={styles.imageBg}>
                     {isSender && getMessageStatus(msgStatus)}
                     <Text style={styles.timestampText}>{getConversationHistoryTime(createdAt)}</Text>
                  </ImageBackground>
               </View>
            )}
            {Boolean(caption) && (
               <CaptionContainer
                  isSender={isSender}
                  caption={caption}
                  msgStatus={msgStatus}
                  timeStamp={getConversationHistoryTime(createdAt)}
                  editMessageId={editMessageId}
               />
            )}
            {checkDownloaded && (
               <View
                  style={[
                     styles.playIconWrapper,
                     { backgroundColor: themeColorPalatte.colorOnPrimary, shadowColor: themeColorPalatte.shadowColor },
                  ]}>
                  <PlayIcon width={15} height={15} />
               </View>
            )}
         </View>
      </View>
   );
}

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
      color: '#fff',
      fontSize: 10,
      fontWeight: '400',
   },
   captionContainer: {
      paddingBottom: 8,
      justifyContent: 'space-between',
   },
   messgeStatusAndTimestampWithCaption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
   playIconWrapper: {
      position: 'absolute',
      top: '50%',
      right: I18nManager.isRTL ? '50%' : 'auto',
      left: I18nManager.isRTL ? 'auto' : '50%',
      transform: [{ translateX: -13.5 }, { translateY: -13.5 }], // transforming X and Y for actual width of the icon plus the padding divided by 2 to make it perfectly centered ( 15(width) + 12(padding) / 2 = 13.5 )
      elevation: 5,
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
   videoTimerText: {
      paddingHorizontal: 8,
      fontSize: 11,
   },
});
