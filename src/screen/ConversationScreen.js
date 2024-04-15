import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { BackHandler, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import chatBackgroud from '../assets/chatBackgroud.png';
import { getImageSource } from '../common/utils';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import ConversationList from '../components/ConversationList';
import { RECENTCHATSCREEN } from '../constant';
import { useSelectedChatMessage } from '../hooks/useChatMessage';

function ConversationScreen() {
   const navigation = useNavigation();
   const { selectedMessagesArray, resetSelectedChatMessage } = useSelectedChatMessage();

   const fromUserJId = useSelector(state => state.navigation.fromUserJid);
   const chatUserId = getUserIdFromJid(fromUserJId);

   useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [navigation, selectedMessagesArray]);

   const handleBackBtn = () => {
      switch (true) {
         case selectedMessagesArray.length > 0:
            resetSelectedChatMessage();
            break;
         case !navigation.canGoBack():
            navigation.reset({
               index: 0,
               routes: [{ name: RECENTCHATSCREEN }],
            });
            break;
         default:
            navigation.goBack();
            break;
      }
      return true;
   };

   const renderConversation = React.useMemo(
      () => (
         <>
            <ChatHeader fromUserJId={chatUserId} handleBackBtn={handleBackBtn} />
            <ImageBackground source={getImageSource(chatBackgroud)} style={styles.imageBackground}>
               <ConversationList chatUserJid={fromUserJId} />
            </ImageBackground>
            <ChatInput />
         </>
      ),
      [fromUserJId],
   );

   return (
      <KeyboardAvoidingView
         keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 'auto'}
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
         {renderConversation}
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
