import Clipboard from '@react-native-clipboard/clipboard';
import { NO_CONVERSATION } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { showToast } from '../Helper/index';
import SDK from '../SDK/SDK';
import { ClearChatHistoryAction } from '../redux/Actions/ConversationAction';
import { clearLastMessageinRecentChat } from '../redux/Actions/RecentChatAction';
import React, { useRef } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNetworkStatus } from '../../src/hooks';
import {
  formatUserIdToJid,
  getActiveConversationChatId,
  getChatMessageHistoryById,
} from '../Helper/Chat/ChatHelper';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import { resetGalleryData } from '../redux/Actions/GalleryAction';
import ChatConversationList from './ChatConversationList';
import ReplyAudio from './ReplyAudio';
import ReplyContact from './ReplyContact';
import ReplyDocument from './ReplyDocument';
import ReplyImage from './ReplyImage';
import ReplyLocation from './ReplyLocation';
import ReplyText from './ReplyText';
import ReplyVideo from './ReplyVideo';
import ReplyDeleted from './ReplyDeleted';
import chatBackgroud from '../assets/chatBackgroud.png';
import { getImageSource } from '../common/utils';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';

// below ref is used to check whether selecting is happening or not in other components without passing the selected Messages state as props
export const isMessageSelectingRef = React.createRef();
export const isActiveChatScreenRef = React.createRef();
isActiveChatScreenRef.current = false;
isMessageSelectingRef.current = false;

