import React from 'react';
import { StyleSheet } from 'react-native';
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
import { Box, HStack, Icon, Pressable, View } from 'native-base';
import { uploadFileToSDK } from '../Helper/Chat/ChatHelper';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import { singleChatSelectedMediaImage } from '../redux/Actions/SingleChatImageAction';
import { showToast } from '../Helper';

const ChatMessage = props => {
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  let isSame = currentUserJID === props?.message?.fromUserJid;
  let statusVisible = 'notSend';
  const { message, setLocalNav, handleReplyPress, backgroundColor, replyID } =
    props;
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
      //  else setUploadStatus(2);
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
      return <Icon px="3" as={SandTimer} name="emoji-happy" />;
    }
    return (
      <>
        <View style={[styles?.currentStatus, isSame ? statusVisible : '']} />
      </>
    );
  };

  const handleMessageObj = () => {
    if (
      ['image', 'video'].includes(message?.msgBody?.message_type) &&
      (props.message?.msgBody?.media?.local_path ||
        props.message?.msgBody?.media?.file?.fileDetails?.uri)
    ) {
      dispatch(singleChatSelectedMediaImage(props.message));
      setLocalNav('PostPreView');
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

  const handleMessageSelect = () => {
    if (props?.selectedMsgs?.length && message?.msgStatus !== 3) {
      props.handleMsgSelect(props.message);
    }
  };

  const handleMessageLongPress = () => {
    message?.msgStatus !== 3 && props.handleMsgSelect(props.message);
  };

  return (
    <Pressable
      onPress={handleMessageSelect}
      style={replyID === msgId && { backgroundColor }}
      onLongPress={handleMessageLongPress}>
      {({ isPressed }) => {
        return (
          <Box>
            <Box
              my={'1'}
              bg={
                props.selectedMsgs.includes(props.message)
                  ? 'rgba(0,0,0,0.2)'
                  : 'transparent'
              }>
              <HStack alignSelf={isSame ? 'flex-end' : 'flex-start'} px="3">
                <Pressable
                  onPress={() =>
                    props?.selectedMsgs?.length < 1
                      ? handleMessageObj()
                      : handleMessageSelect()
                  }
                  onLongPress={() =>
                    message?.msgStatus !== 3 &&
                    props.handleMsgSelect(props.message)
                  }
                  minWidth="30%"
                  maxWidth="80%">
                  {
                    {
                      text: (
                        <TextCard
                          handleReplyPress={handleReplyPress}
                          isSame={isSame}
                          message={message}
                          data={{
                            message: message?.msgBody?.message,
                            timeStamp: getConversationHistoryTime(
                              props?.message?.createdAt,
                            ),
                            status: getMessageStatus(props?.message?.msgStatus),
                          }}
                        />
                      ),
                      image: (
                        <ImageCard
                          handleReplyPress={handleReplyPress}
                          messageObject={message}
                          setUploadStatus={setUploadStatus}
                          imgSrc={imgSrc}
                          isSender={isSame}
                          status={getMessageStatus(message?.msgStatus)}
                          timeStamp={getConversationHistoryTime(
                            message?.createdAt,
                          )}
                          uploadStatus={uploadStatus}
                          fileSize={fileSize}
                        />
                      ),
                      video: (
                        <VideoCard
                          handleReplyPress={handleReplyPress}
                          messageObject={message}
                          setUploadStatus={setUploadStatus}
                          imgSrc={imgSrc}
                          isSender={isSame}
                          status={getMessageStatus(message?.msgStatus)}
                          uploadStatus={uploadStatus}
                          fileSize={fileSize}
                          timeStamp={getConversationHistoryTime(
                            message?.createdAt,
                          )}
                        />
                      ),
                      audio: (
                        <View style={styles.flex1}>
                          <AudioCard
                            handleReplyPress={handleReplyPress}
                            messageObject={message}
                            isSender={isSame}
                            mediaUrl={imageUrl}
                            status={getMessageStatus(message?.msgStatus)}
                            fileSize={fileSize}
                            timeStamp={getConversationHistoryTime(
                              message?.createdAt,
                            )}
                          />
                        </View>
                      ),
                      file: (
                        <DocumentMessageCard
                          handleReplyPress={handleReplyPress}
                          message={message}
                          status={getMessageStatus(message?.msgStatus)}
                          timeStamp={getConversationHistoryTime(
                            message?.createdAt,
                          )}
                          fileSize={fileSize}
                          isSender={isSame}
                          mediaUrl={imageUrl}
                        />
                      ),
                      contact: (
                        <ContactCard
                          handleReplyPress={handleReplyPress}
                          data={message}
                          status={getMessageStatus(message?.msgStatus)}
                          timeStamp={getConversationHistoryTime(
                            message?.createdAt,
                          )}
                        />
                      ),
                      location: (
                        <MapCard
                          handleReplyPress={handleReplyPress}
                          data={message}
                          status={getMessageStatus(message?.msgStatus)}
                          timeStamp={getConversationHistoryTime(
                            message?.createdAt,
                          )}
                        />
                      ),
                    }[message?.msgBody?.message_type]
                  }
                </Pressable>
              </HStack>
            </Box>
          </Box>
        );
      }}
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
});
