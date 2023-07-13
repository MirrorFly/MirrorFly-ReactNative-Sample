import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { changeTimeFormat } from '../common/TimeStamp';
import { Box, HStack, Icon, Pressable,View } from 'native-base';
import { SandTimer } from '../common/Icons';
import ImageCard from './ImageCard';
import VideoCard from './VideoCard';
import PdfCard from './PdfCard';
import AudioCard from './AudioCard';
import MapCard from './MapCard';
import ContactCard from './ContactCard';
import TextCard from './TextCard';

const ChatMessage = (props) => {
  const currentUserJID = useSelector(state => state?.auth?.currentUserJID)
  let isSame = currentUserJID === props?.message?.fromUserJid
  let statusVisible = 'notSend'
  const imageSize =props?.message?.msgBody.media?.file_size;
  const fileSize = imageSize;

  switch (props?.message?.msgStatus) {
    case 3:
      statusVisible = styles.bgClr
      break;
    case 0:
      statusVisible = styles.notDelivered
      break;
    case 1:
      statusVisible = styles.delivered
      break;
    case 2:
      statusVisible = styles.seen
      break;
  }

  const getMessageStatus = (msgStatus) => {
    if (msgStatus == 3) {
      return <Icon px='3' as={SandTimer} name="emoji-happy" />
    }
    return (
      <>
        <View style={[styles?.msgStatus, isSame ? statusVisible : ""]}></View>
      </>
    )
  }
  return (
    <Pressable
      onPress={() => props?.selectedMsgs?.length && props.handleMsgSelect(props.message)}
      onLongPress={() => props?.message?.msgStatus !== 3 && props.handleMsgSelect(props.message)}>
      {({ isPressed }) => {
        return <Box >
          <Box my={"1"} bg={props.selectedMsgs.includes(props.message) ? 'rgba(0,0,0, 0.2)' : 'transparent'}>
            <HStack alignSelf={isSame ? 'flex-end' : 'flex-start'} px='3'   >
              <View minWidth='30%' maxWidth='80%' bgColor={isSame ? '#E2E8F7' : '#fff'}
                borderWidth={isSame ? 0 : 0.25}
                borderRadius={10}
                borderBottomLeftRadius={isSame ? 10 : 0}
                borderBottomRightRadius={isSame ? 0 : 10}
                borderColor='#959595'>
                {{
                  "text": <TextCard data={{
                    message: props?.message?.msgBody?.message,
                    timeStamp: changeTimeFormat(props?.message?.timestamp),
                    status: getMessageStatus(props?.message?.msgStatus)
                  }} />,
                  'image': <ImageCard data={props?.message} status={getMessageStatus(props?.message?.msgStatus)} timeStamp={changeTimeFormat(props?.message?.timestamp)} fileSize={fileSize} />,
                  "video": <VideoCard data={props?.message} status={getMessageStatus(props?.message?.msgStatus)} timeStamp={changeTimeFormat(props?.message?.timestamp)} />,
                  "audio": 
                  <View style={{flex:1}}>

                  <AudioCard data={props?.message} status={getMessageStatus(props?.message?.msgStatus)} timeStamp={changeTimeFormat(props?.message?.timestamp)}  /> 
                  </View>,
                  "file":<PdfCard data={props?.message} status={getMessageStatus(props?.message?.msgStatus)} timeStamp={changeTimeFormat(props?.message?.timestamp)} fileSize={fileSize}/>,
                  "contact":<ContactCard data={props?.message} status={getMessageStatus(props?.message?.msgStatus)} timeStamp={changeTimeFormat(props?.message?.timestamp)} />,
                  "location":<MapCard data={props?.message} status={getMessageStatus(props?.message?.msgStatus)} timeStamp={changeTimeFormat(props?.message?.timestamp)} />
                 }[props?.message?.msgBody?.message_type]}
                  </View>
                  </HStack>
          </Box>
        </Box>
      }}

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
    backgroundColor: 'red'
  },
  notDelivered: {
    backgroundColor: '#818181'
  },
  delivered: {
    backgroundColor: '#FFA500'
  },
  seen: {
    backgroundColor: '#66E824'
  },
});