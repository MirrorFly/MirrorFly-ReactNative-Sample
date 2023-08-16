import { Box, Stack, Text, useToast, View } from 'native-base';
import React from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import Clipboard from '@react-native-clipboard/clipboard';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { resetGalleryData } from '../redux/Actions/GalleryAction';
import ChatConversationList from './ChatConversationList';
import ReplyAudio from './ReplyAudio';
import ReplyContact from './ReplyContact';
import ReplyDocument from './ReplyDocument';
import ReplyImage from './ReplyImage';
import ReplyLocation from './ReplyLocation';
import ReplyText from './ReplyText';
import ReplyVideo from './ReplyVideo';

const ChatConversation = React.memo(props => {
  const { handleSendMsg } = props;
  const dispatch = useDispatch();
  const chatInputRef = React.useRef(null);
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  const [selectedMsgs, setSelectedMsgs] = React.useState([]);
  const [replyMsgs, setReplyMsgs] = React.useState();
  const [menuItems, setMenuItems] = React.useState([]);
  const toast = useToast();
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
  };

  const handleRemove = () => {
    setReplyMsgs('');
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
        ]);
        break;
      case foundMsg.length === 0 && selectedMsgs.length > 0:
        setMenuItems([
          {
            label: 'Message Info',
            formatter: () => {
              props.setIsMessageInfo(selectedMsgs[0]);
              props.setLocalNav('MESSAGEINFO');
            },
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
      default:
        setMenuItems([
          {
            label: 'Clear Chat',
            formatter: () => {},
          },
          {
            label: 'Report',
            formatter: () => {},
          },
        ]);
        break;
    }
  }, [selectedMsgs]);

  React.useEffect(() => {
    dispatch(resetGalleryData());
  }, []);

  const handleMsgSelect = (message, index) => {
    if (selectedMsgs.includes(message)) {
      setSelectedMsgs(prevArray => prevArray.filter(item => message !== item));
    } else {
      setSelectedMsgs([...selectedMsgs, message]);
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
        setLocalNav={props.setLocalNav}
      />
      <ImageBackground
        source={require('../assets/chatBackgroud.png')}
        style={styles.imageBackground}>
        <ChatConversationList
          setLocalNav={props.setLocalNav}
          fromUserJId={fromUserJId}
          handleMsgSelect={handleMsgSelect}
          selectedMsgs={selectedMsgs}
        />
      </ImageBackground>
      {replyMsgs ? (
        <View paddingX={'1'} paddingY={'2'} backgroundColor={'#E2E8F9'}>
          <Stack paddingX={'3'} paddingY={'0 '} backgroundColor={'#0000001A'}>
            <View marginY={'3'} justifyContent={'flex-start'}>
              {
                {
                  text: (
                    <ReplyText
                      replyMsgItems={replyMsgs}
                      handleRemove={handleRemove}
                    />
                  ),
                  image: (
                    <ReplyImage
                      replyMsgItems={replyMsgs}
                      handleRemove={handleRemove}
                    />
                  ),
                  video: (
                    <ReplyVideo
                      replyMsgItems={replyMsgs}
                      handleRemove={handleRemove}
                    />
                  ),
                  audio: (
                    <ReplyAudio
                      replyMsgItems={replyMsgs}
                      handleRemove={handleRemove}
                    />
                  ),
                  file: (
                    <ReplyDocument
                      replyMsgItems={replyMsgs}
                      handleRemove={handleRemove}
                    />
                  ),
                  contact: (
                    <ReplyContact
                      replyMsgItems={replyMsgs}
                      handleRemove={handleRemove}
                    />
                  ),
                  location: (
                    <ReplyLocation
                      replyMsgItems={replyMsgs}
                      handleRemove={handleRemove}
                    />
                  ),
                }[replyMsgs?.msgBody?.message_type]
              }
            </View>
          </Stack>
        </View>
      ) : null}
      <ChatInput
        chatInputRef={chatInputRef}
        attachmentMenuIcons={props.attachmentMenuIcons}
        onSendMessage={handleMessageSend}
      />
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
