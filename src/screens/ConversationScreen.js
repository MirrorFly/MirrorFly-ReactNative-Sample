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
   setCurrentChatUser,
} from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { resetUnreadCountForChat } from '../redux/recentChatDataSlice';
import { useAnySelectedChatMessages, useEditMessageId, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { RECENTCHATSCREEN } from './constants';

function ConversationScreen({ chatUser = '' }) {
   const { params: { jid: _jid = '' } = {} } = useRoute();
   const [jid, setJid] = React.useState(_jid || chatUser); // TO HANDLE APPLCATION RENDER BY COMPONENT BY COMPONENT
   let currentChatUser = jid || chatUser;
   setCurrentChatUser(currentChatUser);
   const themeColorPalatte = useThemeColorPalatte();
   SDK.activeChatUser(currentChatUser);
   const dispatch = useDispatch();
   const userId = getUserIdFromJid(jid);
   const navigation = useNavigation();
   const isAnySelected = useAnySelectedChatMessages(userId);
   const editMessageId = useEditMessageId();

   React.useEffect(() => {
      SDK.updateRecentChatUnreadCount(currentChatUser);
      dispatch(resetUnreadCountForChat(currentChatUser));
      if (MIX_BARE_JID.test(jid)) {
         fetchGroupParticipants(jid);
      } else {
         getUserProfileFromSDK(userId);
      }
      return () => resetConversationScreen(userId);
   }, [jid]);

   React.useEffect(() => {
      setJid(_jid || chatUser);
   }, [_jid, chatUser]);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [isAnySelected]);

   const handleBackBtn = () => {
      switch (true) {
         case isAnySelected:
            handelResetMessageSelection(userId)();
            break;
         case navigation.canGoBack():
            setCurrentChatUser('');
            SDK.activeChatUser('');
            navigation.goBack();
            break;
         default:
            setCurrentChatUser('');
            SDK.activeChatUser('');
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

   const renderChatInput = React.useMemo(
      () => (editMessageId ? null : <ChatInput chatUser={jid} />),
      [jid, editMessageId],
   );

   return (
      <KeyboardAvoidingView
         enabled={Platform.OS === 'ios'}
         keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 'auto'}
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
         {renderChatHeader}
         <ImageBackground
            source={getImageSource(chatBackgroud)}
            style={[styles.imageBackground, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}>
            {renderConversationList}
         </ImageBackground>
         <ReplyContainer chatUser={jid} />
         <EditMessage jid={jid} />
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
