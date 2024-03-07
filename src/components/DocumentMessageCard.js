import React from 'react';
import { CSVIcon, DocIcon, PdfIcon, PPTIcon, TXTIcon, XLSIcon, ZipIcon } from '../common/Icons';
import { getExtension } from './chat/common/fileUploadValidation';
import { StyleSheet, Text, View } from 'react-native';
import { convertBytesToKB } from '../Helper';
import AttachmentProgressLoader from './chat/common/AttachmentProgressLoader';
import useMediaProgress from '../hooks/useMediaProgress';
import ReplyMessage from './ReplyMessage';
import { ChatConversationHighlightedText } from './TextCard';
import { useSelector } from 'react-redux';
import commonStyles from '../common/commonStyles';

const DocumentMessageCard = ({ message, fileSize, status, timeStamp, isSender, mediaUrl, handleReplyPress }) => {
   const {
      msgBody: { replyTo = '' },
   } = message;
   const fileSizeInKB = convertBytesToKB(fileSize);
   const mediaData = message.msgBody.media;
   const fileExtension = getExtension(mediaData?.fileName, false);
   const { mediaStatus, downloadMedia, retryUploadMedia, cancelUploadMedia } = useMediaProgress({
      isSender,
      mediaUrl: mediaUrl,
      uploadStatus: message?.msgBody?.media?.is_uploading || 0,
      downloadStatus: message?.msgBody?.media?.is_downloaded || 0,
      media: message?.msgBody?.media,
      msgId: message?.msgId,
   });

   const conversationSearchText = useSelector(state => state.conversationSearchData?.searchText);

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
         {Boolean(replyTo) && <ReplyMessage handleReplyPress={handleReplyPress} message={message} isSame={isSender} />}
         <View style={styles.fileIconAndNameContainer(isSender ? '#D5DCEC' : '#EFEFEF')}>
            <View style={commonStyles.paddingVertical_8}>{renderFileIcon()}</View>
            <Text numberOfLines={2} style={styles.fileNameText}>
               <ChatConversationHighlightedText text={mediaData.fileName} searchValue={conversationSearchText.trim()} />
            </Text>
            <AttachmentProgressLoader
               isSender={isSender}
               mediaStatus={mediaStatus}
               onDownload={downloadMedia}
               onUpload={retryUploadMedia}
               onCancel={cancelUploadMedia}
               msgId={message?.msgId}
            />
         </View>
         <View style={styles.statusAndTimestampWithFileSizeContainer}>
            <Text style={styles.fileSizeText}>{fileSizeInKB}</Text>
            <View style={styles.timeStampAndStatusContainer}>
               {status}
               <Text style={styles.timeStampText}>{timeStamp}</Text>
            </View>
         </View>
      </View>
   );
};
export default React.memo(DocumentMessageCard);

const styles = StyleSheet.create({
   container: {
      width: 265,
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
