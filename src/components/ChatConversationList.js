import React from 'react';
import { FlatList } from 'react-native';
import ChatMessage from './ChatMessage';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { useDispatch, useSelector } from 'react-redux';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import SDK from 'SDK/SDK';
import { updateMsgSeenStatus } from './chat/common/createMessage';
import { updateConversationTotalSearchResults } from 'mf-redux/Actions/conversationSearchAction';

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

  const {
    searchText: conversationSearchText,
    messageIndex: searchMesageIndex,
  } = useSelector(state => state.conversationSearchData) || {};

  const dispatch = useDispatch();
  const flatListRef = React.useRef(null);
  const filteredMessageIndexes = React.useRef([]);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const [highlightMessageId, setHighlightMessageId] = React.useState('');
  const [highlightMessageBackgroundColor, setHighlightMessageBackgroundColor] =
    React.useState('transparent');

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

  React.useEffect(() => {
    if (conversationSearchText) {
      // updating the filtered messages indices refs data
      filteredMessageIndexes.current = [];
      const _filteredMsgIndices = [];
      const _searchText = conversationSearchText.toLowerCase();
      messageList.forEach((msg, index) => {
        if (msg?.msgBody?.message_type === 'text') {
          if (msg?.msgBody?.message?.toLowerCase?.().includes?.(_searchText)) {
            _filteredMsgIndices.push({ index, msgId: msg.msgId });
          }
        }
      });
      filteredMessageIndexes.current = _filteredMsgIndices;
      setTimeout(() => {
        dispatch(
          updateConversationTotalSearchResults(_filteredMsgIndices.length),
        );
      }, 0);
    }
  }, [messageList, conversationSearchText]);

  React.useEffect(() => {
    if (conversationSearchText) {
      const _indexToScroll =
        filteredMessageIndexes.current?.[searchMesageIndex]?.index ?? -1;
      // updating the scrollview ref when searchText or the search message index changed
      if (_indexToScroll > -1) {
        setHighlightMessageId(
          filteredMessageIndexes.current?.[searchMesageIndex]?.msgId,
        );
        setHighlightMessageBackgroundColor('rgba(0,0,0,0.2)');
        flatListRef.current.scrollToIndex({
          index: _indexToScroll,
          animated: true,
          viewPosition: 0.5,
        });
        setTimeout(() => {
          setHighlightMessageId('');
          setHighlightMessageBackgroundColor('transparent');
        }, 500);
      }
    }
  }, [conversationSearchText, searchMesageIndex]);

  const findMsgIndex = msgId => {
    return messageList.findIndex(item => item.msgId === msgId);
  };

  const handleReplyPress = replyId => {
    setHighlightMessageId(replyId);
    setHighlightMessageBackgroundColor('rgba(0,0,0,0.2)');
    flatListRef.current.scrollToIndex({
      index: findMsgIndex(replyId),
      animated: true,
    });
    setTimeout(() => {
      setHighlightMessageId('');
      setHighlightMessageBackgroundColor('transparent');
    }, 500);
  };

  const chatMessageRender = React.useCallback(
    ({ item }) => {
      return (
        <ChatMessage
          highlightMessageId={highlightMessageId}
          highlightMessageBackgroundColor={highlightMessageBackgroundColor}
          handleReplyPress={handleReplyPress}
          setLocalNav={setLocalNav}
          handleMsgSelect={handleMsgSelect}
          selectedMsgs={selectedMsgs}
          message={item}
        />
      );
    },
    [
      handleMsgSelect,
      selectedMsgs,
      setLocalNav,
      highlightMessageBackgroundColor,
      highlightMessageId,
      messageList,
    ],
  );

  const doNothing = () => null;

  return (
    <FlatList
      ref={flatListRef}
      data={messageList}
      inverted
      renderItem={chatMessageRender}
      keyExtractor={item => item.msgId.toString()}
      initialNumToRender={20}
      maxToRenderPerBatch={40}
      onScrollToIndexFailed={doNothing}
      windowSize={15}
    />
  );
};

export default React.memo(ChatConversationList);
