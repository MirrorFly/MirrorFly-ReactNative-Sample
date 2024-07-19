import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getConversationHistoryTime } from '../common/timeStamp';
import { escapeRegExpReservedChars, getMessageStatus } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import ReplyMessage from './ReplyMessage';

const TextCard = ({ item, isSender }) => {
   const { createdAt = '', msgStatus = 0, msgBody: { message = '', replyTo = '' } = {} } = item;

   return (
      <View style={commonStyles.paddingHorizontal_4}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSame={isSender} />}
         <Text style={styles.message}>
            <ChatConversationHighlightedText text={message} textStyle={styles.message} searchValue={''} />
         </Text>
         <View style={styles.timeStamp}>
            {isSender && getMessageStatus(msgStatus)}
            <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
         </View>
      </View>
   );
};
export default TextCard;

export const ChatConversationHighlightedText = ({ textStyle = {}, text, searchValue = '', index }) => {
   let parts = searchValue ? text.split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'i')) : [text];
   return (
      <Text>
         {parts.map((part, i) => {
            const isSearchMatch = part?.toLowerCase() === searchValue.toLowerCase() ? styles.highlight : {};
            return (
               <Text key={++i + '-' + index} ellipsizeMode="tail" style={[textStyle, isSearchMatch]}>
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
      fontWeight: '400',
   },

   highlight: {
      backgroundColor: '#D69C23',
      fontWeight: 'bold',
   },
});
