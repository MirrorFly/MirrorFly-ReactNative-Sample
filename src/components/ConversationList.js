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
const ITEM_HEIGHT = 50;

function ConversationList({ chatUser }) {
   const userId = getUserIdFromJid(chatUser);
   const [chatLoading, setChatLoading] = React.useState(false);
   const messages = useChatMessages(getUserIdFromJid(chatUser)) || [];

   React.useEffect(() => {
      initFunc();
   }, [chatUser]);

   const initFunc = async () => {
      setChatLoading(true);
      await fetchMessagesFromSDK(chatUser, messages.length < 10);
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

   const keyExtractor = React.useCallback(item => item.msgId.toString(), []);
   const getItemLayout = React.useCallback(
      (data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
      [],
   );

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

   return (
      <>
         {chatLoading && <ActivityIndicator size="large" color={ApplicationColors.mainColor} />}
         <FlatList
            initialNumToRender={10}
            keyboardShouldPersistTaps={'always'}
            ref={conversationFlatListRef}
            data={messages}
            inverted={true}
            renderItem={chatMessageRender}
            keyExtractor={keyExtractor}
            maxToRenderPerBatch={20}
            scrollEventThrottle={16}
            windowSize={5}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            disableVirtualization={true}
            getItemLayout={getItemLayout}
         />
      </>
   );
}

export default ConversationList;
