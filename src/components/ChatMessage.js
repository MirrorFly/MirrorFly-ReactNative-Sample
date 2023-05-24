import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { changeTimeFormat } from '../common/TimeStamp';
import { HStack, Text, View } from 'native-base';

const ChatMessage = (props) => {
  const currentUserJID = useSelector(state => state?.auth?.currentUserJID)
  let isSame = currentUserJID === props?.message?.fromUserJid
  let statusVisible = 'notDelivered'

  switch (props?.message?.msgStatus) {
    case 3:
      statusVisible = styles.notSent
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

  return (
    <>
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
            <View style={[styles.msgStatus, isSame ? statusVisible : ""]}></View>
            <Text pl='1' color='#959595' fontSize='11'>{changeTimeFormat(props?.message?.timestamp)}</Text>
          </HStack>
        </View>
      </HStack>
    </>
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