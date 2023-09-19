import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import ReplyMessage from './ReplyMessage';
import commonStyles from '../common/commonStyles';

const TextCard = props => {
  const { handleReplyPress, message } = props;
  const { msgBody: { replyTo = '' } = {} } = message;

  const conversationSearchText = useSelector(
    state => state.conversationSearchData?.searchText,
  );

  return (
    <View style={commonStyles.paddingHorizontal_4}>
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={props.message}
          isSame={props.isSame}
        />
      )}
      <Text style={styles.message}>
        <ChatConversationHighlightedText
          text={props.data?.message}
          textStyle={styles.message}
          searchValue={conversationSearchText.trim()}
        />
      </Text>

      <View style={styles.timeStamp}>
        {props.data.status}
        <Text style={styles.timeStampText}>{props.data.timeStamp}</Text>
      </View>
    </View>
  );
};
export default TextCard;

const escapeRegExpReservedChars = str => {
  return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const ChatConversationHighlightedText = ({
  textStyle = {},
  text,
  searchValue = '',
  index,
}) => {
  let parts = searchValue
    ? text.split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'i'))
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
            key={++i + '-' + index}
            ellipsizeMode="tail"
            style={[textStyle, isSearchMatch]}>
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
    paddingHorizontal: 5,
    paddingVertical: 8,
    color: '#313131',
    lineHeight: 20,
  },
  timeStamp: {
    flexDirection: 'row',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeStampText: {
    paddingLeft: 4,
    color: '#455E93',
    fontSize: 10,
    fontWeight: '300',
  },

  highlight: {
    backgroundColor: '#D69C23',
    fontWeight: 'bold',
  },
});
