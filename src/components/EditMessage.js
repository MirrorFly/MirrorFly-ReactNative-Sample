import React from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import ScreenHeader from '../common/ScreenHeader';
import SlideInView from '../common/SlideInView';
import { getCurrentChatUser, getUserIdFromJid } from '../helpers/chatHelpers';
import { toggleEditMessage } from '../redux/chatMessageDataSlice';
import { setTextMessage } from '../redux/draftSlice';
import { useChatMessage, useEditMessageId } from '../redux/reduxHook';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

function EditMessage({ jid }) {
   const dispatch = useDispatch();
   const userId = getUserIdFromJid(getCurrentChatUser());
   const editMessageId = useEditMessageId();
   const message = useChatMessage(userId, editMessageId);

   const handleBackAction = () => {
      dispatch(setTextMessage({ userId, message: '' }));
      dispatch(toggleEditMessage(''));
   };

   if (!editMessageId) {
      return null;
   }

   return (
      <SlideInView visible={Boolean(editMessageId)}>
         <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
            <ScreenHeader
               titleCenter={true}
               onBackAction={handleBackAction}
               title={'Edit Message'}
               isSearchable={false}
            />
            <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'flex-end' }}>
               <ChatMessage item={message} disablefunction={true} />
            </ScrollView>
         </View>
         <ChatInput chatUser={jid} />
      </SlideInView>
   );
}

export default EditMessage;
