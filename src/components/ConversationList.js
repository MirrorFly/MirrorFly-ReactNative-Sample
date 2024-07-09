import React, { createRef } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { fetchMessagesFromSDK, getHasNextChatPage } from '../SDK/utils';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, NOTIFICATION } from '../helpers/constants';
import { useChatMessages } from '../redux/reduxHook';
import ChatMessage from './ChatMessage';

export const conversationFlatListRef = createRef();
conversationFlatListRef.current = {};

function ConversationList({ chatUser }) {
   const userId = getUserIdFromJid(chatUser);
   const [chatLoading, setChatLoading] = React.useState(false);
   const messages = useChatMessages(getUserIdFromJid(chatUser)) || [];

   React.useEffect(() => {
      initFunc();
   }, [chatUser]);

   const initFunc = async () => {
      setChatLoading(true);
      await fetchMessagesFromSDK(chatUser);
      setChatLoading(false);
   };

   const handleLoadMore = async () => {
      if (!chatLoading && getHasNextChatPage(userId)) {
         setChatLoading(true);
         await fetchMessagesFromSDK(chatUser, true).then(() => {
            setChatLoading(false);
         });
      }
   };

   const chatMessageRender = React.useCallback(
      ({ item, index }) => {
         const notifiactionCheck = messages[index + 1]?.message_type;
         const nextMessageUserId = messages[index + 1]?.publisherId;
         const currentMessageUserId = item?.publisherId;
         const showNickName =
            notifiactionCheck === NOTIFICATION
               ? true
               : item.chatType === CHAT_TYPE_GROUP && nextMessageUserId !== currentMessageUserId;
         return <ChatMessage chatUser={chatUser} item={item} showNickName={showNickName} />;
      },
      [messages],
   );

   const renderChatFooter = () => {
      if (chatLoading) {
         return <ActivityIndicator size="large" color={ApplicationColors.mainColor} />;
      }
   };

   return (
      <FlatList
         keyboardShouldPersistTaps={'always'}
         ref={conversationFlatListRef}
         data={messages}
         inverted={Boolean(messages.length)}
         renderItem={chatMessageRender}
         keyExtractor={item => item.msgId.toString()}
         maxToRenderPerBatch={20}
         scrollEventThrottle={1}
         windowSize={20}
         onEndReached={handleLoadMore}
         ListFooterComponent={renderChatFooter}
         onEndReachedThreshold={0.1}
         disableVirtualization={true}
      />
   );
}

export default ConversationList;
