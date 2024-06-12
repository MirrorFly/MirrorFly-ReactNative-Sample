import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { CONNECTED } from '../SDK/constants';
import { sendSeenStatus } from '../SDK/utils';
import NickName from '../common/NickName';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { toggleMessageSelection } from '../redux/chatMessageDataSlice';
import { getChatMessages, useXmppConnectionStatus } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';
import DeletedMessage from './DeletedMessage';
import Message from './Message';
import MessagePressable from './MessagePressable';
import NotificationMessage from './NotificationMessage';

function ChatMessage({ chatUser, item, showNickName }) {
   const dispatch = useDispatch();
   const useXmppStatus = useXmppConnectionStatus();
   const userId = getUserIdFromJid(chatUser);
   const {
      msgStatus,
      publisherJid,
      msgId,
      recallStatus = 0,
      deleteStatus = 0,
      isSelected = 0,
      msgBody: {
         nickName = '',
         message_type,
         media = {},
         media: { is_uploading, file = {}, androidWidth = 0 } = {},
      } = {},
   } = item;
   const isSender = getCurrentUserJid() === publisherJid;
   const messageWidth = androidWidth || '80%';
   console.log('msgId ==>', msgId, message_type);

   React.useEffect(() => {
      if (useXmppStatus === CONNECTED && !isSender && msgStatus !== 2) {
         const groupId = MIX_BARE_JID.test(chatUser) ? getUserIdFromJid(chatUser) : '';
         sendSeenStatus(publisherJid, msgId, groupId);
      }
   }, [useXmppStatus]);

   const onPress = () => {
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

   const onLongPress = () => {
      const selectData = {
         chatUserId: getUserIdFromJid(chatUser),
         msgId,
      };
      dispatch(toggleMessageSelection(selectData));
   };

   if (!message_type) {
      return null;
   }

   if (deleteStatus) {
      return null;
   }

   if (message_type === 'notification') {
      return <NotificationMessage messageObject={item} />;
   }

   if (recallStatus) {
      return <DeletedMessage chatUser={chatUser} item={item} isSender={isSender} />;
   }

   return (
      <Pressable
         style={{}}
         delayLongPress={300}
         pressedStyle={commonStyles.bg_transparent}
         onPress={onPress}
         onLongPress={onLongPress}>
         {({ pressed }) => (
            <View style={[styles.messageContainer, isSelected ? styles.highlightMessage : undefined]}>
               <View
                  style={[
                     commonStyles.paddingHorizontal_12,
                     isSender ? commonStyles.alignSelfFlexEnd : commonStyles.alignSelfFlexStart,
                  ]}>
                  <MessagePressable
                     forcePress={pressed}
                     style={[styles.messageContentPressable, { maxWidth: messageWidth }]}
                     contentContainerStyle={[
                        styles.messageCommonStyle,
                        isSender ? styles.sentMessage : styles.receivedMessage,
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
}

export default React.memo(ChatMessage);

const styles = StyleSheet.create({
   currentStatus: {
      marginStart: 15,
      width: 6,
      height: 6,
      borderRadius: 3,
   },
   bgClr: {
      backgroundColor: 'red',
   },
   notDelivered: {
      backgroundColor: '#818181',
   },
   delivered: {
      backgroundColor: '#FFA500',
   },
   seen: {
      backgroundColor: '#66E824',
   },
   flex1: { flex: 1 },
   deleteContainer: {
      marginBottom: 0.2,
   },
   messageContainer: {
      marginBottom: 6,
   },
   highlightMessage: {
      backgroundColor: ApplicationColors.highlighedMessageBg,
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
      backgroundColor: '#E2E8F7',
      borderWidth: 0,
      borderBottomRightRadius: 0,
   },
   receivedMessage: {
      backgroundColor: '#fff',
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
