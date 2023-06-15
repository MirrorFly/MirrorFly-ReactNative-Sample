import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, BackHandler } from 'react-native';
import ChatHeader from '../components/ChatHeader';
import { useDispatch, useSelector } from 'react-redux';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { HStack, IconButton, Slide, Spinner, Stack, Text, View, VStack } from 'native-base';
import { RECENTCHATSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { getMessages, sendMessage, sendSeenStatus, updateMessageList } from '../redux/chatSlice';
import SDK from '../SDK/SDK';
import { getLastseen } from '../common/TimeStamp';
import { ClearTextIcon, ReplyIcon } from '../common/Icons';
import { Pressable } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

const ChatConversation = (props) => {
    const dispatch = useDispatch();
    const currentUserJID = useSelector(state => state?.auth?.currentUserJID)
    console.log("currentUserJID",currentUserJID);
    const presenceListener = useSelector(state => state.user.userPresence)
    const messages = useSelector(state => state.chat.chatMessages)
    const fromUserJId = useSelector(state => state.navigation.fromUserJid)
    

    const [messageList, setMessageList] = React.useState([]);
    const [seenStatus, setSeenStatus] = React.useState('')
    const [nickName, setNickName] = React.useState('')
    const [isChatLoading, setIsChatLoading] = React.useState(false)
    const [messageContent, setMessageContent] = React.useState(false);
    const [selectedMsgs, setSelectedMsgs] = React.useState([]);
    const [replyMsgs, setReplyMsgs] = React.useState();
    const [activeIcon, setActiveIcon] =React.useState();
    const [menuItems, setMenuItems] = React.useState([]);
    //const [swipeOpenValue, setSwipeOpenValue] = React.useState(-1);


    const handleSwipeLeft = (rowKey) => {
        const filteredMsgInfo = messageList.filter(item => item.msgId === rowKey);
        console.log("filteredMsgInfo",messageList);
        
            setReplyMsgs(filteredMsgInfo[0]);
        
     

    };
    const handleReply = () => {
        setMessageContent(true);
    }

    const handleRemove = () => {
     
        setReplyMsgs();
    }
    const renderHiddenItem = (data, rowMap) => {

        
          
        return(
    <HStack  ml={"2"} flex={"0.8"} > 
        <HStack  justifyContent={"center"} p={"3"} backgroundColor={ activeIcon?.isActivated && activeIcon?.key === data.item.msgId ? "#E5E5E5":null}  borderRadius={"50"} alignItems="center" >
          { activeIcon?.isActivated && activeIcon?.key === data.item.msgId && <ReplyIcon/>  } 
           
            </HStack>
     </HStack>
   
        )
    }

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const deleteRow = (rowMap, rowKey) => {
        closeRow(rowMap, rowKey);
        const newData = [...messageList];
        const prevIndex = messageList.findIndex(item => item.key === rowKey);
        newData.splice(prevIndex, 1);
        setMessageList(newData);
    };

    const onRowDidOpen = (rowMap, rowKey) => {
        console.log('This row opened', rowKey);
        closeRow(rowMap, rowKey);
    };

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

    const handleRowClose = (rowKey) => {

        //console.log(rowKey, 'rowKey handleRowClose');
     
        handleSwipeLeft(rowKey);


    };
    const onLeftAction = (Key) => {
       // console.log(`Left action triggered for msgID: ${key}`);
      
    };

    // const onRightAction = (key) => {
    //     console.log(`Right action triggered for msgID: ${key}`);
    //     // Perform desired action when right action is triggered
    // };

    const onLeftActionStatusChange = (res) => {
 
         setActiveIcon(res);
        
         console.log("onLeftActionStatusChange",res);
         
            
         
    };
    console.log("activeIcon",activeIcon);  


    // const onRightActionStatusChange = ({ key, isOpen }) => {
    //     console.log(`Right action status changed for msgID: ${key}. Open: ${isOpen}`);
    //     // Perform desired action when swipe value reaches rightActivationValue
    // };
     const leftActivationValue = 20; // Adjust as needed
    // const rightActivationValue = -20; // Adjust as needed
    const leftActionValue = 20; // Adjust as needed
   // const rightActionValue = -20; // Adjust as needed
    const initialLeftActionState = false; // Adjust as needed
    // const initialRightActionState = false; // Adjust as needed
    

    const handleMsgSelect = (message) => {
        console.log(message, 'message');
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
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ChatHeader selectedMsgs={selectedMsgs} setSelectedMsgs={setSelectedMsgs} menuItems={menuItems} handleBackBtn={handleBackBtn} seenStatus={seenStatus} fromUser={nickName} handleReply={handleReply} />
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
                   // inverted
                    keyExtractor={(item, index) => item.msgId.toString()}
                    renderItem={({ item }) => {
                        return <ChatMessage handleMsgSelect={handleMsgSelect} selectedMsgs={selectedMsgs} message={item}   />
                    }}
                    renderHiddenItem={renderHiddenItem}
                    // previewRowKey={'0'}
                    // previewOpenDelay={3000}
                    // previewOpenValue={1000}
                    disableLeftSwipe={true}
                    disableRightSwipe={false}
                    stopLeftSwipe={70}
                    swipeToOpenPercent={30}
                    swipeToClosePercent={30}
                    onRowClose={handleRowClose}
    //                 onSwipeValueChange={(swipeData) => {
    //                     console.log("swipeData",swipeData);
    //    // setSwipeOpenValue(swipeData.isOpen ? swipeData.index : -1);
    //   }}
                     onRowPress={(rowKey, rowMap) => console.log('Row pressed:', rowKey)}
                  //  rightOpenValue={rightActionValue}
                    leftOpenValue={leftActionValue}
                    
                     onLeftAction={(key) => onLeftAction(key)}
                    // onRightAction={(key) => onRightAction(key)}
                    onLeftActionStatusChange={(data)=>onLeftActionStatusChange(data)}
                    // onRightActionStatusChange={(data) => onRightActionStatusChange(data)}
                    leftActivationValue={leftActivationValue}
                    // rightActivationValue={rightActivationValue}
                    initialLeftActionState={initialLeftActionState}
                    //initialRightActionState={initialRightActionState}
                />
            </ImageBackground>
            {replyMsgs ? <View paddingX={"1"} paddingY={"1"} backgroundColor={"#DDE3E5"}  >
                <Stack  paddingX={"3"} paddingY={"0 "} backgroundColor={"#E2E8F9"}>
                    <View flexDirection={"row"} justifyContent={"flex-end"}  >

                        {replyMsgs ? <Pressable style={{ padding: 5, justifyContent:"flex-end",backgroundColor:"#FFF",borderRadius:20,borderWidth:1,borderColor:"black"}} onPress={handleRemove}>
                            <ClearTextIcon />
                        </Pressable> : null}

                    </View>
                    <View mb={"2"} justifyContent={"flex-start"} >
               { replyMsgs.fromUserJid === currentUserJID ? <Text py="0"  >You</Text> :<Text py="0"  >{replyMsgs?.msgBody.nickName}</Text> }
                    <Text py="0" mr={"6"} fontWeight={"400"} color={"#767676"} numberOfLines={1}>{replyMsgs?.msgBody.message}</Text>
                    </View>
                </Stack>
            </View> : null}



            <ChatInput attachmentMenuIcons={props.attachmentMenuIcons} onSendMessage={handleMessageSend} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ChatConversation;
