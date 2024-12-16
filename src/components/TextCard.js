import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { getConversationHistoryTime } from '../common/timeStamp';
import { findUrls, getMessageStatus } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import ReplyMessage from './ReplyMessage';

const TextCard = ({ item, isSender }) => {
   const { createdAt = '', msgStatus = 0, msgBody: { message = '', replyTo = '' } = {}, editMessageId } = item;

   return (
      <View style={commonStyles.paddingHorizontal_4}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSame={isSender} />}
         <Text style={styles.message}>
            <ChatConversationHighlightedText text={message} textStyle={styles.message} searchValue={''} />
         </Text>
         <View style={styles.timeStamp}>
            {isSender && getMessageStatus(msgStatus)}
            {editMessageId && <Text style={[styles.timeStampText, { paddingLeft: 4 }]}>Edited</Text>}
            <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
         </View>
      </View>
   );
};

export const ChatConversationHighlightedText = ({ textStyle = {}, text, searchValue = 'hi', index }) => {
   // Use the findUrls function to split the text into URL and non-URL parts
   const segments = findUrls(text);
   const handlePress = url => {
      Linking.openURL(url);
   };

   return (
      <Text>
         {segments.map((segment, i) => {
            const isSearchMatch = segment.content.toLowerCase() === searchValue.toLowerCase() ? styles.highlight : {};
            const urlStyle = segment.isUrl ? styles.underline : {}; // Apply underline only for URLs
            return (
               <Text
                  key={i + '-' + index}
                  ellipsizeMode="tail"
                  style={[textStyle, isSearchMatch, urlStyle]} // Combine textStyle, highlight, and urlStyle
                  onPress={() => segment.isUrl && handlePress(segment.content)} // Only make URL parts clickable
                  suppressHighlighting={!segment.isUrl}>
                  {segment.content}
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
   underline: {
      color: '#3276E2',
      textDecorationLine: 'underline', // Underline style for URLs
   },
});

export default TextCard;
