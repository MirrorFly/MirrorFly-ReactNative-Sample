import React from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { BlockedIcon } from '../common/Icons';
import Text from '../common/Text';
import { getConversationHistoryTime } from '../common/timeStamp';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { toggleMessageSelection } from '../redux/chatMessageDataSlice';
import { getChatMessages, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import MessagePressable from './MessagePressable';

const DeletedMessage = ({ chatUser, item, isSender }) => {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const userId = getUserIdFromJid(chatUser);
   const dispatch = useDispatch();
   const { isSelected = 0, msgId = '', createdAt = '' } = item;

   const handlePress = () => {
      Keyboard.dismiss();
      const messsageList = getChatMessages(userId);
      const isAnySelected = messsageList.some(item => item.isSelected === 1);
      if (isAnySelected) {
         const selectData = {
            chatUserId: getUserIdFromJid(chatUser),
            msgId,
         };
         dispatch(toggleMessageSelection(selectData));
      }
   };

   const handleLongPress = () => {
      Keyboard.dismiss();
      const selectData = {
         chatUserId: getUserIdFromJid(chatUser),
         msgId,
      };
      dispatch(toggleMessageSelection(selectData));
   };

   return (
      <Pressable
         delayLongPress={300}
         pressedStyle={commonStyles.bg_transparent}
         onPress={handlePress}
         onLongPress={handleLongPress}>
         {({ pressed }) => (
            <View
               style={[
                  styles.messageContainer,
                  isSelected ? { backgroundColor: themeColorPalatte.highlighedMessageBg } : undefined,
               ]}>
               <MessagePressable
                  forcePress={pressed}
                  style={[
                     commonStyles.paddingHorizontal_12,
                     isSender ? commonStyles.alignSelfFlexEnd : commonStyles.alignSelfFlexStart,
                  ]}
                  contentContainerStyle={[
                     styles.messageCommonStyle,
                     isSender ? styles.sentMessage : styles.receivedMessage,
                  ]}
                  delayLongPress={300}
                  onPress={handlePress}
                  onLongPress={handleLongPress}>
                  <View style={styles.messageWrapper}>
                     <BlockedIcon color="#959595" />
                     <Text
                        style={[
                           styles.message,
                           { color: isSender ? themeColorPalatte.secondaryTextColor : '#313131' },
                        ]}>
                        {isSender
                           ? stringSet.COMMON_TEXT.YOU_DELETED_THIS_MESSAGE
                           : stringSet.COMMON_TEXT.THIS_MESSAGE_WAS_DELETED}
                     </Text>
                  </View>
                  <View style={styles.timeStamp}>
                     <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
                  </View>
               </MessagePressable>
            </View>
         )}
      </Pressable>
   );
};

export default DeletedMessage;

const styles = StyleSheet.create({
   messageWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 7,
   },
   message: {
      marginLeft: 5,
      fontSize: 13,
      fontStyle: 'italic',
      paddingHorizontal: 3,
      paddingVertical: 4,
   },
   timeStamp: {
      padding: 2,
      marginBottom: 4,
      alignSelf: 'flex-end',
   },
   timeStampText: {
      paddingLeft: 4,
      color: '#455E93',
      fontSize: 10,
      fontWeight: '400',
   },
   messageContainer: {
      marginBottom: 6,
   },
   messageCommonStyle: {
      borderRadius: 10,
      overflow: 'hidden',
      borderColor: '#DDE3E5',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      width: '100%',
   },
   sentMessage: {
      backgroundColor: '#E2E8F7',
      borderWidth: 0,
      borderBottomRightRadius: 0,
   },
   receivedMessage: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderBottomLeftRadius: 0,
   },
});
