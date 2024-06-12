import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AttachmentProgressLoader from '../common/AttachmentProgressLoader';
import { CSVIcon, DocIcon, PPTIcon, PdfIcon, TXTIcon, XLSIcon, ZipIcon } from '../common/Icons';
import { getConversationHistoryTime } from '../common/timeStamp';
import { convertBytesToKB, getExtension, getMessageStatus } from '../helpers/chatHelpers';
import useMediaProgress from '../hooks/useMediaProgress';
import commonStyles from '../styles/commonStyles';
import { ChatConversationHighlightedText } from './TextCard';

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

   const fileSizeInKB = convertBytesToKB(fileSize);
   const fileExtension = getExtension(fileName, false);
   const mediaUrl = local_path || fileDetails?.uri;

   const { mediaStatus, downloadMedia, retryUploadMedia, cancelUploadMedia } = useMediaProgress({
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
         {/* {Boolean(replyTo) && (
                <ReplyMessage handleReplyPress={handleReplyPress} message={message} isSame={isSender} />
            )} */}
         <View style={styles.fileIconAndNameContainer(isSender ? '#D5DCEC' : '#EFEFEF')}>
            <View style={commonStyles.paddingVertical_8}>{renderFileIcon()}</View>
            <Text numberOfLines={2} style={styles.fileNameText}>
               <ChatConversationHighlightedText text={fileName} searchValue={conversationSearchText.trim()} />
            </Text>
            <AttachmentProgressLoader
               mediaStatus={mediaStatus}
               onDownload={downloadMedia}
               onUpload={retryUploadMedia}
               onCancel={cancelUploadMedia}
               msgId={msgId}
            />
         </View>
         <View style={styles.statusAndTimestampWithFileSizeContainer}>
            <Text style={styles.fileSizeText}>{fileSizeInKB}</Text>
            <View style={styles.timeStampAndStatusContainer}>
               {isSender && getMessageStatus(msgStatus)}
               <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
            </View>
         </View>
      </View>
   );
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
   fileIconAndNameContainer: bgColor => ({
      flexDirection: 'row',
      borderRadius: 10,
      backgroundColor: bgColor,
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
   }),
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
      color: '#484848',
      fontWeight: '400',
      fontSize: 9,
      marginLeft: 8,
   },
   timeStampText: {
      paddingLeft: 4,
      color: '#455E93',
      fontSize: 10,
      fontWeight: '400',
   },
});
