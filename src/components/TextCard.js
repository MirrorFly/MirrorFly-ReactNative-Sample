import { Text, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import ReplyMessage from './ReplyMessage';

const TextCard = props => {
  const { handleReplyPress, message } = props;
  const { msgBody: { replyTo = '' } = {} } = message;
  return (
    <View
      bgColor={props.isSame ? '#E2E8F7' : '#fff'}
      borderRadius={10}
      overflow={'hidden'}
      borderWidth={props.isSame ? 0 : 1}
      borderBottomLeftRadius={props.isSame ? 10 : 0}
      borderBottomRightRadius={props.isSame ? 0 : 10}
      borderColor="#DDE3E5"
      px="1">
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={props.message}
          isSame={props.isSame}
        />
      )}
      <Text style={styles.message}>{props.data?.message}</Text>
      <View style={styles.timeStamp}>
        {props.data.status}
        <Text pl="1" color="#455E93" fontSize="10" fontWeight={300}>
          {props.data.timeStamp}
        </Text>
      </View>
    </View>
  );
};
export default TextCard;

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    paddingHorizontal: 3,
    paddingVertical: 4,
    color: '#313131',
  },
  timeStamp: {
    flexDirection: 'row',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
