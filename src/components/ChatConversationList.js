import { showToast } from '../Helper/index';
import SDK from '../SDK/SDK';
import React, { useRef } from 'react';
import {
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import ChatMessage from './ChatMessage';
import DeletedMessage from './DeletedMessage';
import { updateMsgSeenStatus } from './chat/common/createMessage';
import { updateConversationTotalSearchResults } from '../redux/Actions/conversationSearchAction';
import { useFocusEffect } from '@react-navigation/native';
import { isActiveChatScreenRef } from './ChatConversation';
import Modal, { ModalCenteredContent } from '../common/Modal';
import ApplicationColors from '../config/appColors';
import { INVITE_APP_URL, INVITE_SMS_CONTENT } from '../constant';
import Pressable from '../common/Pressable';

const ChatConversationList = ({
  handleMessageListUpdated,
  setLocalNav,
  fromUserJId,
  selectedMsgs,
  selectedMsgsIdRef,
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
  const xmppConnection = useSelector(state => state.connection.xmppStatus);
  const dispatch = useDispatch();
  const flatListRef = React.useRef(null);
  const filteredMessageIndexes = React.useRef([]);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const [highlightMessageId, setHighlightMessageId] = React.useState('');
  const [showContactInviteModal, setShowContactInviteModal] =
    React.useState(false);

  const inviteContactMessageRef = useRef();

  const messageList = React.useMemo(() => {
    const id = getUserIdFromJid(fromUserJId);
    if (id) {
      const data = messages[id]?.messages
        ? Object.values(messages[id]?.messages)
        : [];
      data.reverse();
      handleMessageListUpdated(messages[id]?.messages);
      onSelectedMessageUpdate(messages[id]?.messages);
      return data;
    }
    return [];
  }, [messages, fromUserJId]);

  useFocusEffect(
    React.useCallback(() => {
      isActiveChatScreenRef.current = true;
      return () => (isActiveChatScreenRef.current = false);
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      updateMsgSeenStatus();
    }, [messagesReducerId, xmppConnection]),
  );

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
        } else if (msg?.msgBody?.message_type === 'file') {
          if (
            msg?.msgBody?.media?.fileName
              ?.toLowerCase?.()
              .includes?.(_searchText)
          ) {
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
        flatListRef.current.scrollToIndex({
          index: _indexToScroll,
          animated: true,
          viewPosition: 0.5,
        });
        setTimeout(() => {
          setHighlightMessageId('');
        }, 500);
      }
    }
  }, [conversationSearchText, searchMesageIndex]);

  const fetchMessagesFromSDK = async (forceGetFromSDK = false) => {
    if (forceGetFromSDK || !messages[getUserIdFromJid(fromUserJId)]) {
      let chatMessage = await SDK.getChatMessagesDB(fromUserJId);
      console.log(
        'fetchMessagesFromSDK chatMessage -->',
        JSON.stringify(chatMessage, null, 2),
      );
      if (chatMessage?.statusCode === 200) {
        dispatch(addChatConversationHistory(chatMessage));
      }
    }
  };
  const findMsgIndex = React.useCallback(
    msgId => {
      const index = messageList.findIndex(
        item => item.msgId === msgId && item.deleteStatus === 0,
      );
      if (index === -1) {
        return showToast('This message no longer availabe', {
          id: 'no_Longer',
        });
      } else {
        return index;
      }
    },
    [messageList],
  );

  const handleReplyPress = React.useCallback(
    (replyId, item, onLongPress = false) => {
      const selectedMessagesLength = Object.keys(
        selectedMsgsIdRef?.current || {},
      ).length;
      switch (true) {
        case selectedMessagesLength === 0 && onLongPress:
          handleMsgSelect(item);
          break;
        case selectedMessagesLength === 0:
          setHighlightMessageId(replyId);
          const scrollIndex = findMsgIndex(replyId);
          if (scrollIndex > -1) {
            flatListRef.current.scrollToIndex({
              index: scrollIndex,
              animated: true,
              viewPosition: 0.5,
            });
            setTimeout(() => {
              setHighlightMessageId('');
            }, 1000);
          }
          break;
        case selectedMessagesLength > 0:
          handleMsgSelect(item);
          break;
        default:
          break;
      }
    },
    [handleMsgSelect, findMsgIndex],
  );

  const toggleContactInviteModal = () => {
    setShowContactInviteModal(val => !val);
  };

  const handleShowContactInviteModal = message => {
    inviteContactMessageRef.current = message;
    toggleContactInviteModal();
  };

  const chatMessageRender = React.useCallback(
    ({ item }) => {
      const { deleteStatus = 0, msgId } = item;
      if (deleteStatus === 2) {
        return null;
      }
      return deleteStatus === 0 ? (
        <ChatMessage
          shouldHighlightMessage={highlightMessageId === msgId}
          handleReplyPress={handleReplyPress}
          setLocalNav={setLocalNav}
          handleMsgSelect={handleMsgSelect}
          shouldSelectMessage={selectedMsgsIdRef?.current?.[msgId]}
          showContactInviteModal={handleShowContactInviteModal}
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
      highlightMessageId,
      messageList,
    ],
  );

  const doNothing = () => null;

  const handleCopyInviteLink = () => {
    toggleContactInviteModal();
    Clipboard.setString(INVITE_APP_URL);
    showToast('Link Copied', { id: 'invite-link-copied-toast' });
  };

  const handleInviteContact = () => {
    toggleContactInviteModal();
    const ContactInfo = inviteContactMessageRef.current?.msgBody?.contact;
    if (ContactInfo) {
      // open the message app and invite the user to the app with content
      const phoneNumber = ContactInfo.phone_number[0];
      const separator = Platform.OS === 'ios' ? '&' : '?';
      const url = `sms:${phoneNumber}${separator}body=${INVITE_SMS_CONTENT}`;
      Linking.openURL(url);
    }
  };

  return (
    <>
      <FlatList
        keyboardShouldPersistTaps={'handled'}
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
      <Modal
        visible={showContactInviteModal}
        onRequestClose={toggleContactInviteModal}>
        <ModalCenteredContent onPressOutside={toggleContactInviteModal}>
          <View style={styles.inviteFriendModalContentContainer}>
            <Text style={styles.modalTitle}>Invite Friend</Text>
            <Pressable onPress={handleCopyInviteLink}>
              <Text style={styles.modalOption}>Copy Link</Text>
            </Pressable>
            <Pressable onPress={handleInviteContact}>
              <Text style={styles.modalOption}>Send SMS</Text>
            </Pressable>
          </View>
        </ModalCenteredContent>
      </Modal>
    </>
  );
};

export default React.memo(ChatConversationList);

const styles = StyleSheet.create({
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
