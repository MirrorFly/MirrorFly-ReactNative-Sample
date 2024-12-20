import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { BackHandler, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import SDK from '../SDK/SDK';
import { fetchGroupParticipants, getUserProfileFromSDK } from '../SDK/utils';
import chatBackgroud from '../assets/chatBackgroud.png';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import ConversationList from '../components/ConversationList';
import EditMessage from '../components/EditMessage';
import ReplyContainer from '../components/ReplyContainer';
import {
   getImageSource,
   getUserIdFromJid,
   handelResetMessageSelection,
   resetConversationScreen,
} from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { resetUnreadCountForChat } from '../redux/recentChatDataSlice';
import { useReplyMessage, useSelectedChatMessages } from '../redux/reduxHook';
import { RECENTCHATSCREEN } from './constants';

export let currentChatUser = '';

function ConversationScreen({ chatUser = '' }) {
   const { params: { jid: _jid = '' } = {} } = useRoute();
   const [jid, setJid] = React.useState(_jid || chatUser); // TO HANDLE APPLCATION RENDER BY COMPONENT BY COMPONENT
   currentChatUser = _jid || chatUser;
   SDK.activeChatUser(currentChatUser);
   const dispatch = useDispatch();
   const userId = getUserIdFromJid(jid);
   const navigation = useNavigation();
   const isAnySelected = useSelectedChatMessages(userId) || [];
   const replyMessage = useReplyMessage(userId) || {};

   React.useEffect(() => {
      SDK.updateRecentChatUnreadCount(currentChatUser);
      dispatch(resetUnreadCountForChat(currentChatUser));
      if (MIX_BARE_JID.test(jid)) {
         fetchGroupParticipants(jid);
      } else {
         getUserProfileFromSDK(userId);
      }
      return () => resetConversationScreen(userId);
   }, []);

   React.useEffect(() => {
      setJid(currentChatUser);
   }, [_jid, chatUser]);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, [isAnySelected]);

   const handleBackBtn = () => {
      switch (true) {
         case isAnySelected:
            handelResetMessageSelection(userId)();
            break;
         case navigation.canGoBack():
            currentChatUser = '';
            SDK.activeChatUser(currentChatUser);
            navigation.goBack();
            break;
         default:
            currentChatUser = '';
            SDK.activeChatUser(currentChatUser);
            navigation.reset({
               index: 0,
               routes: [{ name: RECENTCHATSCREEN }],
            });
            break;
      }
      return true;
   };

   const renderChatHeader = React.useMemo(() => <ChatHeader chatUser={jid} />, [jid]);

   const renderConversationList = React.useMemo(() => <ConversationList chatUser={jid} />, [jid]);

   const renderChatInput = React.useMemo(() => <ChatInput chatUser={jid} />, []);

   const renderReplyContainer = React.useMemo(
      () => (
         <>{Object.keys(replyMessage).length > 0 && <ReplyContainer chatUser={jid} replyMessage={replyMessage} />}</>
      ),
      [replyMessage],
   );

   return (
      <KeyboardAvoidingView
         keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 'auto'}
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
         {renderChatHeader}
         <ImageBackground source={getImageSource(chatBackgroud)} style={styles.imageBackground}>
            {renderConversationList}
         </ImageBackground>
         {renderReplyContainer}
         {renderChatInput}
         <EditMessage />
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
