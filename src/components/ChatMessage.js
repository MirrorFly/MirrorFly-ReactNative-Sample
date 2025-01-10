import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { CONNECTED } from '../SDK/constants';
import { sendSeenStatus } from '../SDK/utils';
import NickName from '../common/NickName';
import {
   getIsConversationScreenActive,
   getUserIdFromJid,
   handleFileOpen,
   openLocationExternally,
   setIsConversationScreenActive,
} from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { toggleMessageSelection } from '../redux/chatMessageDataSlice';
import { getChatMessages, useThemeColorPalatte, useXmppConnectionStatus } from '../redux/reduxHook';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';
import DeletedMessage from './DeletedMessage';
import Message from './Message';
import MessagePressable from './MessagePressable';
import NotificationMessage from './NotificationMessage';

function ChatMessage({ chatUser, item, showNickName, label }) {
   const dispatch = useDispatch();
   const navigation = useNavigation();
   const useXmppStatus = useXmppConnectionStatus();
   const userId = getUserIdFromJid(chatUser);
   const themeColorPalatte = useThemeColorPalatte();
   const {
      shouldHighlight = 0,
      msgStatus,
      publisherJid,
      msgId,
      recallStatus = 0,
      deleteStatus = 0,
      isSelected = 0,
      msgBody: {
         location: { latitude = '', longitude = '' } = {},
         nickName = '',
         message_type,
         media: { is_uploading, is_downloaded, androidWidth = 0 } = {},
      } = {},
   } = item;
   const isSender = getCurrentUserJid() === publisherJid;
   const messageWidth = androidWidth || '80%';

   useFocusEffect(
      React.useCallback(() => {
         setIsConversationScreenActive(true);
         if (
            getIsConversationScreenActive() &&
            useXmppStatus === CONNECTED &&
            !isSender &&
            msgStatus !== 2 &&
            deleteStatus === 0 &&
            recallStatus === 0
         ) {
            const groupId = MIX_BARE_JID.test(chatUser) ? getUserIdFromJid(chatUser) : '';
            sendSeenStatus(publisherJid, msgId, groupId);
         }
         return () => {
            setIsConversationScreenActive(false);
         };
      }, [useXmppStatus]),
   );

   const onPress = () => {
      const messsageList = getChatMessages(userId);
      const isAnySelected = messsageList?.some?.(item => item.isSelected === 1);
      switch (true) {
         case isAnySelected:
            const selectData = {
               chatUserId: getUserIdFromJid(chatUser),
               msgId,
            };
            dispatch(toggleMessageSelection(selectData));
            break;
         case is_downloaded === 2 && is_uploading === 2 && (message_type === 'image' || message_type === 'video'):
            if (Keyboard.isVisible()) {
               let hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
                  navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid: chatUser, msgId: msgId });
                  hideSubscription.remove();
               });
               Keyboard.dismiss();
            } else {
               navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid: chatUser, msgId: msgId });
            }
            break;
         case is_downloaded === 2 && is_uploading === 2 && message_type === 'file':
            handleFileOpen(item);
            break;
         case message_type === 'locaiton':
            openLocationExternally(latitude, longitude);
            break;
      }
   };

   const onLongPress = () => {
      const selectData = {
         chatUserId: getUserIdFromJid(chatUser),
         msgId,
      };
      dispatch(toggleMessageSelection(selectData));
   };

   const renderMessage = React.useMemo(() => {
      console.log('render chat message msgId ==>', msgId);
      if (!message_type) {
         return null;
      }
      if (deleteStatus) {
         return null;
      }

      if (recallStatus) {
         return <DeletedMessage chatUser={chatUser} item={item} isSender={isSender} />;
      }

      if (message_type === 'notification') {
         return <NotificationMessage messageObject={item} themeColorPalatte={themeColorPalatte} label={label} />;
      }

      if (recallStatus) {
         return <DeletedMessage chatUser={chatUser} item={item} isSender={isSender} />;
      }
      return (
         <Pressable
            style={
               shouldHighlight && {
                  backgroundColor: themeColorPalatte.highlighedMessageBg,
               }
            }
            delayLongPress={300}
            pressedStyle={commonStyles.bg_transparent}
            onPress={onPress}
            onLongPress={onLongPress}>
            {({ pressed }) => (
               <View
                  style={[
                     styles.messageContainer,
                     isSelected ? { backgroundColor: themeColorPalatte.highlighedMessageBg } : undefined,
                  ]}>
                  <View
                     style={[
                        commonStyles.hstack,
                        commonStyles.alignItemsCenter,
                        commonStyles.paddingHorizontal_12,
                        isSender ? commonStyles.alignSelfFlexEnd : commonStyles.alignSelfFlexStart,
                     ]}>
                     <MessagePressable
                        forcePress={pressed}
                        style={[styles.messageContentPressable, { maxWidth: messageWidth }]}
                        contentContainerStyle={[
                           styles.messageCommonStyle,
                           isSender
                              ? [styles.sentMessage, { backgroundColor: themeColorPalatte.chatSenderPrimaryColor }]
                              : [
                                   styles.receivedMessage,
                                   { backgroundColor: themeColorPalatte.chatReceiverPrimaryColor },
                                ],
                        ]}
                        delayLongPress={300}
                        onPress={onPress}
                        onLongPress={onLongPress}>
                        {showNickName && !isSender && message_type && (
                           <NickName
                              style={styles.nickname}
                              userId={item.publisherId}
                              colorCodeRequired={true}
                              data={{ nickName }}
                           />
                        )}
                        <Message item={item} isSender={isSender} chatUser={chatUser} />
                     </MessagePressable>
                  </View>
               </View>
            )}
         </Pressable>
      );
   }, [item]);
   return (
      <>
         <NotificationMessage label={label} />
         {renderMessage}
      </>
   );
}

export default React.memo(ChatMessage);

const styles = StyleSheet.create({
   currentStatus: {
      marginStart: 15,
      width: 6,
      height: 6,
      borderRadius: 3,
   },
   messageContainer: {
      marginBottom: 6,
   },
   messageContentPressable: {
      minWidth: '30%',
   },
   messageCommonStyle: {
      borderRadius: 10,
      overflow: 'hidden',
      borderColor: '#DDE3E5',
   },
   sentMessage: {
      borderWidth: 0,
      borderBottomRightRadius: 0,
   },
   receivedMessage: {
      borderWidth: 1,
      borderBottomLeftRadius: 0,
   },
   nickname: {
      marginLeft: 3,
      marginTop: 5,
      padding: 5,
      paddingBottom: 0,
      fontWeight: '500',
      fontSize: 13,
   },
});
