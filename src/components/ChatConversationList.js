import React from 'react';
import { FlatList } from 'react-native';
import ChatMessage from './ChatMessage';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { useDispatch, useSelector } from 'react-redux';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import SDK from 'SDK/SDK';
import { updateMsgSeenStatus } from './chat/common/createMessage';

const ChatConversationList = ({
  setLocalNav,
  fromUserJId,
  selectedMsgs,
  handleMsgSelect,
}) => {
  const { id: messagesReducerId, data: messages } = useSelector(
    state => state.chatConversationData,
  );
  const dispatch = useDispatch();

  React.useEffect(() => {
    updateMsgSeenStatus();
  }, [messagesReducerId]);

  React.useEffect(() => {
    (async () => {
      if (!messages[getUserIdFromJid(fromUserJId)]) {
        let chatMessage = await SDK.getChatMessagesDB(fromUserJId);
        if (chatMessage?.statusCode === 200) {
          dispatch(addChatConversationHistory(chatMessage));
        }
      }
    })();
  }, [fromUserJId, messages]);

  const messageList = React.useMemo(() => {
    const id = getUserIdFromJid(fromUserJId);
    const data = messages[id]?.messages
      ? Object.values(messages[id]?.messages)
      : [];
    data.reverse();
    return data;
  }, [messages, fromUserJId]);

  const chatMessageRender = React.useCallback(
    ({ item }) => {
      return (
        <ChatMessage
          setLocalNav={setLocalNav}
          handleMsgSelect={handleMsgSelect}
          selectedMsgs={selectedMsgs}
          message={item}
        />
      );
    },
    [handleMsgSelect, selectedMsgs, setLocalNav],
  );

  return (
    <FlatList
      data={messageList}
      inverted
      renderItem={chatMessageRender}
      keyExtractor={item => item.msgId.toString()}
      initialNumToRender={20}
      maxToRenderPerBatch={40}
      windowSize={15}
    />
  );
};

export default React.memo(ChatConversationList);
