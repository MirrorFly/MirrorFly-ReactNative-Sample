import moment from 'moment';
import React, { createRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchMessagesFromSDK, getHasNextChatPage } from '../SDK/utils';
import { DoubleDownArrow } from '../common/Icons';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import {
   calculateOffset,
   getReplyScrollmsgId,
   getUserIdFromJid,
   handleConversationScollToBottom,
   setReplyScrollmsgId,
} from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, NOTIFICATION } from '../helpers/constants';
import { useChatMessages, useThemeColorPalatte } from '../redux/reduxHook';
import { getCurrentUserJid } from '../uikitMethods';
import ChatMessage from './ChatMessage';
import store from '../redux/store';
import { highlightMessage } from '../redux/chatMessageDataSlice';
import { getMergedMediaMessages } from '../hooks/useMediaMessaegs';

export const conversationFlatListRef = createRef();
conversationFlatListRef.current = {};
const estimatedItemHeight = 60;

const ConversationList = ({ chatUser }) => {
   const themeColorPalatte = useThemeColorPalatte();
   const userId = React.useMemo(() => getUserIdFromJid(chatUser), [chatUser]);
   const currentUserId = React.useMemo(() => getUserIdFromJid(getCurrentUserJid()), []);
   const messages = useChatMessages(userId) || [];
   const messageListRef = React.useRef([]);
   const [chatLoading, setChatLoading] = React.useState(false);
   const [itemHeights, setItemHeights] = React.useState({});
   const [showScrollToBottomIcon, setShowScrollToBottomIcon] = React.useState(false);
   const [newMessagesCount, setNewMessagesCount] = React.useState(0);

   // Fetch initial messages
   React.useEffect(() => {
      const initialize = async () => {
         setChatLoading(true);
         await fetchMessagesFromSDK({
            fromUserJId: chatUser,
            forceGetFromSDK: messages.length < 10 && !getHasNextChatPage(),
         });
         setChatLoading(false);
      };
      initialize();
   }, [chatUser]);

   // Monitor new messages and update counter
   React.useMemo(() => {
      const prevMessages = messageListRef.current;
      const prevLastMessage = prevMessages[0]?.msgId;
      const currentLastMessage = messages[0]?.msgId;
      if (
         prevLastMessage !== currentLastMessage &&
         messages.length > prevMessages.length &&
         messages[0]?.publisherId !== currentUserId
      ) {
         setNewMessagesCount(count => count + 1);
      }
      messageListRef.current = messages;
   }, [messages.length, currentUserId]);

   // Precompute the labels for all messages in a useMemo hook to prevent re-calculation on every render
   const messageLabels = React.useMemo(() => {
      const today = moment().startOf('day');
      const yesterday = moment().subtract(1, 'day').startOf('day');

      return messages.map((message, index) => {
         // Skip if the message is deleted or recalled
         if (message.deleteStatus === 1 || message.recallStatus === 1) {
            return null;
         }
         const messageDatePrev = moment(messages[index + 1]?.timestamp);
         const currentMessage = moment(message.timestamp);

         let label = null;
         if (!messageDatePrev.isSame(currentMessage, 'day')) {
            if (currentMessage.isSame(today, 'day')) {
               label = 'Today';
            } else if (currentMessage.isSame(yesterday, 'day')) {
               label = 'Yesterday';
            } else {
               label = currentMessage.format('MMMM D, YYYY');
            }
         }

         return label;
      });
   }, [messages]);

   // Load more messages
   const handleLoadMore = async () => {
      if (chatLoading || !getHasNextChatPage(userId)) {
         return;
      }
      setChatLoading(true);
      await fetchMessagesFromSDK({ fromUserJId: chatUser, forceGetFromSDK: true });
      setChatLoading(false);
   };

   // Handle scroll position
   const handleScroll = React.useCallback(
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
   const onItemLayout = React.useCallback((event, index) => {
      const { height } = event.nativeEvent.layout;
      setItemHeights(prev => ({ ...prev, [index]: height }));
      conversationFlatListRef.current.itemLayout = {
         ...conversationFlatListRef.current.itemLayout,
         [index]: height,
      };
   }, []);

   // Render each chat message
   const renderChatMessage = React.useCallback(
      ({ item, index }) => {
         const isNotification = messages[index + 1]?.msgBody.message_type === NOTIFICATION.toLowerCase();
         const nextPublisherId = messages[index + 1]?.publisherId;
         const showNickName =
            isNotification || (item.chatType === CHAT_TYPE_GROUP && nextPublisherId !== item?.publisherId);

         return (
            <View onLayout={event => onItemLayout(event, index)}>
               <ChatMessage chatUser={chatUser} item={item} showNickName={showNickName} label={messageLabels[index]} />
            </View>
         );
      },
      [messages, chatUser, messageLabels],
   );

   return (
      <>
         {chatLoading && <ActivityIndicator size="large" color={themeColorPalatte.primaryColor} />}
         <FlatList
            keyboardShouldPersistTaps={'always'}
            initialNumToRender={10}
            ref={conversationFlatListRef}
            data={messages}
            inverted
            renderItem={renderChatMessage}
            keyExtractor={item => item.msgId.toString()}
            maxToRenderPerBatch={20}
            disableVirtualization={true}
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
      backgroundColor: ApplicationColors.mainColor,
   },
   newMessgesCountBadgeWrapperWith3Chars: {
      width: 33,
      paddingHorizontal: 0,
   },
   newMessgesCountBadgeText: {
      color: '#fff',
   },
});
