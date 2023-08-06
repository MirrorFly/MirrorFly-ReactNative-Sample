import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SandTimer } from '../common/Icons';
import ImageCard from './ImageCard';
import VideoCard from './VideoCard';
import PdfCard from './PdfCard';
import AudioCard from './AudioCard';
import MapCard from './MapCard';
import ContactCard from './ContactCard';
import TextCard from './TextCard';
import { getConversationHistoryTime } from '../common/TimeStamp';
import { Box, HStack, Icon, Pressable, View } from 'native-base';
import { uploadFileToSDK } from '../Helper/Chat/ChatHelper';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import { singleChatSelectedMediaImage } from '../redux/Actions/SingleChatImageAction';

const ChatMessage = props => {
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  let isSame = currentUserJID === props?.message?.fromUserJid;
  let statusVisible = 'notSend';
  const { message, setLocalNav } = props;
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
  const imageUrl = local_path || file?.fileDetails?.image?.uri;
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
      props.message?.msgBody?.media?.local_path ||
      props.message?.msgBody?.media?.file?.fileDetails?.image?.uri
    ) {
      dispatch(singleChatSelectedMediaImage(props.message));
      setLocalNav('PostPreView');
    }
  };

  const handleMessageSelect = () => {
    if (props?.selectedMsgs?.length) {
      props.handleMsgSelect(props.message);
    }
  };

  return (
    <Pressable
      onPress={handleMessageSelect}
      onLongPress={() =>
        message?.msgStatus !== 3 && props.handleMsgSelect(props.message)
      }>
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
                  onPress={handleMessageObj}
                  minWidth="30%"
                  maxWidth="80%">
                  {
                    {
                      text: (
                        <TextCard
                          isSame={isSame}
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
                        <View style={{ flex: 1 }}>
                          <AudioCard
                            data={message}
                            status={getMessageStatus(message?.msgStatus)}
                            timeStamp={getConversationHistoryTime(
                              message?.createdAt,
                            )}
                          />
                        </View>
                      ),
                      file: (
                        <PdfCard
                          data={message}
                          status={getMessageStatus(message?.msgStatus)}
                          timeStamp={getConversationHistoryTime(
                            message?.createdAt,
                          )}
                          fileSize={fileSize}
                        />
                      ),
                      contact: (
                        <ContactCard
                          data={message}
                          status={getMessageStatus(message?.msgStatus)}
                          timeStamp={getConversationHistoryTime(
                            message?.createdAt,
                          )}
                        />
                      ),
                      location: (
                        <MapCard
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
export default ChatMessage;

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
});
