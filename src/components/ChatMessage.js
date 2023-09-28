import React from 'react';
import { Keyboard, StyleSheet, View, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import FileViewer from 'react-native-file-viewer';
import { SandTimer } from '../common/Icons';
import ImageCard from './ImageCard';
import VideoCard from './VideoCard';
import DocumentMessageCard from './DocumentMessageCard';
import AudioCard from './AudioCard';
import MapCard from './MapCard';
import ContactCard from './ContactCard';
import TextCard from './TextCard';
import { getConversationHistoryTime } from '../common/TimeStamp';
import { uploadFileToSDK } from '../Helper/Chat/ChatHelper';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import { singleChatSelectedMediaImage } from '../redux/Actions/SingleChatImageAction';
import { showToast } from '../Helper';
import { isKeyboardVisibleRef } from '../ChatApp';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import MessagePressable from '../common/MessagePressable';
import { isMessageSelectingRef } from './ChatConversation';

const ChatMessage = props => {
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  let isSame = currentUserJID === props?.message?.fromUserJid;
  let statusVisible = 'notSend';
  const {
    message,
    setLocalNav,
    handleReplyPress,
    shouldHighlightMessage,
    shouldSelectMessage,
  } = props;
  const {
    msgBody = {},
    msgBody: {
      media: {
        file = {},
        is_uploading,
        thumb_image = '',
        local_path = '',
      } = {},
      message_type,
    } = {},
    msgId,
    msgStatus,
  } = message;

  const [uploadStatus, setUploadStatus] = React.useState(4);
  const imageUrl = local_path || file?.fileDetails?.uri;
  const thumbURL = thumb_image ? getThumbBase64URL(thumb_image) : '';

  const [imgSrc, saveImage] = React.useState(thumbURL);
  const dispatch = useDispatch();
  const imageSize = props?.message?.msgBody?.media?.file_size || '';
  const fileSize = imageSize;
  const [isSubscribed, setIsSubscribed] = React.useState(true);

  const imgFileDownload = () => {
    try {
      if (imageUrl) {
        setUploadStatus(2);
        saveImage(imageUrl);
      }
    } catch (error) {
      if (isSubscribed) {
        saveImage(getThumbBase64URL(thumb_image));
      }
    }
  };

  React.useEffect(() => {
    if (is_uploading === 0 || is_uploading === 1) {
      setUploadStatus(is_uploading);
      if (isImageMessage()) {
        saveImage(getThumbBase64URL(thumb_image));
      }
    } else if (is_uploading === 3 || is_uploading === 7) {
      if (isImageMessage()) {
        saveImage(getThumbBase64URL(thumb_image));
      }
    } else if (is_uploading !== 0 && is_uploading !== 8) {
      if (isImageMessage()) {
        imgFileDownload();
      }
    }
    return () => setIsSubscribed(false);
  }, []);

  React.useEffect(() => {
    msgStatus === 0 && setUploadStatus(2);
  }, [msgStatus]);

  React.useEffect(() => {
    is_uploading === 8 && setUploadStatus(is_uploading);
    if (is_uploading === 1) {
      uploadFileToSDK(file, fromUserJId, msgId, msgBody?.media);
    }
    (is_uploading === 3 || is_uploading === 7) && setUploadStatus(3);
  }, [is_uploading]);

  const isImageMessage = () => message_type === 'image';

  switch (message?.msgStatus) {
    case 3:
      statusVisible = styles.bgClr;
      break;
    case 0:
      statusVisible = styles.notDelivered;
      break;
    case 1:
      statusVisible = styles.delivered;
      break;
    case 2:
      statusVisible = styles.seen;
      break;
  }

  const getMessageStatus = currentStatus => {
    if (isSame && currentStatus === 3) {
      return <SandTimer />;
    }
    return (
      <View style={[styles?.currentStatus, isSame ? statusVisible : '']} />
    );
  };

  const handleMessageObj = () => {
    if (
      ['image', 'video'].includes(message?.msgBody?.message_type) &&
      (props.message?.msgBody?.media?.local_path ||
        props.message?.msgBody?.media?.file?.fileDetails?.uri)
    ) {
      if (isKeyboardVisibleRef.current) {
        let hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
          dispatch(singleChatSelectedMediaImage(props.message));
          setLocalNav('PostPreView');
          hideSubscription.remove();
        });
        Keyboard.dismiss();
      } else {
        dispatch(singleChatSelectedMediaImage(props.message));
        setLocalNav('PostPreView');
      }
    } else if (
      message?.msgBody?.message_type === 'file' &&
      (props.message?.msgBody?.media?.local_path ||
        props.message?.msgBody?.media?.file?.fileDetails?.uri)
    ) {
      FileViewer.open(
        props.message?.msgBody?.media?.local_path ||
          props.message?.msgBody?.media?.file?.fileDetails?.uri,
        {
          showOpenWithDialog: true,
        },
      )
        .then(res => {
          console.log('Document opened externally', res);
        })
        .catch(err => {
          console.log('Error while opening Document', err);
          showToast('No apps available to open this file', {
            id: 'no-supported-app-to-open-file',
          });
        });
    }
  };

  const dismissKeyBoard = () => {
    Keyboard.dismiss();
  };

  const handleMessageSelect = () => {
    dismissKeyBoard();
    if (isMessageSelectingRef.current) {
      props.handleMsgSelect(props.message);
    }
  };

  const handleMessageLongPress = () => {
    dismissKeyBoard();
    props.handleMsgSelect(props.message);
  };

  const handleContentPress = () => {
    dismissKeyBoard();
    isMessageSelectingRef.current ? handleMessageSelect() : handleMessageObj();
  };

  const handleContentLongPress = () => {
    dismissKeyBoard();
    props.handleMsgSelect(props.message);
  };

  const renderMessageBasedOnType = () => {
    switch (message?.msgBody?.message_type) {
      case 'text':
        return (
          <TextCard
            handleReplyPress={handleReplyPress}
            isSame={isSame}
            message={message}
            data={{
              message: message?.msgBody?.message,
              timeStamp: getConversationHistoryTime(props?.message?.createdAt),
              status: getMessageStatus(props?.message?.msgStatus),
            }}
          />
        );
      case 'image':
        return (
          <ImageCard
            handleReplyPress={handleReplyPress}
            messageObject={message}
            setUploadStatus={setUploadStatus}
            imgSrc={imgSrc}
            isSender={isSame}
            status={getMessageStatus(message?.msgStatus)}
            timeStamp={getConversationHistoryTime(message?.createdAt)}
            uploadStatus={uploadStatus}
            fileSize={fileSize}
          />
        );
      case 'video':
        return (
          <VideoCard
            handleReplyPress={handleReplyPress}
            messageObject={message}
            setUploadStatus={setUploadStatus}
            imgSrc={imgSrc}
            isSender={isSame}
            status={getMessageStatus(message?.msgStatus)}
            uploadStatus={uploadStatus}
            fileSize={fileSize}
            timeStamp={getConversationHistoryTime(message?.createdAt)}
          />
        );
      case 'audio':
        return (
          <AudioCard
            handleReplyPress={handleReplyPress}
            messageObject={message}
            isSender={isSame}
            mediaUrl={imageUrl}
            status={getMessageStatus(message?.msgStatus)}
            fileSize={fileSize}
            timeStamp={getConversationHistoryTime(message?.createdAt)}
          />
        );
      case 'file':
        return (
          <DocumentMessageCard
            handleReplyPress={handleReplyPress}
            message={message}
            status={getMessageStatus(message?.msgStatus)}
            timeStamp={getConversationHistoryTime(message?.createdAt)}
            fileSize={fileSize}
            isSender={isSame}
            mediaUrl={imageUrl}
          />
        );
      case 'contact':
        return (
          <ContactCard
            handleReplyPress={handleReplyPress}
            message={message}
            status={getMessageStatus(message?.msgStatus)}
            timeStamp={getConversationHistoryTime(message?.createdAt)}
            isSender={isSame}
          />
        );
      case 'location':
        return (
          <MapCard
            handleReplyPress={handleReplyPress}
            message={message}
            status={getMessageStatus(message?.msgStatus)}
            timeStamp={getConversationHistoryTime(message?.createdAt)}
            isSender={isSame}
          />
        );
    }
  };

  return (
    <Pressable
      style={
        shouldHighlightMessage && {
          backgroundColor: ApplicationColors.highlighedMessageBg,
        }
      }
      delayLongPress={300}
      pressedStyle={commonStyles.bg_transparent}
      onPress={handleMessageSelect}
      onLongPress={handleMessageLongPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.messageContainer,
            shouldSelectMessage ? styles.highlightMessage : undefined,
          ]}>
          <View
            style={[
              commonStyles.paddingHorizontal_12,
              isSame
                ? commonStyles.alignSelfFlexEnd
                : commonStyles.alignSelfFlexStart,
            ]}>
            <MessagePressable
              forcePress={pressed}
              style={styles.messageContentPressable}
              contentContainerStyle={[
                styles.messageCommonStyle,
                isSame ? styles.sentMessage : styles.receivedMessage,
              ]}
              delayLongPress={300}
              onPress={handleContentPress}
              onLongPress={handleContentLongPress}>
              {renderMessageBasedOnType()}
            </MessagePressable>
          </View>
        </View>
      )}
    </Pressable>
  );
};
export default React.memo(ChatMessage);

const styles = StyleSheet.create({
  currentStatus: {
    marginStart: 15,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bgClr: {
    backgroundColor: 'red',
  },
  notDelivered: {
    backgroundColor: '#818181',
  },
  delivered: {
    backgroundColor: '#FFA500',
  },
  seen: {
    backgroundColor: '#66E824',
  },
  flex1: { flex: 1 },
  messageContainer: {
    marginBottom: 6,
  },
  highlightMessage: {
    backgroundColor: ApplicationColors.highlighedMessageBg,
  },
  messageContentPressable: {
    minWidth: '30%',
    maxWidth: '80%',
  },
  messageCommonStyle: {
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#DDE3E5',
  },
  sentMessage: {
    backgroundColor: '#E2E8F7',
    borderWidth: 0,
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderBottomLeftRadius: 0,
  },
});
