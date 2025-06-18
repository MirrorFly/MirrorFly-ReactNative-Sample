import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import Text from '../common/Text';
import { getConversationHistoryTime } from '../common/timeStamp';
import { findUrls, getMessageStatus } from '../helpers/chatHelpers';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import ReplyMessage from './ReplyMessage';
import { randomString } from '../SDK/utils';
import PropTypes from 'prop-types';

const TextCard = ({ item, isSender }) => {
   const themeColorPalatte = useThemeColorPalatte();
   const { createdAt = '', msgStatus = 0, msgBody: { message = '', replyTo = '' } = {}, editMessageId } = item;
   /**const searchText = useChatSearchText('');*/

   return (
      <View style={commonStyles.paddingHorizontal_4}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSender={isSender} />}
         <Text
            style={[
               styles.message,
               commonStyles.textColor(
                  isSender
                     ? themeColorPalatte.chatSenderPrimaryTextColor
                     : themeColorPalatte.chatReceiverPrimaryTextColor,
               ),
            ]}>
            <ChatConversationHighlightedText
               text={message}
               textStyle={{
                  ...styles.message,
                  ...commonStyles.textColor(
                     isSender
                        ? themeColorPalatte.chatSenderPrimaryTextColor
                        : themeColorPalatte.chatReceiverPrimaryTextColor,
                  ),
               }}
               searchValue={''}
            />
         </Text>
         <View style={styles.timeStamp}>
            {isSender && getMessageStatus(msgStatus)}
            {editMessageId && (
               <Text
                  style={[
                     styles.timeStampText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderSecondaryTextColor
                           : themeColorPalatte.chatReceiverSecondaryTextColor,
                     ),
                     { paddingLeft: 4 },
                  ]}>
                  Edited
               </Text>
            )}
            <Text
               style={[
                  styles.timeStampText,
                  commonStyles.textColor(
                     isSender
                        ? themeColorPalatte.chatSenderSecondaryTextColor
                        : themeColorPalatte.chatReceiverSecondaryTextColor,
                  ),
               ]}>
               {getConversationHistoryTime(createdAt)}
            </Text>
         </View>
      </View>
   );
};

TextCard.propTypes = {
   item: PropTypes.object.isRequired,
   isSender: PropTypes.bool.isRequired,
};

export const ChatConversationHighlightedText = ({ textStyle = {}, text, searchValue = '', index }) => {
   const segments = findUrls(text);

   const handlePress = url => {
      Linking.openURL(url);
   };

   return (
      <Text>
         {segments.map((segment, i) => {
            const content = segment.content;
            const lowerCaseContent = content.toLowerCase();
            const lowerCaseSearchValue = searchValue.toLowerCase();

            if (lowerCaseSearchValue && lowerCaseContent.includes(lowerCaseSearchValue)) {
               const parts = content.split(new RegExp(`(${searchValue})`, 'i'));

               return parts.map((part, partIndex) => {
                  const isMatch = part.toLowerCase() === lowerCaseSearchValue;
                  const highlightStyle = isMatch ? styles.highlight : {};
                  const urlStyle = segment.isUrl ? styles.underline : {}; // Apply underline only for URLs

                  return (
                     <Text
                        key={randomString()}
                        style={[textStyle, highlightStyle, urlStyle]}
                        onPress={() => segment.isUrl && handlePress(segment.content)}
                        suppressHighlighting={!segment.isUrl}>
                        {part}
                     </Text>
                  );
               });
            }

            // If no match, render normally
            const urlStyle = segment.isUrl ? styles.underline : {};
            return segment.isUrl ? (
               <Text
                  key={randomString()}
                  style={[textStyle, urlStyle]}
                  onPress={() => segment.isUrl && handlePress(segment.content)}
                  suppressHighlighting={!segment.isUrl}>
                  {content}
               </Text>
            ) : (
               <Text key={randomString()} style={[textStyle]}>
                  {content}
               </Text>
            );
         })}
      </Text>
   );
};

ChatConversationHighlightedText.propTypes = {
   textStyle: PropTypes.object,
   text: PropTypes.string.isRequired,
   searchValue: PropTypes.string,
   index: PropTypes.number,
};

const styles = StyleSheet.create({
   message: {
      fontSize: 14,
      paddingHorizontal: 5,
      paddingVertical: 8,
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
      paddingHorizontal: 4,
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
