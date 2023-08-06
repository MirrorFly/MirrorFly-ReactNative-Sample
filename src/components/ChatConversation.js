import React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Pressable,
} from 'react-native';
import ChatHeader from '../components/ChatHeader';
import { useSelector, useDispatch } from 'react-redux';
import ChatInput from '../components/ChatInput';
import { Stack, Text, View } from 'native-base';
import { ClearTextIcon } from '../common/Icons';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { resetGalleryData } from '../redux/Actions/GalleryAction';
import ChatConversationList from './ChatConversationList';

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

  const handleReply = msgId => {
    setSelectedMsgs([]);
  };

  const handleRemove = () => {
    setReplyMsgs();
  };

  const handleMessageSend = messageContent => {
    let message = {
      type: 'text',
      content: messageContent,
    };
    handleSendMsg(message);
  };

  React.useEffect(() => {
    let foundMsg = selectedMsgs.filter(
      obj => obj.fromUserJid !== currentUserJID,
    );
    switch (true) {
      case foundMsg.length > 0:
        setMenuItems([
          {
            label: 'Copy',
            formatter: () => {},
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
            label: 'Copy',
            formatter: () => {},
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

  const handleMsgSelect = message => {
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
        <View paddingX={'1'} paddingY={'1'} backgroundColor={'#DDE3E5'}>
          <Stack paddingX={'3'} paddingY={'0 '} backgroundColor={'#E2E8F9'}>
            <View flexDirection={'row'} justifyContent={'flex-end'}>
              {replyMsgs ? (
                <Pressable
                  style={styles.removeReplyMessage}
                  onPress={handleRemove}>
                  <ClearTextIcon />
                </Pressable>
              ) : null}
            </View>
            <View mb={'2'} justifyContent={'flex-start'}>
              {replyMsgs.fromUserJid === currentUserJID ? (
                <Text py="0">You</Text>
              ) : (
                <Text py="0">{replyMsgs?.msgBody.nickName}</Text>
              )}
              {
                {
                  text: (
                    <Text numberOfLines={1} fontSize={14} color="#313131">
                      {replyMsgs?.msgBody?.message}
                    </Text>
                  ),
                  image: (
                    <Text
                      fontWeight={'600'}
                      fontStyle={'italic'}
                      fontSize={14}
                      color="#313131">
                      image
                    </Text>
                  ),
                  video: (
                    <Text
                      fontWeight={'600'}
                      fontStyle={'italic'}
                      fontSize={14}
                      color="#313131">
                      video
                    </Text>
                  ),
                  audio: (
                    <Text
                      fontWeight={'600'}
                      fontStyle={'italic'}
                      fontSize={14}
                      color="#313131">
                      audio
                    </Text>
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
