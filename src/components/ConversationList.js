import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchMessagesFromSDK, getHasNextChatPage } from '../SDK/utils';
import { DoubleDownArrow } from '../common/Icons';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import { calculateOffset, getUserIdFromJid, handleConversationScollToBottom } from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, NOTIFICATION } from '../helpers/constants';
import { useChatMessages } from '../redux/reduxHook';
import { getCurrentUserJid } from '../uikitMethods';
import ChatMessage from './ChatMessage';

export const conversationFlatListRef = createRef();
conversationFlatListRef.current = {};
const estimatedItemHeight = 60;

const ConversationList = ({ chatUser }) => {
   const userId = useMemo(() => getUserIdFromJid(chatUser), [chatUser]);
   const currentUserId = useMemo(() => getUserIdFromJid(getCurrentUserJid()), []);
   const messages = useChatMessages(userId) || [];
   const messageListRef = useRef([]);
   const [chatLoading, setChatLoading] = useState(false);
   const [itemHeights, setItemHeights] = useState({});
   const [showScrollToBottomIcon, setShowScrollToBottomIcon] = useState(false);
   const [newMessagesCount, setNewMessagesCount] = useState(0);

   // Fetch initial messages
   useEffect(() => {
      const initialize = async () => {
         setChatLoading(true);
         await fetchMessagesFromSDK(chatUser, messages.length < 10);
         setChatLoading(false);
      };
      initialize();
   }, [chatUser]);

   // Monitor new messages and update counter
   useMemo(() => {
      const prevMessages = messageListRef.current;
      const prevLastMessage = prevMessages[0];
      const currentLastMessage = messages[0];

      if (
         messages.length > prevMessages.length &&
         messages[0]?.publisherId !== currentUserId &&
         currentLastMessage !== prevLastMessage
      ) {
         setNewMessagesCount(count => count + 1);
      }
      messageListRef.current = messages;
   }, [messages, currentUserId]);

   // Load more messages
   const handleLoadMore = async () => {
      if (chatLoading || !getHasNextChatPage(userId)) return;
      setChatLoading(true);
      await fetchMessagesFromSDK(chatUser, true);
      setChatLoading(false);
   };

   // Handle scroll position
   const handleScroll = useCallback(
      ({ nativeEvent }) => {
         const isAboveThreshold = nativeEvent.contentOffset.y > config.conversationListBottomYaxisLimit;
         setShowScrollToBottomIcon(isAboveThreshold);
         if (!isAboveThreshold && newMessagesCount > 0) {
            setNewMessagesCount(0);
         }
      },
      [newMessagesCount],
   );

   // Cache item layout
   const onItemLayout = useCallback((event, index) => {
      const { height } = event.nativeEvent.layout;
      setItemHeights(prev => ({ ...prev, [index]: height }));
   }, []);

   // Render each chat message
   const renderChatMessage = useCallback(
      ({ item, index }) => {
         const isNotification = messages[index + 1]?.msgBody.message_type === NOTIFICATION.toLowerCase();
         const nextPublisherId = messages[index + 1]?.publisherId;
         const showNickName =
            isNotification || (item.chatType === CHAT_TYPE_GROUP && nextPublisherId !== item?.publisherId);
         return (
            <View onLayout={event => onItemLayout(event, index)}>
               <ChatMessage chatUser={chatUser} item={item} showNickName={showNickName} />
            </View>
         );
      },
      [messages, chatUser],
   );

   return (
      <>
         {chatLoading && <ActivityIndicator size="large" color={ApplicationColors.mainColor} />}
         <FlatList
            initialNumToRender={10}
            ref={conversationFlatListRef}
            data={messages}
            inverted
            renderItem={renderChatMessage}
            keyExtractor={item => item.msgId.toString()}
            maxToRenderPerBatch={20}
            scrollEventThrottle={16}
            windowSize={5}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            onScroll={handleScroll}
            getItemLayout={(data, index) => ({
               length: itemHeights[index] || estimatedItemHeight,
               offset: calculateOffset(itemHeights, index),
               index,
            })}
         />
         {showScrollToBottomIcon && (
            <Pressable
               style={styles.floatingScrollToBottomIconWrapper}
               contentContainerStyle={styles.floatingScrollToBottomIconContent}
               onPress={handleConversationScollToBottom}>
               {newMessagesCount > 0 && (
                  <View
                     style={[
                        styles.newMessgesCountBadgeWrapper,
                        newMessagesCount > 99 && styles.newMessgesCountBadgeWrapperWith3Chars,
                     ]}>
                     <Text style={styles.newMessgesCountBadgeText}>
                        {newMessagesCount > 99 ? '99+' : newMessagesCount}
                     </Text>
                  </View>
               )}
               <DoubleDownArrow width={15} height={15} />
            </Pressable>
         )}
      </>
   );
};

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
      opacity: 0.8,
      zIndex: 100,
   },
   floatingScrollToBottomIconContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   floatingScrollToBottomIconPressed: {
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
      borderRadius: 50,
   },
   newMessgesCountBadgeWrapperWith3Chars: {
      width: 33,
      paddingHorizontal: 0,
   },
   newMessgesCountBadgeText: {
      color: '#fff',
   },
});
