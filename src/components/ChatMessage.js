import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { changeTimeFormat } from '../common/TimeStamp';
import { Box, HStack, Icon, Pressable, Text, View } from 'native-base';
import { SandTimer } from '../common/Icons';

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
    <Pressable onPress={() => props?.selectedMsgs?.length && props.handleMsgSelect(props.message)}
      onLongPress={() => props?.message?.msgStatus !== 3 && props.handleMsgSelect(props.message)}>
      {({ isPressed }) => {
        return <Box bg={isPressed ? 'rgba(0,0,0, 0.1)' : "transparent"}>
          <Box bg={props.selectedMsgs.includes(props.message) ? 'rgba(0,0,0, 0.2)' : 'transparent'}>
            <HStack alignSelf={isSame ? 'flex-end' : 'flex-start'} my='1' px='3'>
              <View px='2' py='1.5' minWidth='30%' maxWidth='90%' bgColor={isSame ? '#E2E8F7' : '#fff'}
                borderWidth={isSame ? 0 : 0.25}
                borderRadius={10}
                borderBottomLeftRadius={isSame ? 10 : 0}
                borderBottomRightRadius={isSame ? 0 : 10}
                borderColor='#959595'>
                {{
                  "text": <Text fontSize={14} color='#313131'>{props?.message?.msgBody?.message}</Text>,
                  "image": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>image</Text>,
                  "video": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>video</Text>,
                  "audio": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>audio</Text>,
                }[props?.message?.msgBody?.message_type]}
                <HStack alignItems='center' alignSelf='flex-end'>
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