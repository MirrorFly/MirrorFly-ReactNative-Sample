import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import noPreview from '../assets/noPreview.png';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import ReplyMessage from './ReplyMessage';
import ic_baloon from '../assets/ic_baloon.png';
import { getImageSource } from '../common/utils';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import MediaProgressLoader from './chat/common/MediaProgressLoader';
import useMediaProgress from '../hooks/useMediaProgress';
import CaptionContainer from './CaptionContainer';

const ImageCard = props => {
   const { imgSrc = '', isSender = true, fileSize = '', messageObject = {}, handleReplyPress = () => {} } = props;

   const {
      msgId = '',
      msgBody: { media },
      msgBody: {
         replyTo = '',
         message_type = '',
         media: {
            file: { fileDetails = {} } = {},
            file_url = '',
            androidHeight,
            androidWidth,
            local_path = '',
            fileName,
            thumb_image = '',
         } = {},
      } = {},
   } = messageObject;

   const imageUrl = local_path || fileDetails?.uri;
   const [imageSource, setImageSource] = React.useState(imgSrc || getThumbBase64URL(thumb_image));
   const { mediaStatus, downloadMedia, retryUploadMedia, cancelUploadMedia } = useMediaProgress({
      isSender,
      mediaUrl: imageUrl,
      uploadStatus: media?.is_uploading || 0,
      downloadStatus: media?.is_downloaded || 0,
      media: media,
      msgId: msgId,
   });

   React.useEffect(() => {
      if (imgSrc) {
         setImageSource(imgSrc);
      } else {
         setImageSource(getThumbBase64URL(thumb_image));
      }
   }, [imgSrc, msgId]);

   React.useEffect(() => {
      if (message_type === 'image' && file_url) {
         isSender && setImageSource(imageUrl);
         imageUrl && !isSender && setImageSource(imageUrl);
      }
   }, [file_url, message_type, local_path]);

   return (
      <View style={commonStyles.paddingHorizontal_4}>
         {Boolean(replyTo) && (
            <ReplyMessage handleReplyPress={handleReplyPress} message={messageObject} isSame={isSender} />
         )}
         <View style={styles.imageContainer}>
            {imageSource ? (
               <Image style={styles.image(androidWidth, androidHeight)} alt={fileName} source={{ uri: imageSource }} />
            ) : (
               <View style={styles.noPreviewWrapper}>
                  <Image style={styles.noPreview} alt={fileName} source={getImageSource(noPreview)} />
               </View>
            )}
            <View style={styles.progressLoaderWrapper}>
               <MediaProgressLoader
                  isSender={isSender}
                  mediaStatus={mediaStatus}
                  onDownload={downloadMedia}
                  onUpload={retryUploadMedia}
                  onCancel={cancelUploadMedia}
                  msgId={msgId}
                  fileSize={fileSize}
               />
            </View>
            {!Boolean(media?.caption) && (
               <View style={styles.messgeStatusAndTimestampWithoutCaption}>
                  <ImageBackground source={ic_baloon} style={styles.imageBg}>
                     {props.status}
                     <Text style={styles.timestampText}>{props.timeStamp}</Text>
                  </ImageBackground>
               </View>
            )}
         </View>
         {Boolean(media?.caption) && (
            <CaptionContainer caption={media.caption} status={props.status} timeStamp={props.timeStamp} />
         )}
      </View>
   );
};

export default ImageCard;

const styles = StyleSheet.create({
   imageContainer: {
      paddingVertical: 4,
      position: 'relative',
   },
   imageBg: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: 100,
      resizeMode: 'cover',
      padding: 1,
   },
   image: (w, h) => ({
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
});