const ChatConversation = React.memo(props => {
  const {
    handleSendMsg,
    onReplyMessage,
    replyMsg,
    handleIsSearchingClose,
    handleIsSearching,
    IsSearching,
    chatInputRef,
  } = props;
  const dispatch = useDispatch();
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  const chatUserProfile = useSelector(state => state.navigation.profileDetails);
  const [selectedMsgs, setSelectedMsgs] = React.useState([]);
  const [replyMsgs, setReplyMsgs] = React.useState();
  const [menuItems, setMenuItems] = React.useState([]);
  const [isOpenAlert, setIsOpenAlert] = React.useState(false);
  const isNetworkConnected = useNetworkStatus();

  const selectedMessagesIdRef = useRef({});

  React.useEffect(() => {
    isMessageSelectingRef.current = Boolean(selectedMsgs?.length);
  }, [selectedMsgs]);

  const isSearchClose = () => {
    handleIsSearchingClose();
  };

  const handleConversationSearchPress = () => {
    handleIsSearching();
  };

  React.useEffect(() => {
    setReplyMsgs(replyMsg);
  }, [replyMsg]);

  const handleMessageListUpdated = messages => {
    if (
      replyMsgs &&
      Object.keys(replyMsgs).length !== 0 &&
      messages[replyMsgs.msgId]
    ) {
      setReplyMsgs({ ...messages[replyMsgs.msgId] });
    }
  };

  const copyToClipboard = () => {
    selectedMessagesIdRef.current = {};
    setSelectedMsgs([]);
    Clipboard.setString(
      selectedMsgs[0]?.msgBody.message ||
        selectedMsgs[0]?.msgBody?.media?.caption,
    );
    showToast('1 Text copied successfully to the clipboard', {
      id: 'text-copied-success-toast',
    });
  };

  const handleReply = msg => {
    selectedMessagesIdRef.current = {};
    setSelectedMsgs([]);
    setReplyMsgs(msg);
    onReplyMessage(msg);
  };

  const handleRemove = () => {
    setReplyMsgs('');
    onReplyMessage();
  };

  const handleMessageSend = messageContent => {
    let message = {
      type: 'text',
      content: messageContent,
      replyTo: replyMsgs?.msgId || '',
    };
    handleSendMsg(message);
    handleRemove();
  };

  const clearChat = () => {
    handleRemove();
    setIsOpenAlert(false);
    SDK.clearChat(fromUserJId);
    dispatch(clearLastMessageinRecentChat(getUserIdFromJid(fromUserJId)));
    dispatch(ClearChatHistoryAction(getUserIdFromJid(fromUserJId)));
  };

  const checkMessageExist = () => {
    const chatMessages = getChatMessageHistoryById(
      getActiveConversationChatId(),
    );
    if (
      chatMessages &&
      Array.isArray(chatMessages) &&
      chatMessages.length === 0
    ) {
      showToastMessage();
      return false;
    }
    return true;
  };

  const showToastMessage = () => {
    let toastMessage = NO_CONVERSATION;
    const options = {
      id: 'Clear_Toast',
    };
    showToast(toastMessage, options);
  };

  const handleClearChat = () => {
    if (!checkMessageExist()) {
      return;
    }
    setIsOpenAlert(true);
  };

  React.useEffect(() => {
    let foundMsg = selectedMsgs.filter(
      obj => obj.fromUserJid !== currentUserJID,
    );
    switch (true) {
      case foundMsg.length > 0:
        setMenuItems([
          {
            label: 'Report',
            formatter: () => {},
          },
          {
            label:
              selectedMsgs[0]?.msgBody.message_type === 'text' ||
              selectedMsgs[0]?.msgBody?.media?.caption
                ? 'Copy'
                : null,
            formatter: copyToClipboard,
          },
        ]);
        break;
      case foundMsg.length === 0 &&
        selectedMsgs.length > 0 &&
        selectedMsgs[0]?.msgStatus !== 3:
        setMenuItems([
          {
            label:
              selectedMsgs[0]?.msgBody.message_type === 'text' ||
              selectedMsgs[0]?.msgBody?.media?.caption
                ? 'Copy'
                : null,
            formatter: copyToClipboard,
          },
          {
            label: 'Message Info',
            formatter: () => {
              props.setIsMessageInfo(selectedMsgs[0]);
              props.setLocalNav('MESSAGEINFO');
            },
          },
        ]);
        break;
      case foundMsg.length === 0 &&
        selectedMsgs.length > 0 &&
        selectedMsgs[0]?.msgStatus === 3 &&
        (selectedMsgs[0]?.msgBody.message_type === 'text' ||
          selectedMsgs[0]?.msgBody?.media?.caption):
        setMenuItems([
          {
            label: 'Copy',
            formatter: copyToClipboard,
          },
        ]);
        break;
      case selectedMsgs.length === 0:
        setMenuItems([
          {
            label: 'Clear Chat',
            formatter: () => {
              handleClearChat();
            },
          },
          {
            label: 'Report',
            formatter: () => {},
          },
          {
            label: 'Search',
            formatter: handleConversationSearchPress,
          },
        ]);
        break;
      default:
        setMenuItems([]);
        break;
    }
  }, [selectedMsgs, isNetworkConnected]);

  React.useEffect(() => {
    dispatch(resetGalleryData());
  }, []);

  const onSelectedMessageUpdate = item => {
    if (Object.keys(item || {}).length !== 0 && selectedMsgs.length !== 0) {
      const updatedSeletedMessage = selectedMsgs.map(message => {
        selectedMessagesIdRef.current[message?.msgId] = true;
        return item[message?.msgId];
      });
      setSelectedMsgs(updatedSeletedMessage);
    }
  };

  const handleMsgSelect = React.useCallback(
    (message, recall = false) => {
      if (recall) {
        message.recall = true;
      }
      if (selectedMessagesIdRef.current[message?.msgId]) {
        delete selectedMessagesIdRef.current[message?.msgId];
        setSelectedMsgs(prevArray =>
          prevArray.filter(item => message.msgId !== item?.msgId),
        );
      } else {
        selectedMessagesIdRef.current[message?.msgId] = true;
        setSelectedMsgs(prevArray => [...prevArray, message]);
      }
    },
    [setSelectedMsgs],
  );

  const closeAlert = () => setIsOpenAlert(false);

  const renderReplyMessageTemplateAboveInput = () => {
    const {
      msgBody,
      deleteStatus = 0,
      msgBody: { message_type },
    } = replyMsgs;

    switch (true) {
      case Object.keys(msgBody).length === 0 || deleteStatus !== 0:
        return (
          <ReplyDeleted replyMsgItems={replyMsgs} handleRemove={handleRemove} />
        );
      case message_type === 'text':
        return (
          <ReplyText replyMsgItems={replyMsgs} handleRemove={handleRemove} />
        );
      case message_type === 'image':
        return (
          <ReplyImage replyMsgItems={replyMsgs} handleRemove={handleRemove} />
        );
      case message_type === 'video':
        return (
          <ReplyVideo replyMsgItems={replyMsgs} handleRemove={handleRemove} />
        );
      case message_type === 'audio':
        return (
          <ReplyAudio replyMsgItems={replyMsgs} handleRemove={handleRemove} />
        );
      case message_type === 'file':
        return (
          <ReplyDocument
            replyMsgItems={replyMsgs}
            handleRemove={handleRemove}
          />
        );
      case message_type === 'contact':
        return (
          <ReplyContact replyMsgItems={replyMsgs} handleRemove={handleRemove} />
        );
      case message_type === 'location':
        return (
          <ReplyLocation
            replyMsgItems={replyMsgs}
            handleRemove={handleRemove}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 'auto'}
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ChatHeader
        chatUserProfile={chatUserProfile}
        fromUserJId={fromUserJId}
        selectedMsgs={selectedMsgs}
        setSelectedMsgs={setSelectedMsgs}
        selectedMsgsIdRef={selectedMessagesIdRef}
        menuItems={menuItems}
        handleBackBtn={props.handleBackBtn}
        handleReply={handleReply}
        isSearchClose={isSearchClose}
        IsSearching={IsSearching}
        setLocalNav={props.setLocalNav}
        chatInputRef={chatInputRef}
      />
      <ImageBackground
        source={getImageSource(chatBackgroud)}
        style={styles.imageBackground}>
        <ChatConversationList
          handleMessageListUpdated={handleMessageListUpdated}
          setLocalNav={props.setLocalNav}
          fromUserJId={fromUserJId}
          handleMsgSelect={handleMsgSelect}
          onSelectedMessageUpdate={onSelectedMessageUpdate}
          selectedMsgs={selectedMsgs}
          selectedMsgsIdRef={selectedMessagesIdRef}
        />
      </ImageBackground>
      {replyMsgs && !IsSearching ? (
        <View style={styles.replyingMessageContainer}>
          <View style={styles.replyingMessageWrapper}>
            {renderReplyMessageTemplateAboveInput()}
          </View>
        </View>
      ) : null}
      {!IsSearching && (
        <ChatInput
          chatInputRef={chatInputRef}
          attachmentMenuIcons={props.attachmentMenuIcons}
          onSendMessage={handleMessageSend}
          handleSendMsg={handleSendMsg}
          selectedMsgs={selectedMsgs}
          fromUserJId={fromUserJId}
        />
      )}
      <Modal visible={isOpenAlert} onRequestClose={closeAlert}>
        <ModalCenteredContent onPressOutside={closeAlert}>
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalContentText}>
              Are you sure you want to clear the chat?
            </Text>
            <View style={styles.modalActionButtonContainer}>
              <Pressable
                contentContainerStyle={[
                  commonStyles.p_4,
                  commonStyles.marginRight_16,
                ]}
                onPress={closeAlert}>
                <Text style={styles.modalCancelButtonText}>CANCEL</Text>
              </Pressable>
              <Pressable
                contentContainerStyle={commonStyles.p_4}
                onPress={clearChat}>
                <Text style={styles.modalOkButtonText}>CLEAR</Text>
              </Pressable>
            </View>
          </View>
        </ModalCenteredContent>
      </Modal>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  removeReplyMessage: {
    padding: 5,
    justifyContent: 'flex-end',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
  },
  replyingMessageContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#E2E8F9',
  },
  replyingMessageWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#0000001A',
  },
  modalContentContainer: {
    width: '88%',
    borderRadius: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '300',
    backgroundColor: '#fff',
  },
  modalContentText: {
    fontSize: 16,
    color: '#5e5e5e',
  },
  modalActionButtonContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 4,
    paddingTop: 28,
  },
  modalCancelButtonText: {
    fontWeight: '500',
    color: '#3276E2',
  },
  modalOkButtonText: {
    fontWeight: '500',
    color: '#3276E2',
  },
});

export default ChatConversation;
