import React from 'react';
import { StyleSheet, View } from 'react-native';
import AttachmentProgressLoader from '../common/AttachmentProgressLoader';
import { CSVIcon, DocIcon, PPTIcon, PdfIcon, TXTIcon, XLSIcon, ZipIcon } from '../common/Icons';
import Text from '../common/Text';
import { getConversationHistoryTime } from '../common/timeStamp';
import { convertBytesToKB, getExtension, getMessageStatus } from '../helpers/chatHelpers';
import useMediaProgress from '../hooks/useMediaProgress';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import ReplyMessage from './ReplyMessage';
import { ChatConversationHighlightedText } from './TextCard';
import PropTypes from 'prop-types';

const DocumentMessageCard = ({ item, isSender }) => {
   const {
      createdAt = '',
      msgId,
      msgStatus,
      msgBody: {
         fileDetails = {},
         media,
         media: { is_uploading, is_downloaded, fileName, file_size: fileSize = 0, local_path = '' } = {},
      } = {},
      replyTo = '',
   } = item;
   const themeColorPalatte = useThemeColorPalatte();
   const fileSizeInKB = convertBytesToKB(fileSize);
   const fileExtension = getExtension(fileName, false);
   const mediaUrl = local_path || fileDetails?.uri;

   const { mediaStatus, downloadMedia, retryUploadMedia, cancelProgress } = useMediaProgress({
      mediaUrl,
      uploadStatus: is_uploading || 0,
      downloadStatus: is_downloaded || 0,
      media: media,
      msgId: msgId,
   });

   const conversationSearchText = '';

   const renderFileIcon = React.useCallback(() => {
      switch (fileExtension) {
         case 'pdf':
            return <PdfIcon />;
         case 'ppt':
         case 'pptx':
            return <PPTIcon />;
         case 'csv':
            return <CSVIcon />;
         case 'xls':
         case 'xlsx':
            return <XLSIcon />;
         case 'doc':
         case 'docx':
            return <DocIcon />;
         case 'zip':
         case 'rar':
            return <ZipIcon width={30} height={25} />;
         case 'txt':
         case 'text':
            return <TXTIcon />;
         default:
            return null;
      }
   }, [fileExtension]);

   return (
      <View style={styles.container}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSender={isSender} />}
         <View
            style={[
               styles.fileIconAndNameContainer,
               {
                  backgroundColor: isSender
                     ? themeColorPalatte.chatSenderSecondaryColor
                     : themeColorPalatte.chatReceiverSecondaryColor,
               },
            ]}>
            <View style={commonStyles.paddingVertical_8}>{renderFileIcon()}</View>
            <Text numberOfLines={2} style={styles.fileNameText}>
               <ChatConversationHighlightedText text={fileName} searchValue={conversationSearchText.trim()} />
            </Text>
            <AttachmentProgressLoader
               mediaStatus={mediaStatus}
               onDownload={downloadMedia}
               onUpload={retryUploadMedia}
               onCancel={cancelProgress}
               msgId={msgId}
            />
         </View>
         <View style={styles.statusAndTimestampWithFileSizeContainer}>
            <Text
               style={[
                  {
                     color: isSender
                        ? themeColorPalatte.chatSenderSecondaryTextColor
                        : themeColorPalatte.chatReceiverSecondaryTextColor,
                  },
                  styles.fileSizeText,
               ]}>
               {fileSizeInKB}
            </Text>
            <View style={styles.timeStampAndStatusContainer}>
               {isSender && getMessageStatus(msgStatus)}
               <Text
                  style={[
                     {
                        color: isSender
                           ? themeColorPalatte.chatSenderSecondaryTextColor
                           : themeColorPalatte.chatReceiverSecondaryTextColor,
                     },
                     styles.timeStampText,
                  ]}>
                  {getConversationHistoryTime(createdAt)}
               </Text>
            </View>
         </View>
      </View>
   );
};

DocumentMessageCard.propTypes = {
   item: PropTypes.shape({
      createdAt: PropTypes.string,
      msgId: PropTypes.string,
      msgStatus: PropTypes.string,
      msgBody: PropTypes.shape({
         fileDetails: PropTypes.object,
         media: PropTypes.shape({
            is_uploading: PropTypes.bool,
            is_downloaded: PropTypes.bool,
            fileName: PropTypes.string,
            file_size: PropTypes.number,
            local_path: PropTypes.string,
         }),
      }),
      replyTo: PropTypes.string,
   }),
   isSender: PropTypes.bool,
};

export default React.memo(DocumentMessageCard);

const styles = StyleSheet.create({
   container: {
      width: 245,
      position: 'relative',
      paddingTop: 2,
      paddingBottom: 25,
      paddingHorizontal: 2,
      margin: 2,
   },
   timeStampAndStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
   },
   fileIconAndNameContainer: {
      flexDirection: 'row',
      borderRadius: 10,
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
   },
   fileNameText: {
      paddingHorizontal: 8,
      flex: 1,
      fontSize: 11,
      paddingVertical: 12,
   },
   statusAndTimestampWithFileSizeContainer: {
      width: '100%',
      padding: 4,
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   fileSizeText: {
      fontWeight: '400',
      fontSize: 9,
      marginLeft: 8,
   },
   timeStampText: {
      paddingHorizontal: 4,
      fontSize: 10,
      fontWeight: '400',
   },
});
