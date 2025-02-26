import React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import ic_baloon from '../assets/ic_baloon.png';
import noPreview from '../assets/noPreview.png';
import MediaProgressLoader from '../common/MediaProgressLoader';
import Text from '../common/Text';
import { getConversationHistoryTime } from '../common/timeStamp';
import { getImageSource, getMessageStatus, getThumbBase64URL } from '../helpers/chatHelpers';
import useMediaProgress from '../hooks/useMediaProgress';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import CaptionContainer from './CaptionContainer';
import ReplyMessage from './ReplyMessage';

function ImageCard({ chatUser, item, isSender }) {
   const themeColorPalatte = useThemeColorPalatte();
   const {
      editMessageId,
      msgStatus,
      createdAt = '',
      msgId,
      msgBody: {
         replyTo = '',
         media: {
            caption = '',
            file: { fileDetails = {} } = {},
            fileName = '',
            thumb_image = '',
            file_size: fileSize = '',
            androidHeight = 0,
            androidWidth = 0,
            is_downloaded = 0,
            is_uploading = 0,
            local_path = '',
         } = {},
      } = {},
   } = item;

   const imageUrl =
      is_uploading === 2 && is_downloaded === 2 ? local_path || fileDetails?.uri : getThumbBase64URL(thumb_image);

   const { mediaStatus, downloadMedia, retryUploadMedia, cancelProgress } = useMediaProgress({
      chatUser,
      mediaUrl: imageUrl,
      uploadStatus: is_uploading || 0,
      downloadStatus: is_downloaded || 0,
      msgId: msgId,
   });

   return (
      <View
         style={[
            commonStyles.paddingHorizontal_4,
            commonStyles.bg_color(
               isSender ? themeColorPalatte.chatSenderPrimaryColor : themeColorPalatte.chatReceiverPrimaryColor,
            ),
         ]}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSender={isSender} />}
         <View style={styles.imageContainer}>
            {/* <View style={{ backgroundColor: themeColorPalatte.screenBgColor }}>
               <Image
                  thumbImage={getThumbBase64URL(thumb_image) || getImageSource(noPreview)}
                  uri={imageUrl}
                  resizeMode="cover"
                  alt={fileName}
                  style={styles.image(androidWidth, androidHeight)}
               />
            </View> */}
            {imageUrl ? (
               <ImageBackground
                  resizeMode="cover"
                  style={styles.image(androidWidth, androidHeight)}
                  alt={fileName}
                  source={{ uri: getThumbBase64URL(thumb_image) }}>
                  <Image
                     resizeMode="cover"
                     style={styles.image(androidWidth, androidHeight)}
                     alt={fileName}
                     source={{ uri: imageUrl }}
                  />
               </ImageBackground>
            ) : (
               <View style={{ backgroundColor: themeColorPalatte.screenBgColor }}>
                  <Image style={styles.noPreview} alt={fileName} source={getImageSource(noPreview)} />
               </View>
            )}
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
                  <ImageBackground source={getImageSource(ic_baloon)} style={styles.imageBg}>
                     {isSender && getMessageStatus(msgStatus)}
                     <Text style={[styles.timestampText, { color: themeColorPalatte.white }]}>
                        {getConversationHistoryTime(createdAt)}
                     </Text>
                  </ImageBackground>
               </View>
            )}
         </View>
         {Boolean(caption) && (
            <CaptionContainer
               isSender={isSender}
               caption={caption}
               msgStatus={msgStatus}
               timeStamp={getConversationHistoryTime(createdAt)}
               editMessageId={editMessageId}
            />
         )}
      </View>
   );
}

export default ImageCard;

const styles = StyleSheet.create({
   imageContainer: {
      paddingVertical: 4,
      overflow: 'hidden',
   },
   imageBg: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: 100,
      padding: 1,
   },
   image: (w, h) => ({
      borderRadius: 5,
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
      fontSize: 10,
      fontWeight: '400',
   },
   captionContainer: {
      paddingBottom: 8,
      justifyContent: 'space-between',
   },
   captionText: {
      paddingLeft: 12,
      fontSize: 14,
   },
   messgeStatusAndTimestampWithCaption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
});
