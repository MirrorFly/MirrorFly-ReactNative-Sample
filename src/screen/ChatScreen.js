import React from 'react';
import { BackHandler, FlatList, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { RECENTCHATSCREEN } from '../constant';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { getMessages, sendMessage } from '../redux/chatSlice';
import { getLastseen } from '../common/TimeStamp';
import { BackBtn } from '../common/Button';
import Avathar from '../common/Avathar';
import SDK from '../SDK/SDK';
import { HStack, Slide, Spinner } from 'native-base';

const ChatScreen = () => {
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.chatMessages)
  const fromUserJId = useSelector(state => state.navigation.fromUserJid)
  const [messageList, setMessageList] = React.useState([])
  const [seenStatus, setSeenStatus] = React.useState('')
  const [nickName, setNickName] = React.useState('')
  const [isChatLoading, setIsChatLoading] = React.useState(false)

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
    (async () => {
      if (fromUserJId) {
        setIsChatLoading(true)
        let userId = fromUserJId?.split('@')[0]
        let userDetails = await SDK.getUserProfile(userId)
        setNickName(userDetails?.data?.nickName || userId)
        if (messages[fromUserJId]) {
          setMessageList(messages[fromUserJId])
        } else {
          dispatch(getMessages(fromUserJId)).then((res) => {
            console.log(res)
          });
        }
        let seen = await SDK.getLastSeen(fromUserJId)
        setSeenStatus(getLastseen(seen?.data?.seconds))
      }
      setIsChatLoading(false)
    })();
  }, [messages, fromUserJId])
  console.log(isChatLoading, 'isChatLoading')

  React.useEffect(() => {
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
          <Avathar data={nickName ? nickName : '91'} />
          <View style={styles.userName}>
            <Text numberOfLines={1} ellipsizeMode='tail' >{nickName}</Text>
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
          {isChatLoading
            ? <Slide mt="20" in={isChatLoading} placement="top">
              <HStack space={8} justifyContent="center" alignItems="center">
                <Spinner size="lg" color={'#3276E2'} width={5} />
              </HStack>
            </Slide>
            : <FlatList
              inverted
              data={messageList}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={handleEndReached}
              renderItem={({ item }) => {
                return <ChatMessage message={item} />
              }}
            />}
        </ImageBackground>
      </View>
      <View style={styles.options}>
        <ChatInput onSendMessage={handleMessageSend} />
      </View>
    </>
  );
};

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
    padding: 15
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

export default ChatScreen;