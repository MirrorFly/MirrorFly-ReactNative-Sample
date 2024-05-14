import {
   ADD_CHAT_CONVERSATION_MESSAGE,
   MESSAGE_HIGHLIGHT,
   RESET_CHAT_MESSAGES,
   RESET_SELECT_CHAT_CONVERSATION_MESSAGE,
   TOGGLE_SELECT_CHAT_CONVERSATION_MESSAGE,
   UPDATE_CHAT_CONVERSATION_MESSAGE,
   UPDATE_MESSAGE_BODY_OBJECT,
   UPDATE_SENT_SEEN_STATUS,
} from './Constants';

export const addChatMessage = data => {
   return {
      type: ADD_CHAT_CONVERSATION_MESSAGE,
      payload: data,
   };
};

export const updateChatMessage = data => {
   return {
      type: UPDATE_CHAT_CONVERSATION_MESSAGE,
      payload: data,
   };
};

export const selectChatMessage = data => {
   return {
      type: TOGGLE_SELECT_CHAT_CONVERSATION_MESSAGE,
      payload: data,
   };
};

export const resetSelectChatMessage = data => {
   return {
      type: RESET_SELECT_CHAT_CONVERSATION_MESSAGE,
      payload: data,
   };
};

export const updateSentSeenStatus = data => {
   return {
      type: UPDATE_SENT_SEEN_STATUS,
      payload: data,
   };
};

export const highlightMessage = data => {
   return {
      type: MESSAGE_HIGHLIGHT,
      payload: data,
   };
};

export const updateChatMessageBodyObject = data => {
   return {
      type: UPDATE_MESSAGE_BODY_OBJECT,
      payload: data,
   };
};

export const resetChatMessageObject = () => {
   return {
      type: RESET_CHAT_MESSAGES,
   };
};
