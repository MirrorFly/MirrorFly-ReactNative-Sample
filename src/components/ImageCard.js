import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import ic_baloon from '../assets/ic_baloon.png';
import noPreview from '../assets/noPreview.png';
import MediaProgressLoader from '../common/MediaProgressLoader';
import { getConversationHistoryTime } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import { getImageSource, getMessageStatus, getThumbBase64URL } from '../helpers/chatHelpers';
import useMediaProgress from '../hooks/useMediaProgress';
import commonStyles from '../styles/commonStyles';
import CaptionContainer from './CaptionContainer';

function ImageCard({ chatUser, item, isSender }) {
   const {
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
      <View style={commonStyles.paddingHorizontal_4}>
         {Boolean(replyTo) && <ReplyMessage message={messageObject} />}
         <View style={styles.imageContainer}>
            {imageUrl ? (
               <Image
                  resizeMode="cover"
                  style={styles.image(androidWidth, androidHeight)}
                  alt={fileName}
                  source={{ uri: imageUrl || getThumbBase64URL(thumb_image) }}
               />
            ) : (
               <View style={styles.noPreviewWrapper}>
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
                  <ImageBackground source={ic_baloon} style={styles.imageBg}>
                     {isSender && getMessageStatus(msgStatus)}
                     <Text style={styles.timestampText}>{getConversationHistoryTime(createdAt)}</Text>
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
});
