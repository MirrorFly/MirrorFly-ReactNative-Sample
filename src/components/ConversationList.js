import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { fetchMessagesFromSDK, getHasNextPage, handleConversationScollToBottomPress } from '../Helper/Chat/ChatHelper';
import { CHAT_TYPE_GROUP } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { DoubleDownArrow } from '../common/Icons';
import Pressable from '../common/Pressable';
import config from '../config';
import ApplicationColors from '../config/appColors';
import { NOTIFICATION } from '../constant';
import { conversationFlatListRef, conversationFlatListScrollPositionRef } from '../hooks/useConversation';
import ChatMessage from './ChatMessage';

const listBottomYaxisLimit = 60;

function ConversationList({ chatUserJid }) {
   const [initLoading, setInitLoading] = React.useState(true);
   const [chatLoading, setChatLoading] = React.useState(false);
   const [showScrollToBottomIcon, setShowScrollToBottomIcon] = React.useState(false);
   const [newMsgCount, setNewMsgCount] = React.useState(0);
   const messageListRef = React.useRef([]);
   const chatUserId = getUserIdFromJid(chatUserJid);
   const messages = useSelector(state => state.chatConversationData.data[chatUserId]?.messages);

   React.useEffect(() => {
      fetchData();
   }, [chatUserId]);

   const messageList = React.useMemo(() => {
      if (chatUserId) {
         const _previousMessageList = messageListRef.current;
         const lastMessageInPreviousMessage = _previousMessageList?.[0]?.msgId;
         const data = Object.values(messages || {}) || [];
         const lastMessageInCurrentMessage = data[data.length - 1]?.msgId;
         data.reverse();
         if (
            data.length > _previousMessageList.length && // to check if there is any new msg
            data[0]?.publisherId === chatUserId && // to check if the new msg is received from the other user
            conversationFlatListScrollPositionRef.current.y > listBottomYaxisLimit && // to check if the list scroll position is not in the bottom
            lastMessageInPreviousMessage !== lastMessageInCurrentMessage
         ) {
            setNewMsgCount(val => val + 1);
         }
         messageListRef.current = data; // updating the ref to track the previously calculated data like the total message count

         return data;
      }
      return [];
   }, [messages, chatUserId]);

   const fetchData = async () => {
      if (!messageList.length) {
         await fetchMessagesFromSDK(chatUserJid);
      }
      setInitLoading(false);
   };

   const chatMessageRender = React.useCallback(
      ({ item, index }) => {
         const notifiactionCheck = messageList[index + 1]?.message_type;
         const nextMessageUserId = messageList[index + 1]?.publisherId;
         const currentMessageUserId = item?.publisherId;
         const showNickName =
            notifiactionCheck === NOTIFICATION
               ? true
               : item.chatType === CHAT_TYPE_GROUP && nextMessageUserId !== currentMessageUserId;
         return <ChatMessage item={item} showNickName={showNickName} />;
      },
      [messageList],
   );

   const handleConversationScoll = ({ nativeEvent }) => {
      const { contentOffset } = nativeEvent;
      conversationFlatListScrollPositionRef.current = { ...contentOffset };
      if (contentOffset.y > config.conversationListBottomYaxisLimit) {
         !showScrollToBottomIcon && setShowScrollToBottomIcon(true);
      } else {
         newMsgCount > 0 && setNewMsgCount(0);
         showScrollToBottomIcon && setShowScrollToBottomIcon(false);
      }
   };

   const doNothing = () => null;

   const handleLoadMore = async () => {
      if (chatLoading || !getHasNextPage(getUserIdFromJid(chatUserJid))) {
         return;
      }
      setChatLoading(true);
      await fetchMessagesFromSDK(chatUserJid, true);
      setChatLoading(false);
   };

   if (initLoading && !messageList.length) {
      return <ActivityIndicator color={ApplicationColors.mainColor} size={'large'} />;
   }

   const renderChatFooter = () => {
      return chatLoading ? <ActivityIndicator color={ApplicationColors.mainColor} size={'large'} /> : null;
   };

   return (
      <>
         <FlatList
            keyboardShouldPersistTaps={'always'}
            ref={conversationFlatListRef}
            data={messageList}
            inverted={Boolean(messageList.length)}
            renderItem={chatMessageRender}
            keyExtractor={item => item.msgId.toString()}
            maxToRenderPerBatch={20}
            onScrollToIndexFailed={doNothing}
            onScroll={handleConversationScoll}
            scrollEventThrottle={1}
            windowSize={20}
            onEndReached={handleLoadMore}
            ListFooterComponent={renderChatFooter}
            onEndReachedThreshold={0.1}
            disableVirtualization={true}
         />
         {showScrollToBottomIcon && (
            <Pressable
               style={styles.floatingScrollToBottomIconWrapper}
               contentContainerStyle={styles.floatingScrollToBottomIconContent}
               pressedStyle={styles.floatingScrollToBottomIconPressed}
               onPress={handleConversationScollToBottomPress}>
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
      </>
   );
}

export default ConversationList;

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
