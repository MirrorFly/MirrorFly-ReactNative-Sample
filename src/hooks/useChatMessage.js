import React, { createRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSelectChatMessage, selectChatMessage } from '../redux/Actions/ChatMessageAction';

export const useChatMessage = msgId => {
   const chatMessage = useSelector(state => state.chatMessageData[msgId]);
   return chatMessage || {};
};

export const isSelectingMessages = createRef();

isSelectingMessages.current = false;

export const useSelectedChatMessage = () => {
   const dispatch = useDispatch();
   const _chatMessage = useSelector(state => state.chatMessageData);
   const selectedMessagesArray = Object.entries(_chatMessage)
      .filter(([_, message]) => message.isSelected === 1)
      .map(([key, value]) => ({ ...value, msgId: key }));

   React.useEffect(() => {
      isSelectingMessages.current = Boolean(selectedMessagesArray.length);
   }, [_chatMessage]);

   const updateSelectedMessage = msgId => {
      dispatch(selectChatMessage(msgId));
   };

   const resetSelectedChatMessage = () => {
      isSelectingMessages.current = false;
      dispatch(resetSelectChatMessage());
   };

   return { selectedMessagesArray, updateSelectedMessage, resetSelectedChatMessage };
};
