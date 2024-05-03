import React, { createRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSelectChatMessage, selectChatMessage } from '../redux/Actions/ChatMessageAction';
import { showToast } from '../Helper';
import Clipboard from '@react-native-clipboard/clipboard';
import Store from '../redux/store';

export const isSelectingMessages = createRef(),
   selectedMediaIdRef = createRef();

selectedMediaIdRef.current = {};
isSelectingMessages.current = false;

let replyMessage = {};

export const getReplyMessageVariable = fromUserJId => replyMessage[fromUserJId] || {};

export const setReplyMessageVariable = message => (replyMessage = message);

export const removeReplyMessageVariable = fromUserJId => {
   delete replyMessage[fromUserJId];
};

export const getChatMessage = msgId => Store.getState().chatMessageData[msgId] || {};

export const useChatMessage = msgId => {
   const message = useSelector(state => state.chatMessageData[msgId] || {});
   return message;
};

export const resetMessageSelection = () => {
   isSelectingMessages.current = false;
   Store.dispatch(resetSelectChatMessage());
};

export const getSelectedMessagesArray = () => {
   const _chatMessage = Store.getState().chatMessageData;
   const selectedMessagesArray =
      Object.entries(_chatMessage)
         .filter(([_, message]) => message.isSelected === 1)
         .map(([key, value]) => ({ ...value, msgId: key })) || [];
   return selectedMessagesArray;
};

export const resetSelectedMessages = () => {
   isSelectingMessages.current = false;
   Store.dispatch(resetSelectChatMessage());
};

export const useSelectedChatMessage = () => {
   const dispatch = useDispatch();
   const _chatMessage = useSelector(state => state.chatMessageData);
   const selectedMessagesArray =
      Object.entries(_chatMessage)
         .filter(([_, message]) => message.isSelected === 1)
         .map(([key, value]) => ({ ...value, msgId: key })) || [];

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

export const copyToClipboard = selectedMsgs => () => {
   resetSelectedMessages();
   Clipboard.setString(selectedMsgs[0]?.msgBody.message || selectedMsgs[0]?.msgBody?.media?.caption);
   showToast('1 Text copied successfully to the clipboard', {
      id: 'text-copied-success-toast',
   });
};
