import React from 'react';
import { HStack, Text, View } from 'native-base';
import {
  CSVIcon,
  DocIcon,
  PdfIcon,
  PPTIcon,
  TXTIcon,
  XLSIcon,
  ZipIcon,
} from '../common/Icons';
import { getExtension } from './chat/common/fileUploadValidation';
import { StyleSheet } from 'react-native';
import { convertBytesToKB } from '../Helper';
import AttachmentProgressLoader from './chat/common/AttachmentProgressLoader';
import useMediaProgress from '../hooks/useMediaProgress';
import ReplyMessage from './ReplyMessage';
import { ChatConversationHighlightedText } from './TextCard';
import { useSelector } from 'react-redux';

const DocumentMessageCard = ({
  message,
  fileSize,
  status,
  timeStamp,
  isSender,
  mediaUrl,
  handleReplyPress,
}) => {
  const {
    msgBody: { replyTo = '' },
  } = message;
  const fileSizeInKB = convertBytesToKB(fileSize);
  const mediaData = message.msgBody.media;
  const fileExtension = getExtension(mediaData?.fileName, false);
  const { mediaStatus, downloadMedia, retryUploadMedia } = useMediaProgress({
    isSender,
    mediaUrl: mediaUrl,
    uploadStatus: message?.msgBody?.media?.is_uploading || 0,
    media: message?.msgBody?.media,
    msgId: message?.msgId,
  });

  const conversationSearchText = useSelector(
    state => state.conversationSearchData?.searchText,
  );

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
    <View style={styles.container(isSender)}>
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={message}
          isSame={isSender}
        />
      )}
      <HStack
        borderRadius={10}
        backgroundColor={isSender ? '#D5DCEC' : '#EFEFEF'}
        alignItems={'center'}
        paddingX={2}
        paddingY={1}>
        <View py={2}>{renderFileIcon()}</View>
        <Text px={2} flex={1} numberOfLines={2} fontSize={11} py={3}>
          <ChatConversationHighlightedText
            text={mediaData.fileName}
            searchValue={conversationSearchText.trim()}
          />
        </Text>
        <AttachmentProgressLoader
          isSender={isSender}
          mediaStatus={mediaStatus}
          onDownload={downloadMedia}
          onUpload={retryUploadMedia}
        />
      </HStack>
      <View
        width={'100%'}
        p={1}
        flexDirection={'row'}
        position={'absolute'}
        justifyContent={'space-between'}
        alignItems={'center'}
        bottom={0}>
        <Text color={'#484848'} fontWeight={'400'} fontSize="9">
          {fileSizeInKB}
        </Text>
        <View style={styles.timeStampAndStatusContainer}>
          {status}
          <Text pl="1" color="#959595" fontSize="9">
            {timeStamp}
          </Text>
        </View>
      </View>
    </View>
  );
};
export default React.memo(DocumentMessageCard);

const styles = StyleSheet.create({
  container: isSender => ({
    width: 265,
    flex: 1,
    position: 'relative',
    paddingTop: 2,
    paddingBottom: 25,
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: isSender ? '#E2E8F7' : '#FFFFFF',
    borderRadius: 10,
    borderBottomLeftRadius: isSender ? 10 : 0,
    borderBottomRightRadius: isSender ? 0 : 10,
    backgroundColor: isSender ? '#E2E8F7' : '#fff',
    margin: 2,
  }),
  timeStampAndStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
