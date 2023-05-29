import React from 'react';
import { StyleSheet, FlatList, KeyboardAvoidingView, Platform, ImageBackground, BackHandler } from 'react-native';
import ChatHeader from '../components/ChatHeader';
import { useDispatch, useSelector } from 'react-redux';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { HStack, Slide, Spinner } from 'native-base';
import { RECENTCHATSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { getMessages, sendMessage, sendSeenStatus } from '../redux/chatSlice';
import SDK from '../SDK/SDK';
import { getLastseen } from '../common/TimeStamp';

const ChatConversation = (props) => {
    const dispatch = useDispatch();
    const currentUserJID = useSelector(state => state?.auth?.currentUserJID)
    const presenceListener = useSelector(state => state.user.userPresence)
    const messages = useSelector(state => state.chat.chatMessages)
    const fromUserJId = useSelector(state => state.navigation.fromUserJid)
    const [messageList, setMessageList] = React.useState([])
    const [seenStatus, setSeenStatus] = React.useState('')
    const [nickName, setNickName] = React.useState('')
    const [isChatLoading, setIsChatLoading] = React.useState(false)
    const [selectedMsgs, setSelectedMsgs] = React.useState([])
    const [menuItems, setMenuItems] = React.useState([])

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

    const handleEndReached = (val) => {
        console.log(val, 'handleEndReached')
    }

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
            if(unReadMsg.length){
                unReadMsg.forEach(item => {
                    let data = { toJid: item.fromUserJid, msgId: item.msgId }
                    dispatch(sendSeenStatus(data))
                })
            }
        }
    }, [messageList])

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ChatHeader selectedMsgs={selectedMsgs} menuItems={ menuItems} handleBackBtn={handleBackBtn} seenStatus={seenStatus} fromUser={nickName} />
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
                <FlatList
                    inverted
                    data={messageList}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={handleEndReached}
                    renderItem={({ item }) => {
                        return <ChatMessage handleMsgSelect={handleMsgSelect} selectedMsgs={selectedMsgs} message={item} />
                    }}
                />
            </ImageBackground>
            <ChatInput onSendMessage={handleMessageSend} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ChatConversation;
