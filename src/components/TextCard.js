import { HStack, Text, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import ReplyMessage from './ReplyMessage';

const TextCard = props => {
  const { handleReplyPress, message } = props;
  const { msgBody: { replyTo = '' } = {} } = message;
  const searchMsgList = useSelector(
    state => state?.searchMessageInfo.searchMessageText,
  );
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
      <View>
        <HighlightedText
          text={props.data?.message}
          searchValue={searchMsgList}
        />
      </View>

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

const HighlightedText = ({ text, searchValue = '', index }) => {
  const parts = searchValue
    ? text.split(new RegExp(`(${searchValue})`, 'gi'))
    : [text];

  return (
    <Text>
      {parts.map((part, i) => {
        const isSearchMatch =
          part.toLowerCase() === searchValue.toLowerCase()
            ? styles.highlight
            : {};
        return (
          <Text
            color="coolGray.800"
            key={++i + '-' + index}
            dark={{ color: 'warmGray.50' }}
            ellipsizeMode="tail"
            style={isSearchMatch}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

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
  highlight: {
    backgroundColor: '#D69C23',
    fontWeight: 'bold',
  },
});
