import React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Pressable,
  // FlatList,
} from 'react-native';
import ChatHeader from '../components/ChatHeader';
import { useSelector, useDispatch } from 'react-redux';
import ChatInput from '../components/ChatInput';
import { HStack, Stack, Text, View, useToast, Box } from 'native-base';
// import SDK from '../SDK/SDK';
import { ClearTextIcon, GalleryAllIcon } from '../common/Icons';
// import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
// import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
// import { updateMsgSeenStatus } from './chat/common/createMessage';
import { resetGalleryData } from '../redux/Actions/GalleryAction';
// import ChatMessage from './ChatMessage';
// import { clearGalleryData } from '../redux/utils';
import ChatConversationList from './ChatConversationList';
import Clipboard from '@react-native-clipboard/clipboard';
import ReplyText from './ReplyText';
import ReplyImage from './ReplyImage';
import ReplyVideo from './ReplyVideo';
import ReplyAudio from './ReplyAudio';
import ReplyDocument from './ReplyDocument';
import ReplyLocation from './ReplyLocation';
import ReplyContact from './ReplyContact';

const ChatConversation = React.memo(props => {
  const { handleSendMsg } = props;
  const dispatch = useDispatch();
  const chatInputRef = React.useRef(null);
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);
  // const messages = useSelector(state => state.chatConversationData.data);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  // const [messageList, setMessageList] = React.useState([]);
  const [selectedMsgs, setSelectedMsgs] = React.useState([]);
  const [replyMsgs, setReplyMsgs] = React.useState();
  const [menuItems, setMenuItems] = React.useState([]);
  // const [selectedMsgIndex, setSelectedMsgIndex] = React.useState();

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
 
    if (selectedMsgs[0].msgBody.message.length <= 500) {
      Clipboard.setString(selectedMsgs[0].msgBody.message);
    }
    if (selectedMsgs[0].msgBody.message) {
      return toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={{ color: '#fff', padding: 5 }}>
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
   // console.log('selectedMsgs', selectedMsgs[0].msgBody?.message);
  };

  const handleRemove = () => {
    setReplyMsgs();
  };

  const handleMessageSend = messageContent => {
    let message = {
      type: 'text',
      content: messageContent,
      replyTo:replyMsgs?.msgId || ''
    };
    handleSendMsg(message);

     if(message.replyTo =!'')
     {
       handleRemove();
     }  
  };

  React.useEffect(() => {
    let foundMsg = selectedMsgs.filter(
      obj => obj.fromUserJid !== currentUserJID,
    );
    switch (true) {
      case foundMsg.length > 0:
        setMenuItems([
          {
            label:
             selectedMsgs[0].msgBody.message_type === 'text' ? 'Copy' : null,
            formatter: copyToClipboard,
          
          },

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
              selectedMsgs[0].msgBody.message_type === 'file' &&
              selectedMsgs[0].msgBody.message_type === 'video' &&
              selectedMsgs[0].msgBody.message_type === 'image'
                ? 'Share'
                : null,
            formatter: () => {},
          },
          {
            label:
              selectedMsgs[0].msgBody.message_type === 'text' ? 'Copy' : null,
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

  // const getChatMessageHistoryById = id => {
  //   if (messages[id]?.messages) {
  //     return Object.values(messages[id]?.messages).reverse();
  //   }
  //   return [];
  // };

  // React.useEffect(() => {
  //   if (fromUserJId) {
  //     if (messages[getUserIdFromJid(fromUserJId)]) {
  //       setMessageList(
  //         getChatMessageHistoryById(getUserIdFromJid(fromUserJId)),
  //       );
  //     }
  //   }
  // }, [messages, fromUserJId]);

  React.useEffect(() => {
    // (async () => {
    //   if (messages[getUserIdFromJid(fromUserJId)]) {
    //     setMessageList(
    //       getChatMessageHistoryById(getUserIdFromJid(fromUserJId)),
    //     );
    //   } else {
    //     let chatMessage = await SDK.getChatMessagesDB(fromUserJId);
    //     if (chatMessage?.statusCode === 200) {
    //       dispatch(addChatConversationHistory(chatMessage));
    //     }
    //   }
    // })();
    // clearGalleryData();
    dispatch(resetGalleryData());
  }, []);

  const handleMsgSelect = (message, index) => {
    if (selectedMsgs.includes(message)) {
      setSelectedMsgs(prevArray => prevArray.filter(item => message !== item));
    } else {
      setSelectedMsgs([...selectedMsgs, message]);
    }
    
  };

  // React.useEffect(() => {
  //   updateMsgSeenStatus();
  // }, [messageList]);

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
        style={{
          flex: 1,
          resizeMode: 'cover',
          justifyContent: 'center',
        }}>
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
});

export default ChatConversation;
