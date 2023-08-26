import { showToast } from 'Helper/index';
import SDK from 'SDK/SDK';
import React from 'react';
import { FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import ChatMessage from './ChatMessage';
import DeletedMessage from './DeletedMessage';
import { updateMsgSeenStatus } from './chat/common/createMessage';

const ChatConversationList = ({
  handleMessageListUpdated,
  setLocalNav,
  fromUserJId,
  selectedMsgs,
  handleMsgSelect,
  onSelectedMessageUpdate,
}) => {
  const { id: messagesReducerId, data: messages } = useSelector(
    state => state.chatConversationData,
  );
  const dispatch = useDispatch();
  const flatListRef = React.useRef(null);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const [backgroundColor, setBackgroundColor] = React.useState('transparent');
  const [replyID, setReplyID] = React.useState('');

  const messageList = React.useMemo(() => {
    const id = getUserIdFromJid(fromUserJId);
    const data = messages[id]?.messages
      ? Object.values(messages[id]?.messages)
      : [];
    data.reverse();
    handleMessageListUpdated(messages[id]?.messages);
    onSelectedMessageUpdate(messages[id]?.messages);
    return data;
  }, [messages, fromUserJId]);

  React.useEffect(() => {
    updateMsgSeenStatus();
  }, [messagesReducerId]);

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
    (async () => {
      if (!messages[getUserIdFromJid(fromUserJId)]) {
        let chatMessage = await SDK.getChatMessagesDB(fromUserJId);
        if (chatMessage?.statusCode === 200) {
          dispatch(addChatConversationHistory(chatMessage));
        }
      }
    })();
  }, [fromUserJId, messages]);

  const findMsgIndex = msgId => {
    const index = messageList.findIndex(
      item => item.msgId === msgId && item.deleteStatus === 0,
    );
    if (index === -1) {
      return showToast('This message no longer availabe', { id: 'no_Longer' });
    } else {
      return index;
    }
  };

  const handleReplyPress = (replyId, item, onLongPress = false) => {
    switch (true) {
      case selectedMsgs.length === 0 && onLongPress:
        handleMsgSelect(item);
        break;
      case selectedMsgs.length === 0:
        setReplyID(replyId);
        setBackgroundColor('rgba(0,0,0,0.2)');
        const scrollIndex = findMsgIndex(replyId);
        if (scrollIndex > -1) {
          flatListRef.current.scrollToIndex({
            index: scrollIndex,
            animated: true,
          });
          setTimeout(() => {
            setReplyID('');
            setBackgroundColor('transparent');
          }, 500);
        }
        break;
      case selectedMsgs.length > 0:
        handleMsgSelect(item);
        break;
      default:
        break;
    }
  };

  const chatMessageRender = React.useCallback(
    ({ item }) => {
      const { deleteStatus = 0 } = item;

      return deleteStatus === 0 ? (
        <ChatMessage
          replyID={replyID}
          backgroundColor={backgroundColor}
          handleReplyPress={handleReplyPress}
          setLocalNav={setLocalNav}
          handleMsgSelect={handleMsgSelect}
          selectedMsgs={selectedMsgs}
          message={item}
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
    [
      handleMsgSelect,
      selectedMsgs,
      setLocalNav,
      backgroundColor,
      replyID,
      messageList,
    ],
  );

  const doNtg = () => {};

  return (
    <FlatList
      ref={flatListRef}
      data={messageList}
      inverted
      renderItem={chatMessageRender}
      keyExtractor={item => item.msgId.toString()}
      initialNumToRender={20}
      maxToRenderPerBatch={40}
      onScrollToIndexFailed={doNtg}
      windowSize={15}
    />
  );
};

export default React.memo(ChatConversationList);
