import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect } from '@react-navigation/native';
import React, { useRef } from 'react';
import { AppState, FlatList, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CHAT_TYPE_GROUP } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { showToast } from '../Helper/index';
import SDK from '../SDK/SDK';
import { DoubleDownArrow } from '../common/Icons';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import { INVITE_APP_URL, INVITE_SMS_CONTENT } from '../constant';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import { resetUnreadCountForChat } from '../redux/Actions/RecentChatAction';
import { updateConversationTotalSearchResults } from '../redux/Actions/conversationSearchAction';
import { isActiveChatScreenRef } from './ChatConversation';
import ChatMessage from './ChatMessage';
import DeletedMessage from './DeletedMessage';
import NotificationMessage from './NotificationMessage';
import { updateMsgSeenStatus } from './chat/common/createMessage';

const listBottomYaxisLimit = 60;

const ChatConversationList = ({
   handleMessageListUpdated,
   setLocalNav,
   fromUserJId,
   selectedMsgs,
   selectedMsgsIdRef,
   handleMsgSelect,
   onSelectedMessageUpdate,
}) => {
   const { id: messagesReducerId, data: messages } = useSelector(state => state.chatConversationData);

   const { searchText: conversationSearchText, messageIndex: searchMesageIndex } =
      useSelector(state => state.conversationSearchData) || {};
   const xmppConnection = useSelector(state => state.connection.xmppStatus);
   const dispatch = useDispatch();
   const flatListRef = React.useRef(null);
   const flatListScrollPositionRef = useRef({ x: 0, y: 0 });
   const filteredMessageIndexes = React.useRef([]);
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const [highlightMessageId, setHighlightMessageId] = React.useState('');
   const [showContactInviteModal, setShowContactInviteModal] = React.useState(false);
   const [showScrollToBottomIcon, setShowScrollToBottomIcon] = React.useState(false);

   const messageListRef = React.useRef([]);

   const [newMsgCount, setNewMsgCount] = React.useState(0);

   const inviteContactMessageRef = useRef();

   const messageList = React.useMemo(() => {
      const id = getUserIdFromJid(fromUserJId);
      if (id) {
         const _previousMessageList = messageListRef.current;
         const data = messages[id]?.messages ? Object.values(messages[id]?.messages) : [];
         data.reverse();
         // update the new messages count
         if (
            data.length > _previousMessageList.length && // to check if there is any new msg
            data[0]?.fromUserId === id && // to check if the new msg is received from the other user
            flatListScrollPositionRef.current.y > listBottomYaxisLimit // to check if the list scroll position is not in the bottom
         ) {
            setNewMsgCount(val => val + 1);
         }
         handleMessageListUpdated(messages[id]?.messages);
         onSelectedMessageUpdate(messages[id]?.messages);
         messageListRef.current = data; // updating the ref to track the previously calculated data like the total message count
         return data;
      }
      return [];
   }, [messages, fromUserJId]);

   useFocusEffect(
      React.useCallback(() => {
         isActiveChatScreenRef.current = true;
         return () => (isActiveChatScreenRef.current = false);
      }, []),
   );

   useFocusEffect(
      React.useCallback(() => {
         SDK.activeChatUser(fromUserJId || '');
         SDK.updateRecentChatUnreadCount(fromUserJId);
         dispatch(resetUnreadCountForChat(fromUserJId));
         // App state change listener for background and foreground change
         const subscription = AppState.addEventListener('change', _state => {
            if (_state === 'active') {
               SDK.activeChatUser(fromUserJId || '');
            } else if (_state === 'background') {
               SDK.activeChatUser('');
            }
         });
         return () => {
            SDK.activeChatUser('');
            subscription.remove();
         };
      }, [fromUserJId]),
   );

   useFocusEffect(
      React.useCallback(() => {
         updateMsgSeenStatus();
      }, [messagesReducerId, xmppConnection]),
   );

   React.useEffect(() => {
      const isSender = messageList[0]?.fromUserJid === currentUserJID;
      if (flatListRef.current && isSender) {
         flatListRef.current.scrollToIndex({
            index: 0,
            animated: true,
         });
      }
   }, [messageList.length]);

   React.useEffect(() => {
      fetchMessagesFromSDK();
   }, [fromUserJId, messages]);

   React.useEffect(() => {
      if (conversationSearchText.trim()) {
         // updating the filtered messages indices refs data
         filteredMessageIndexes.current = [];
         const _filteredMsgIndices = [];
         const _searchText = conversationSearchText.trim().toLowerCase();
         messageList.forEach((msg, index) => {
            if (msg?.msgBody?.message_type === 'text') {
               if (msg?.msgBody?.message?.toLowerCase?.().includes?.(_searchText)) {
                  _filteredMsgIndices.push({ index, msgId: msg.msgId });
               }
            } else if (msg?.msgBody?.message_type === 'file') {
               if (msg?.msgBody?.media?.fileName?.toLowerCase?.().includes?.(_searchText)) {
                  _filteredMsgIndices.push({ index, msgId: msg.msgId });
               }
            }
         });
         filteredMessageIndexes.current = _filteredMsgIndices;
         setTimeout(() => {
            dispatch(updateConversationTotalSearchResults(_filteredMsgIndices.length));
         }, 0);
      }
   }, [messageList, conversationSearchText]);

   React.useEffect(() => {
      if (conversationSearchText.trim() && searchMesageIndex > -1) {
         const _indexToScroll = filteredMessageIndexes.current?.[searchMesageIndex]?.index ?? -1;
         // updating the scrollview ref when searchText or the search message index changed
         if (_indexToScroll > -1) {
            setHighlightMessageId(filteredMessageIndexes.current?.[searchMesageIndex]?.msgId);
            flatListRef.current.scrollToIndex({
               index: _indexToScroll,
               animated: true,
               viewPosition: 0.5,
            });
            setTimeout(() => {
               setHighlightMessageId('');
            }, 500);
         }
      }
   }, [conversationSearchText, searchMesageIndex]);

   const fetchMessagesFromSDK = async (forceGetFromSDK = false) => {
      if (forceGetFromSDK || !messages[getUserIdFromJid(fromUserJId)]) {
         let chatMessage = await SDK.getChatMessages(fromUserJId);
         if (chatMessage?.statusCode === 200) {
            dispatch(addChatConversationHistory(chatMessage));
         }
      }
   };
   const findMsgIndex = React.useCallback(
      msgId => {
         const index = messageList.findIndex(item => item.msgId === msgId && item.deleteStatus === 0);
         if (index === -1) {
            return showToast('This message no longer availabe', {
               id: 'no_Longer',
            });
         } else {
            return index;
         }
      },
      [messageList],
   );

   const handleReplyPress = React.useCallback(
      (replyId, item, onLongPress = false) => {
         const selectedMessagesLength = Object.keys(selectedMsgsIdRef?.current || {}).length;
         switch (true) {
            case selectedMessagesLength === 0 && onLongPress:
               handleMsgSelect(item);
               break;
            case selectedMessagesLength === 0:
               setHighlightMessageId(replyId);
               const scrollIndex = findMsgIndex(replyId);
               if (scrollIndex > -1) {
                  flatListRef.current.scrollToIndex({
                     index: scrollIndex,
                     animated: true,
                     viewPosition: 0.5,
                  });
                  setTimeout(() => {
                     setHighlightMessageId('');
                  }, 1000);
               }
               break;
            case selectedMessagesLength > 0:
               handleMsgSelect(item);
               break;
            default:
               break;
         }
      },
      [handleMsgSelect, findMsgIndex],
   );

   const toggleContactInviteModal = () => {
      setShowContactInviteModal(val => !val);
   };

   const handleShowContactInviteModal = message => {
      inviteContactMessageRef.current = message;
      toggleContactInviteModal();
   };

   const chatMessageRender = React.useCallback(
      ({ item, index }) => {
         const nextMessageUserId = messageList[index + 1]?.publisherId;
         const currentMessageUserId = item?.publisherId;
         const showNickName = item.chatType === CHAT_TYPE_GROUP && nextMessageUserId !== currentMessageUserId;

         const { deleteStatus = 0, recallStatus = 0, msgId, msgBody: { message_type = '' } = {} } = item;
         if (deleteStatus === 1) {
            return null;
         }

         if (message_type === 'notification') {
            return <NotificationMessage messageObject={item} />;
         }

         return recallStatus === 0 ? (
            <ChatMessage
               shouldHighlightMessage={highlightMessageId === msgId}
               handleReplyPress={handleReplyPress}
               setLocalNav={setLocalNav}
               handleMsgSelect={handleMsgSelect}
               shouldSelectMessage={selectedMsgsIdRef?.current?.[msgId]}
               showContactInviteModal={handleShowContactInviteModal}
               message={item}
               showNickName={showNickName}
            />
         ) : (
            <DeletedMessage
               selectedMsgs={selectedMsgs}
               currentUserJID={currentUserJID}
               handleMsgSelect={handleMsgSelect}
               messageObject={item}
            />
         );
      },
      [handleMsgSelect, selectedMsgs, setLocalNav, highlightMessageId, messageList],
   );

   const doNothing = () => null;

   const handleCopyInviteLink = () => {
      toggleContactInviteModal();
      Clipboard.setString(INVITE_APP_URL);
      showToast('Link Copied', { id: 'invite-link-copied-toast' });
   };

   const handleInviteContact = () => {
      toggleContactInviteModal();
      const ContactInfo = inviteContactMessageRef.current?.msgBody?.contact;
      if (ContactInfo) {
         // open the message app and invite the user to the app with content
         const phoneNumber = ContactInfo.phone_number[0];
         const separator = Platform.OS === 'ios' ? '&' : '?';
         const url = `sms:${phoneNumber}${separator}body=${INVITE_SMS_CONTENT}`;
         Linking.openURL(url);
      }
   };

   const handleConversationScoll = ({ nativeEvent }) => {
      const { contentOffset } = nativeEvent;
      flatListScrollPositionRef.current = { ...contentOffset };
      if (contentOffset.y > listBottomYaxisLimit) {
         !showScrollToBottomIcon && setShowScrollToBottomIcon(true);
      } else {
         newMsgCount > 0 && setNewMsgCount(0);
         showScrollToBottomIcon && setShowScrollToBottomIcon(false);
      }
   };

   const handleScollToBottomPress = () => {
      flatListRef.current.scrollToOffset({
         indexoffset: 0,
         animated: true,
      });
   };

   return (
      <>
         <FlatList
            keyboardShouldPersistTaps={'handled'}
            ref={flatListRef}
            data={messageList}
            inverted
            renderItem={chatMessageRender}
            keyExtractor={item => item.msgId.toString()}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            onScrollToIndexFailed={doNothing}
            onScroll={handleConversationScoll}
            scrollEventThrottle={1000}
            windowSize={15}
         />
         {showScrollToBottomIcon && (
            <Pressable
               style={styles.floatingScrollToBottomIconWrapper}
               contentContainerStyle={styles.floatingScrollToBottomIconContent}
               pressedStyle={styles.floatingScrollToBottomIconPressed}
               onPress={handleScollToBottomPress}>
               {newMsgCount > 0 && (
                  <View
                     style={[
                        styles.newMessgesCountBadgeWrapper,
                        newMsgCount > 99 && styles.newMessgesCountBadgeWrapperWith3Chars,
                     ]}>
                     <Text style={styles.newMessgesCountBadgeText}>{newMsgCount > 99 ? '99+' : newMsgCount}</Text>
                  </View>
               )}
               <DoubleDownArrow width={15} height={15} />
            </Pressable>
         )}
         <Modal visible={showContactInviteModal} onRequestClose={toggleContactInviteModal}>
            <ModalCenteredContent onPressOutside={toggleContactInviteModal}>
               <View style={styles.inviteFriendModalContentContainer}>
                  <Text style={styles.modalTitle}>Invite Friend</Text>
                  <Pressable onPress={handleCopyInviteLink}>
                     <Text style={styles.modalOption}>Copy Link</Text>
                  </Pressable>
                  <Pressable onPress={handleInviteContact}>
                     <Text style={styles.modalOption}>Send SMS</Text>
                  </Pressable>
               </View>
            </ModalCenteredContent>
         </Modal>
      </>
   );
};

