import React from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import ScreenHeader from '../common/ScreenHeader';
import SlideInView from '../common/SlideInView';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { toggleEditMessage } from '../redux/chatMessageDataSlice';
import { setTextMessage } from '../redux/draftSlice';
import { useChatMessage, useEditMessageId } from '../redux/reduxHook';
import { currentChatUser } from '../screens/ConversationScreen';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

function EditMessage() {
   const dispatch = useDispatch();
   const userId = getUserIdFromJid(currentChatUser);
   const editMessageId = useEditMessageId();
   const message = useChatMessage(userId, editMessageId);

   const handleBackAction = () => {
      dispatch(setTextMessage({ userId, message: '' }));
      dispatch(toggleEditMessage(''));
   };

   const renderChatInput = React.useMemo(() => <ChatInput chatUser={currentChatUser} />, []);

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
         </View>
         <View style={{ zIndex: -1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
            <ChatMessage item={message} disablefunction={true} />
            {renderChatInput}
         </View>
      </SlideInView>
   );
}

export default EditMessage;
