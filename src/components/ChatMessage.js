import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
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

const ChatMessage = props => {
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  let isSame = currentUserJID === props?.message?.fromUserJid;
  let statusVisible = 'notSend';
  const imageSize = props?.message?.msgBody.media?.file_size;
  const fileSize = imageSize;

  switch (props?.message?.msgStatus) {
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

  const getMessageStatus = msgStatus => {
    if (isSame && msgStatus == 3) {
      return <Icon px="3" as={SandTimer} name="emoji-happy" />;
    }
    return (
      <>
        <View style={[styles?.msgStatus, isSame ? statusVisible : '']}></View>
      </>
    );
  };

  const handlePress = () => {
    props?.selectedMsgs?.length && props.handleMsgSelect(props.message);
  };

  const handleLongPress = () => {
    props?.message?.msgStatus !== 3 && props.handleMsgSelect(props.message);
  };

  const renderMessage = type => {
    switch (type) {
      case 'text':
        return (
          <TextCard
            isSame={isSame}
            data={{
              message: props?.message?.msgBody?.message,
              timeStamp: getConversationHistoryTime(props?.message?.createdAt),
              status: getMessageStatus(props?.message?.msgStatus),
            }}
          />
        );
      case 'image':
        return (
          <ImageCard
            data={props?.message}
            status={getMessageStatus(props?.message?.msgStatus)}
            timeStamp={getConversationHistoryTime(props?.message?.createdAt)}
            fileSize={fileSize}
          />
        );
      case 'video':
        return (
          <VideoCard
            data={props?.message}
            status={getMessageStatus(props?.message?.msgStatus)}
            timeStamp={getConversationHistoryTime(props?.message?.createdAt)}
          />
        );
      case 'audio':
        return (
          <View style={{ flex: 1 }}>
            <AudioCard
              data={props?.message}
              status={getMessageStatus(props?.message?.msgStatus)}
              timeStamp={getConversationHistoryTime(props?.message?.createdAt)}
            />
          </View>
        );
      case 'file':
        return (
          <PdfCard
            data={props?.message}
            status={getMessageStatus(props?.message?.msgStatus)}
            timeStamp={getConversationHistoryTime(props?.message?.createdAt)}
            fileSize={fileSize}
          />
        );
      case 'contact':
        return (
          <ContactCard
            data={props?.message}
            status={getMessageStatus(props?.message?.msgStatus)}
            timeStamp={getConversationHistoryTime(props?.message?.createdAt)}
          />
        );
      case 'location':
        return (
          <MapCard
            data={props?.message}
            status={getMessageStatus(props?.message?.msgStatus)}
            timeStamp={getConversationHistoryTime(props?.message?.createdAt)}
          />
        );
      default:
        return;
    }
  };

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress}>
      <Box
        my={'1'}
        bg={
          props.selectedMsgs.includes(props.message)
            ? 'rgba(0,0,0, 0.2)'
            : 'transparent'
        }>
        <HStack alignSelf={isSame ? 'flex-end' : 'flex-start'} px="3">
          <View minWidth="30%" maxWidth="80%">
            {renderMessage(props?.message?.msgBody?.message_type)}
          </View>
        </HStack>
      </Box>
    </Pressable>
  );
};
export default ChatMessage;

const styles = StyleSheet.create({
  msgStatus: {
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