export default React.memo(ChatConversationList);

const styles = StyleSheet.create({
   floatingScrollToBottomIconWrapper: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: ApplicationColors.mainBorderColor,
      opacity: 0.8,
      zIndex: 100,
   },
   floatingScrollToBottomIconContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   floatingScrollToBottomIconPressed: {
      backgroundColor: ApplicationColors.pressedBg,
      borderRadius: 15,
   },
   newMessgesCountBadgeWrapper: {
      position: 'absolute',
      right: '100%',
      marginRight: 2,
      minWidth: 20,
      paddingVertical: 1,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ApplicationColors.mainColor,
      borderRadius: 50,
   },
   newMessgesCountBadgeWrapperWith3Chars: {
      width: 33,
      paddingHorizontal: 0,
   },
   newMessgesCountBadgeText: {
      color: ApplicationColors.white,
   },
   inviteFriendModalContentContainer: {
      maxWidth: 500,
      width: '80%',
      backgroundColor: ApplicationColors.mainbg,
      borderRadius: 5,
      paddingVertical: 10,
   },
   modalTitle: {
      fontSize: 19,
      color: '#3c3c3c',
      fontWeight: '500',
      marginVertical: 15,
      paddingHorizontal: 25,
   },
   modalOption: {
      paddingHorizontal: 25,
      paddingVertical: 20,
      fontSize: 17,
   },
});
