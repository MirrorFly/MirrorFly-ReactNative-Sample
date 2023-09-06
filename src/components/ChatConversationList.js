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
import { updateConversationTotalSearchResults } from 'mf-redux/Actions/conversationSearchAction';

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
    if (conversationSearchText.trim() && searchMesageIndex > -1) {
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

  const fetchMessagesFromSDK = async (forceGetFromSDK = false) => {
    if (forceGetFromSDK || !messages[getUserIdFromJid(fromUserJId)]) {
      let chatMessage = await SDK.getChatMessagesDB(fromUserJId);
      if (chatMessage?.statusCode === 200) {
        dispatch(addChatConversationHistory(chatMessage));
      }
    }
  };
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
        setHighlightMessageId(replyId);
        setHighlightMessageBackgroundColor('rgba(0,0,0,0.2)');
        const scrollIndex = findMsgIndex(replyId);
        if (scrollIndex > -1) {
          flatListRef.current.scrollToIndex({
            index: scrollIndex,
            animated: true,
            viewPosition: 0.5,
          });
          setTimeout(() => {
            setHighlightMessageId('');
            setHighlightMessageBackgroundColor('transparent');
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
          highlightMessageId={highlightMessageId}
          highlightMessageBackgroundColor={highlightMessageBackgroundColor}
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
