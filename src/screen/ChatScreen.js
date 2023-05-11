import React, { useEffect, useState } from 'react';
import { BackHandler, FlatList, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { BackBtn } from '../common/Button';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { useDispatch, useSelector } from 'react-redux';
import Avathar from '../common/Avathar';
import SDK from '../SDK/SDK';
import { getMessages, sendMessage } from '../redux/chatSlice';
import { getLastseen } from '../common/TimeStamp';
import { navigate } from '../redux/navigationSlice';
import { RECENTCHATSCREEN } from '../constant';

const ChatScreen = () => {
    const dispatch = useDispatch();
    const messages = useSelector(state => state.chat.chatMessages)
    const fromUserJId = useSelector(state => state.navigation.fromUserJid)
    const [messageList, setMessageList] = useState([])
    const [seenStatus, setSeenStatus] = useState('')

    const handleMessageSend = (val) => {
        let values = [val, fromUserJId]
        dispatch(sendMessage(values))
    }

    useEffect(() => {
        (async () => {
            if (messages[fromUserJId]) {
                setMessageList(messages[fromUserJId])
            } else {
                dispatch(getMessages(fromUserJId));
            }
            let seen = await SDK.getLastSeen(fromUserJId)
            setSeenStatus(getLastseen(seen?.data?.seconds))
        })();
    }, [messages, fromUserJId])

    const handleBackBtn = () => {
        let x = { screen: RECENTCHATSCREEN }
        dispatch(navigate(x))
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    useEffect(() => {
        return () => backHandler.remove()
    }, [])

    const handleEndReached = (val) => {
        console.log(val, 'handleEndReached')
    }

    return (
        <>
            <View style={styles.chatHeader}>
                <BackBtn onPress={handleBackBtn} />
                <View style={styles.avatarContainer}>
                    <Avathar data={fromUserJId ? fromUserJId : '91'} />
                    <View style={styles.userName}>
                        <Text numberOfLines={1} ellipsizeMode='tail' >{fromUserJId}</Text>
                        <Text numberOfLines={1} ellipsizeMode='tail'>{seenStatus}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.container}>
                <ImageBackground
                    source={require('../assets/chatBackgroud.png')}
                    style={styles.imageBackground}
                    resizeMode="cover"
                >
                    <FlatList
                        inverted
                        data={messageList}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReached={handleEndReached}
                        renderItem={({ item }) => {
                            return <ChatMessage message={item} />
                        }}
                    />
                </ImageBackground>
            </View>
            <View style={styles.options}>
                <ChatInput onSendMessage={handleMessageSend} />
            </View>
        </>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 18
    },
    imageBackground: {
        flex: 1,
    },
    text: {
        color: 'black',
        fontSize: 20,
    },
    chatHeader: {
        backgroundColor: '#fff',
        height: 56,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        elevation: 10
    },
    avatarContainer: {
        marginStart: 16.97,
        display: 'flex',
        flexDirection: 'row',
    },
    avatar: {
        width: 36.37,
        height: 36.37,
        borderRadius: 50,
        backgroundColor: 'black',
    },
    userName: {
        width: 170,
        marginStart: 10,
    },
    options: {
        backgroundColor: '#fff',
        borderTopWidth: 2,
        borderColor: "#c1c1c1",
    }
});
// for IOS Elevation
// style={{
//     shadowOpacity: 0.5,
//     shadowRadius: 3,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   }}