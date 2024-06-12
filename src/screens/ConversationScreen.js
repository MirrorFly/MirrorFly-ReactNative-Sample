import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { BackHandler, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { fetchGroupParticipants } from '../SDK/utils';
import chatBackgroud from '../assets/chatBackgroud.png';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import ConversationList from '../components/ConversationList';
import { getImageSource, getUserIdFromJid, handelResetMessageSelection } from '../helpers/chatHelpers';
import { MIX_BARE_JID, RECENTCHATSCREEN } from '../helpers/constants';
import { useChatMessages } from '../redux/reduxHook';

export let currentChatUser = '';

function ConversationScreen({ chatUser = '' }) {
   const { params: { jid = '' } = {} } = useRoute();
   const _jid = jid || chatUser; // TO HANDLE APPLCATION RENDER BY COMPONENT BY COMPONENT
   currentChatUser = _jid;
   const userId = getUserIdFromJid(_jid);
   const navigation = useNavigation();
   const messaesList = useChatMessages(userId) || [];

   const isAnySelected = React.useMemo(() => {
      return messaesList.some(item => item.isSelected === 1);
   }, [messaesList.map(item => item.isSelected).join(',')]); // Include isSelected in the dependency array

   React.useState(() => {
      if (MIX_BARE_JID.test(_jid)) {
         fetchGroupParticipants(_jid);
      }
   }, []);

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

   const renderChatHeader = React.useMemo(() => <ChatHeader chatUser={_jid} />, [_jid]);

   const renderConversationList = React.useMemo(() => <ConversationList chatUser={_jid} />, [_jid]);

   const renderChatInput = React.useMemo(() => <ChatInput chatUser={_jid} />, []);

   return (
      <KeyboardAvoidingView
         keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 'auto'}
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
         {renderChatHeader}
         <ImageBackground source={getImageSource(chatBackgroud)} style={styles.imageBackground}>
            {renderConversationList}
         </ImageBackground>
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
