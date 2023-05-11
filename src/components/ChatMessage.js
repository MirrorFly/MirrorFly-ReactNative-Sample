import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getConversationHistoryTime } from '../common/TimeStamp';

const ChatMessage = (props) => {
  const currentUserJID = useSelector(state => state?.auth?.currentUserJID)
  let isSame = currentUserJID === props?.message?.fromUserJid
  let statusVisible = 'notDelivered'

  switch (props?.message?.msgStatus) {
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
    <View style={styles.messageContainer}>
      <View style={isSame ? styles.sentContainer : styles.receivedContainer}>
        <View style={styles.message}>
          <Text style={isSame ? styles.sentText : styles.receivedText}>{props?.message?.msgBody?.message}</Text>
          <View style={[styles.msgStatus, isSame ? statusVisible : ""]}></View>
          <Text style={styles.timeStamp}>{getConversationHistoryTime(props?.message?.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatMessage;

const styles = StyleSheet.create({
  messageContainer: {
    paddingHorizontal: 9,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sentContainer: {
    backgroundColor: '#E2E8F7',
    alignSelf: 'flex-end',
    borderRadius: 20,
    marginBottom: 10,
    marginRight: 10,
    maxWidth: '75%',
    padding: 10,
    borderRadius: 10,
    borderBottomRightRadius: 0,
  },
  sentText: {
    color: '#000',
    fontSize: 16,
  },
  receivedContainer: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderWidth: 0.15,
    borderColor: '#818181',
    borderRadius: 3.5,
    borderBottomLeftRadius: 0,
    marginBottom: 10,
    marginLeft: 10,
    maxWidth: '75%',
    padding: 10,
  },
  receivedText: {
    color: '#000',
    fontSize: 16,
  },
  msgStatus: {
    marginStart: 15,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeStamp: {
    marginHorizontal: 4,
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