import React from 'react';
import { FlatList } from 'react-native';
import ChatMessage from './ChatMessage';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { useDispatch, useSelector } from 'react-redux';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import SDK from 'SDK/SDK';
import { updateMsgSeenStatus } from './chat/common/createMessage';
import DeletedMessage from './DeletedMessage';

const ChatConversationList = ({
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
    return messageList.findIndex(item => item.msgId === msgId);
  };

  const handleReplyPress = replyId => {
    setReplyID(replyId);
    setBackgroundColor('rgba(0,0,0,0.2)');
    flatListRef.current.scrollToIndex({
      index: findMsgIndex(replyId),
      animated: true,
    });
    setTimeout(() => {
      setReplyID('');
      setBackgroundColor('transparent');
    }, 500);
  };

  const chatMessageRender = React.useCallback(
    ({ item }) => {
      const {
        deleteStatus,
        msgId,
        msgBody,
        msgType,
        msgBody: { message_type = '' } = {},
      } = item;
      console.log(deleteStatus, 'item');
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
          // closeMessageOption={closeMessageOption}
          // messageInfoOptions={true}
          // addionalnfo={addionalnfo}
          // key={msgId}
          currentUserJID={currentUserJID}
          // vCardData={data}
          messageObject={item}
          // messageAction={messageAction}
          // chatType={chatType}
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
