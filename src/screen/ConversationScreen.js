import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { isActiveChatScreenRef } from '../Helper/Chat/ChatHelper';
import { fetchGroupParticipants } from '../Helper/Chat/Groups';
import chatBackgroud from '../assets/chatBackgroud.png';
import { getImageSource } from '../common/utils';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import ConversationList from '../components/ConversationList';
import ReplyContainer from '../components/ReplyContainer';
import { RECENTCHATSCREEN } from '../constant';
import {
   getReplyMessageVariable,
   removeReplyMessageVariable,
   setReplyMessageVariable,
   useSelectedChatMessage,
} from '../hooks/useChatMessage';
import { resetUnreadCountForChat } from '../redux/Actions/RecentChatAction';
import SDK from '../SDK/SDK';
import { useAppState } from '../hooks';

function ConversationScreen() {
   const navigation = useNavigation();
   const dispatch = useDispatch();
   const { selectedMessagesArray, resetSelectedChatMessage } = useSelectedChatMessage();
   const [replyMessage, setReplyMessage] = React.useState({});
   const fromUserJId = useSelector(state => state.navigation.fromUserJid);
   const appState = useAppState();

   useFocusEffect(
      React.useCallback(() => {
         setReplyMessage(getReplyMessageVariable(fromUserJId));
         return () => {
            isActiveChatScreenRef.current = false;
         };
      }, [appState]),
   );

   React.useEffect(() => {
      intiFuntion();
   }, []);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [selectedMessagesArray]);

   const handleBackBtn = () => {
      switch (true) {
         case selectedMessagesArray.length > 0:
            resetSelectedChatMessage();
            break;
         case navigation.canGoBack():
            navigation.goBack();
            break;
         default:
            navigation.reset({
               index: 0,
               routes: [{ name: RECENTCHATSCREEN }],
            });
            break;
      }
      return true;
   };

   const intiFuntion = () => {
      fetchGroupParticipants(fromUserJId);
      dispatch(resetUnreadCountForChat(fromUserJId));
      SDK.updateRecentChatUnreadCount(fromUserJId);
   };

   const handleReply = msg => {
      setReplyMessage(msg);
      setReplyMessageVariable({ [fromUserJId]: msg });
   };

   const handleCloseReplyContainer = () => {
      setReplyMessage({});
      removeReplyMessageVariable(fromUserJId);
   };

   const handleClearChat = () => {};
   const handleGoMessageInfoScreen = () => {};
   const handleConversationSearchPress = () => {};

   const renderChatHeader = React.useMemo(
      () => <ChatHeader fromUserJId={fromUserJId} handleBackBtn={handleBackBtn} handleReply={handleReply} />,
      [fromUserJId],
   );

   const renderConversation = React.useMemo(
      () => (
         <>
            <ImageBackground source={getImageSource(chatBackgroud)} style={styles.imageBackground}>
               <ConversationList chatUserJid={fromUserJId} />
            </ImageBackground>
         </>
      ),
      [fromUserJId],
   );

   const renderChatInput = React.useMemo(
      () => <ChatInput fromUserJId={fromUserJId} handleCloseReplyContainer={handleCloseReplyContainer} />,
      [fromUserJId],
   );

   const renderReplyContainer = React.useMemo(
      () => (
         <>
            {Object.keys(replyMessage).length > 0 && (
               <ReplyContainer replyMessage={replyMessage} handleCloseReplyContainer={handleCloseReplyContainer} />
            )}
         </>
      ),
      [replyMessage],
   );

   return (
      <KeyboardAvoidingView
         keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 'auto'}
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
         {renderChatHeader}
         {renderConversation}
         {renderReplyContainer}
         {renderChatInput}
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   imageBackground: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
   },
});

export default ConversationScreen;
