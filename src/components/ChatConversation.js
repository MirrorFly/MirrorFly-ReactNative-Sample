import Clipboard from '@react-native-clipboard/clipboard';
import { NO_CONVERSATION } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { showToast } from '../Helper/index';
import SDK from '../SDK/SDK';
import { ClearChatHistoryAction } from '../redux/Actions/ConversationAction';
import { clearLastMessageinRecentChat } from '../redux/Actions/RecentChatAction';
import { Box, HStack, Modal, Stack, Text, View, useToast } from 'native-base';
import React, { createRef } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
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

const ChatConversation = React.memo(props => {
  const {
    handleSendMsg,
    onReplyMessage,
    replyMsgRef,
    handleIsSearchingClose,
    handleIsSearching,
    IsSearching,
  } = props;
  const dispatch = useDispatch();
  const chatInputRef = React.useRef(null);
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  const [selectedMsgs, setSelectedMsgs] = React.useState([]);
  const [replyMsgs, setReplyMsgs] = React.useState();
  const [menuItems, setMenuItems] = React.useState([]);
  const [isOpenAlert, setIsOpenAlert] = React.useState(false);
  const isNetworkConnected = useNetworkStatus();
  const toast = useToast();

  const isSearchClose = () => {
    handleIsSearchingClose();
  };

  const handleConversationSearchPress = () => {
    handleIsSearching();
  };

  React.useEffect(() => {
    setReplyMsgs(replyMsgRef);
  }, [replyMsgRef]);
  /**
     *  const { vCardProfile, fromUserJId, messages } = useSelector((state) =>  ({
        vCardProfile: state.profile.profileDetails,
        fromUserJId: state.navigation.fromUserJid,
        messages: state.chatConversationData.data
    }))
    // const handleSwipeLeft = (rowKey) => {
    //     chatInputRef.current.focus();
    //     const filteredMsgInfo = messageList.filter(item => item.msgId === rowKey);
    //     setReplyMsgs(filteredMsgInfo[0]);
    // };

        const renderHiddenItem = (data, rowMap) => {
            return (
                <HStack alignItems={'center'} flex={"0.8"} ml='2' >
                    {isSwiping?.isActivated && isSwiping?.key === data.item.msgId &&
                        <HStack alignItems={'center'} justifyContent={'center'} w={10} h={10} borderRadius={20} bg={'#E5E5E5'}><ReplyIcon /></HStack>}
                </HStack>
            )
        }
        const onLeftAction = (rowKey) => {
            handleSwipeLeft(rowKey);
        };
        const onLeftActionStatusChange = (res) => {
            setIsSwiping(res);
        };
     const leftActivationValue = 20; // Adjust as needed
     const leftActionValue = 20; // Adjust as needed
     const initialLeftActionState = false; // Adjust as needed
     // handleSwipeLeft(msgId);
     */

  const toastConfig = {
    duration: 2500,
    avoidKeyboard: true,
  };

  const handleMessageListUpdated = messages => {
    if (
      replyMsgs &&
      Object.keys(replyMsgs).length !== 0 &&
      !messages[replyMsgs.msgId]
    ) {
      setReplyMsgs({ ...replyMsgs, deleteStatus: 1, msgBody: {} });
    } else if (replyMsgs && messages[replyMsgs?.msgId]) {
      setReplyMsgs(messages[replyMsgs.msgId]);
    }
  };

  const copyToClipboard = () => {
    if (
      selectedMsgs[0].msgBody.message.length <= 500 ||
      selectedMsgs[0]?.msgBody?.media?.caption.length <= 500
    ) {
      setSelectedMsgs([]);
      Clipboard.setString(
        selectedMsgs[0].msgBody.message ||
          selectedMsgs[0]?.msgBody?.media?.caption,
      );
      toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text color={'#fff'} p="2">
                1 Text copied successfully to the clipboard
              </Text>
            </Box>
          );
        },
      });
    }
  };

  const handleReply = msg => {
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
              selectedMsgs[0].msgBody.message_type === 'text' ||
              selectedMsgs[0]?.msgBody?.media?.caption
                ? 'Copy'
                : null,
            formatter: copyToClipboard,
          },
        ]);
        break;
      case foundMsg.length === 0 &&
        selectedMsgs.length > 0 &&
        selectedMsgs[0].msgStatus !== 3:
        setMenuItems([
          {
            label:
              selectedMsgs[0].msgBody.message_type === 'text' ||
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
        return item[message?.msgId];
      });
      setSelectedMsgs(updatedSeletedMessage);
    }
  };

  const handleMsgSelect = (message, recall = false) => {
    if (recall) {
      message.recall = true;
    }
    if (selectedMsgs.find(msg => msg.msgId === message?.msgId)) {
      setSelectedMsgs(prevArray =>
        prevArray.filter(item => message.msgId !== item?.msgId),
      );
    } else {
      setSelectedMsgs([...selectedMsgs, message]);
    }
  };

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
        fromUserJId={fromUserJId}
        selectedMsgs={selectedMsgs}
        setSelectedMsgs={setSelectedMsgs}
        menuItems={menuItems}
        handleBackBtn={props.handleBackBtn}
        handleReply={handleReply}
        isSearchClose={isSearchClose}
        IsSearching={IsSearching}
        setLocalNav={props.setLocalNav}
      />
      <ImageBackground source={chatBackgroud} style={styles.imageBackground}>
        <ChatConversationList
          handleMessageListUpdated={handleMessageListUpdated}
          setLocalNav={props.setLocalNav}
          fromUserJId={fromUserJId}
          handleMsgSelect={handleMsgSelect}
          onSelectedMessageUpdate={onSelectedMessageUpdate}
          selectedMsgs={selectedMsgs}
        />
      </ImageBackground>
      {replyMsgs ? (
        <View paddingX={'1'} paddingY={'2'} backgroundColor={'#E2E8F9'}>
          <Stack paddingX={'3'} paddingY={'0 '} backgroundColor={'#0000001A'}>
            <View marginY={'3'} justifyContent={'flex-start'}>
              {renderReplyMessageTemplateAboveInput()}
            </View>
          </Stack>
        </View>
      ) : null}
      <ChatInput
        chatInputRef={chatInputRef}
        attachmentMenuIcons={props.attachmentMenuIcons}
        onSendMessage={handleMessageSend}
        IsSearching={IsSearching}
      />
      <Modal
        isOpen={isOpenAlert}
        safeAreaTop={true}
        onClose={() => setIsOpenAlert(false)}>
        <Modal.Content
          w="88%"
          borderRadius={0}
          px="6"
          py="4"
          fontWeight={'300'}>
          <Text fontSize={16} color={'#5e5e5e'}>
            {'Are you sure you want to clear the chat?'}
          </Text>
          <HStack justifyContent={'flex-end'} pb={'1'} pt={'7'}>
            <Pressable
              onPress={() => {
                setIsOpenAlert(false);
              }}>
              <Text pr={'5'} fontWeight={'500'} color={'#3276E2'}>
                CANCEL
              </Text>
            </Pressable>
            <Pressable onPress={clearChat}>
              <Text fontWeight={'500'} color={'#3276E2'}>
                CLEAR
              </Text>
            </Pressable>
          </HStack>
        </Modal.Content>
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
});

export default ChatConversation;
