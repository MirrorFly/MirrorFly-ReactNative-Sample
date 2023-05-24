import React from 'react';
import { StyleSheet,FlatList, KeyboardAvoidingView, Platform, ImageBackground, BackHandler } from 'react-native';
import ChatHeader from '../components/ChatHeader';
import { useDispatch, useSelector } from 'react-redux';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { HStack, Slide, Spinner } from 'native-base';
import { RECENTCHATSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { getMessages, sendMessage } from '../redux/chatSlice';
import SDK from '../SDK/SDK';
import { getLastseen } from '../common/TimeStamp';

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
    return () => {
      backHandler.remove();
    }
  }, [])

  const handleEndReached = (val) => {
    console.log(val, 'handleEndReached')
  }


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust the value as per your UI design
    >
      <ChatHeader handleBackBtn={handleBackBtn} seenStatus={seenStatus} fromUser={nickName} />
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
            return <ChatMessage message={item} />
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

export default ChatScreen;
