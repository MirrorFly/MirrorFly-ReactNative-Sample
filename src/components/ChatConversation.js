import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, BackHandler, Pressable } from 'react-native';
import ChatHeader from '../components/ChatHeader';
import { useDispatch, useSelector } from 'react-redux';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { HStack, Slide, Spinner, Stack, Text, View } from 'native-base';
import { RECENTCHATSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { getMessages, sendMessage, sendSeenStatus, updateMessageList } from '../redux/chatSlice';
import SDK from '../SDK/SDK';
import { getLastseen } from '../common/TimeStamp';
import { ClearTextIcon, ReplyIcon } from '../common/Icons';
import { SwipeListView } from 'react-native-swipe-list-view';

const ChatConversation = (props) => {
    const dispatch = useDispatch();
    const chatInputRef = React.useRef(null)
    const currentUserJID = useSelector(state => state?.auth?.currentUserJID)
    const presenceListener = useSelector(state => state.user.userPresence)
    const messages = useSelector(state => state.chat.chatMessages)
    const fromUserJId = useSelector(state => state.navigation.fromUserJid)
    const [messageList, setMessageList] = React.useState([]);
    const [seenStatus, setSeenStatus] = React.useState('')
    const [nickName, setNickName] = React.useState('')
    const [isChatLoading, setIsChatLoading] = React.useState(false)
    const [selectedMsgs, setSelectedMsgs] = React.useState([]);
    const [replyMsgs, setReplyMsgs] = React.useState();
    const [isSwiping, setIsSwiping] = React.useState();
    const [menuItems, setMenuItems] = React.useState([]);

    const handleSwipeLeft = (rowKey) => {
        chatInputRef.current.focus();
        const filteredMsgInfo = messageList.filter(item => item.msgId === rowKey);
        setReplyMsgs(filteredMsgInfo[0]);
    };
    const handleReply = (msgId) => {
        handleSwipeLeft(msgId);
        setSelectedMsgs([])
    }

    const handleRemove = () => {
        setReplyMsgs();
    }
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

    const handleBackBtn = () => {
        let x = { screen: RECENTCHATSCREEN }
        dispatch(navigate(x))
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    const handleMessageSend = (val) => {
        let values = [val, fromUserJId]
        dispatch(sendMessage(values))
    }

    React.useEffect(() => {
        let foundMsg = selectedMsgs.filter(obj => obj.fromUserJid !== currentUserJID)
        switch (true) {
            case foundMsg.length > 0:
                setMenuItems([
                    {
                        label: 'Copy',
                        formatter: () => { }
                    },
                    {
                        label: 'Report',
                        formatter: () => { }
                    }
                ])
                break;
            case foundMsg.length == 0 && selectedMsgs.length > 0:
                setMenuItems([
                    {
                        label: 'Message Info',
                        formatter: () => {
                            props.setIsMessageInfo(selectedMsgs[0])
                            props.setLocalNav('MESSAGEINFO')
                        }
                    },
                    {
                        label: 'Copy',
                        formatter: () => { }
                    }
                ])
                break;
            default:
                setMenuItems([
                    {
                        label: 'Clear Chat',
                        formatter: () => { }
                    },
                    {
                        label: 'Report',
                        formatter: () => { }
                    }
                ])
                break;
        }
    }, [selectedMsgs])

    React.useEffect(() => {
        (async () => {
            if (fromUserJId) {
                if (messages[fromUserJId]) {
                    setMessageList(messages[fromUserJId])
                } else {
                    dispatch(getMessages(fromUserJId))
                }
                setIsChatLoading(true)
                let userId = fromUserJId?.split('@')[0]
                if (!nickName) {
                    let userDetails = await SDK.getUserProfile(userId)
                    setNickName(userDetails?.data?.nickName || userId)
                }
                let seen = await SDK.getLastSeen(fromUserJId)
                if (seen.statusCode == 200) {
                    setSeenStatus(getLastseen(seen?.data?.seconds))
                }
            }
            setIsChatLoading(false)
        })();
    }, [messages, fromUserJId])

    React.useEffect(() => {
        setTimeout(async () => {
            let seen = await SDK.getLastSeen(fromUserJId)
            if (seen.statusCode == 200) {
                setSeenStatus(getLastseen(seen?.data?.seconds))
            }
        }, 2000)
    }, [presenceListener])

    React.useEffect(() => {
        return () => {
            backHandler.remove();
        }
    }, [])

    const handleMsgSelect = (message) => {
        if (selectedMsgs.includes(message)) {
            setSelectedMsgs(prevArray => prevArray.filter(item => message !== item));
        } else {
            setSelectedMsgs([...selectedMsgs, message])
        }
    }

    React.useEffect(() => {
        if (messageList.length) {
            let unReadMsg = messageList.filter((item) => item.msgStatus == 1 && item.fromUserJid !== currentUserJID)
            if (unReadMsg.length) {
                unReadMsg.forEach(item => {
                    let data = { toJid: item.fromUserJid, msgId: item.msgId }
                    dispatch(sendSeenStatus(data))
                })
            }
        }
    }, [messageList])

    React.useEffect(() => {
        if (props.sendSelected) {
            let values = [props.selectedImages, fromUserJId, currentUserJID]
            dispatch(updateMessageList(values))
        }
    }, [props.sendSelected])

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ChatHeader
                selectedMsgs={selectedMsgs}
                setSelectedMsgs={setSelectedMsgs}
                menuItems={menuItems}
                handleBackBtn={handleBackBtn}
                seenStatus={seenStatus}
                fromUser={nickName}
                handleReply={handleReply}
            />
            <ImageBackground
                source={require('../assets/chatBackgroud.png')}
                style={{
                    flex: 1,
                    resizeMode: 'cover',
                    justifyContent: 'center',
                }}
            >
                {
                    isChatLoading && <Slide mt="20" in={isChatLoading} placement="top">
                        <HStack space={8} justifyContent="center" alignItems="center">
                            <Spinner size="lg" color={'#3276E2'} />
                        </HStack>
                    </Slide>
                }
                <SwipeListView
                    data={messageList}
                    inverted
                    keyExtractor={(item, index) => item.msgId.toString()}
                    renderItem={({ item }) => {
                        return <ChatMessage handleMsgSelect={handleMsgSelect} selectedMsgs={selectedMsgs} message={item} />
                    }}
                    renderHiddenItem={renderHiddenItem}
                    disableLeftSwipe={true}
                    disableRightSwipe={false}
                    stopLeftSwipe={70}
                    leftOpenValue={leftActionValue}
                    leftActivationValue={leftActivationValue}
                    initialLeftActionState={initialLeftActionState}
                    onLeftAction={(key) => onLeftAction(key)}
                    onLeftActionStatusChange={(data) => onLeftActionStatusChange(data)}
                />
            </ImageBackground>
            {replyMsgs ? <View paddingX={"1"} paddingY={"1"} backgroundColor={"#DDE3E5"}  >
                <Stack paddingX={"3"} paddingY={"0 "} backgroundColor={"#E2E8F9"}>
                    <View flexDirection={"row"} justifyContent={"flex-end"}  >
                        {replyMsgs ? <Pressable style={{ padding: 5, justifyContent: "flex-end", backgroundColor: "#FFF", borderRadius: 20, borderWidth: 1, borderColor: "black" }} onPress={handleRemove}>
                            <ClearTextIcon />
                        </Pressable> : null}
                    </View>
                    <View mb={"2"} justifyContent={"flex-start"} >
                        {replyMsgs.fromUserJid === currentUserJID ? <Text py="0"  >You</Text> : <Text py="0"  >{replyMsgs?.msgBody.nickName}</Text>}
                        {{
                            "text": <Text numberOfLines={1} fontSize={14} color='#313131'>{replyMsgs?.msgBody?.message}</Text>,
                            "image": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>image</Text>,
                            "video": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>video</Text>,
                            "audio": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>audio</Text>,
                        }[replyMsgs?.msgBody?.message_type]}
                    </View>
                </Stack>
            </View> : null}
            <ChatInput chatInputRef={chatInputRef} attachmentMenuIcons={props.attachmentMenuIcons} onSendMessage={handleMessageSend} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ChatConversation;
