import React from 'react';
import { BackHandler, FlatList, ImageBackground, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { RECENTCHATSCREEN } from '../constant';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { getMessages, sendMessage } from '../redux/chatSlice';
import { getLastseen } from '../common/TimeStamp';
import SDK from '../SDK/SDK';
import { Button, HStack, Slide, Spinner, VStack } from 'native-base';
import ChatHeader from '../components/ChatHeader';

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
        if (!nickName) {
          let userDetails = await SDK.getUserProfile(userId)
          setNickName(userDetails?.data?.nickName || userId)
        }
        if (messages[fromUserJId]) {
          setMessageList(messages[fromUserJId])
        } else {
          dispatch(getMessages(fromUserJId))
        }
        let seen = await SDK.getLastSeen(fromUserJId)
        if (seen.statusCode == 200) {
          setSeenStatus(getLastseen(seen?.data?.seconds))
        }
      }
      setIsChatLoading(false)``
    })();
  }, [messages, fromUserJId])

  React.useEffect(() => {
    return () => backHandler.remove()
  }, [])

  const handleEndReached = (val) => {
    console.log(val, 'handleEndReached')
  }

  return (
    <>
      <ChatHeader handleBackBtn={handleBackBtn} seenStatus={seenStatus} fromUser={nickName} />
      <ImageBackground
        source={require('../assets/chatBackgroud.png')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <VStack h='full'>
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
              return <ChatMessage message={item} />
            }}
          />
        </VStack>
      </ImageBackground>
      <ChatInput onSendMessage={handleMessageSend} />
    </>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
  }
});

export default ChatScreen;