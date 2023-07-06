import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { changeTimeFormat } from '../common/TimeStamp';
import { Box, HStack, Icon, Pressable, Stack, Text, View } from 'native-base';
import { ReplyUserIcon, SandTimer } from '../common/Icons';
import ImageCard from './ImageCard';
import VideoCard from './VideoCard';
import PdfCard from './PdfCard';
import AudioCard from './AudioCard';
import MapCard from './MapCard';

const ChatMessage = (props) => {
  const currentUserJID = useSelector(state => state?.auth?.currentUserJID)
  let isSame = currentUserJID === props?.message?.fromUserJid
  let statusVisible = 'notSend'

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
            <HStack alignSelf={isSame ? 'flex-end' : 'flex-start'}  my='1' px='3' >
            <Stack px={3} justifyContent={"center"} >
            <ReplyUserIcon />
            </Stack>
             
              <View minWidth='30%' maxWidth='90%' bgColor={isSame ? '#E2E8F7' : '#fff'}
                borderWidth={isSame ? 0 : 0.25}
                borderRadius={10}
                borderTopLeftRadius={isSame ? 10 : 0}
                borderTopRightRadius={isSame ? 0 : 10}
                borderColor='#959595'>
                {{
                  "text": <Text fontSize={14} px={3} py={4} color='#313131'>{props?.message?.msgBody?.message}</Text>,
                  "image": <MapCard />,
                  "video": <VideoCard />,
                  "audio": <AudioCard />,
                  "document": <PdfCard />,
                  "map": <ImageCard />,
                }[props?.message?.msgBody?.message_type]}
                <HStack borderBottomLeftRadius={6} borderBottomRightRadius={6} bgColor={"#E2E8F7"} px={2} py={"4"} alignItems={"center"} justifyContent={"space-between"}>

                  <Text color={"#000"} fontSize={10} fontWeight={"500"} mt={0}>3 pages </Text>
                  <View borderBottomWidth={1} top={"0.4"}
                    backgroundColor={"#000"}
                    borderRadius={60}
                    width={1}

                    height={1} />
                  <Text color={"#000"} fontSize={10} fontWeight={"500"} mr={10}>79KB  </Text>
                  {getMessageStatus(props?.message?.msgStatus)}
                  <Text pl='1' color='#959595' fontSize='11'>{changeTimeFormat(props?.message?.timestamp)}</Text>
                </HStack>
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