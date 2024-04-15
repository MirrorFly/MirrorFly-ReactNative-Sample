import {
   ADD_CHAT_CONVERSATION_MESSAGE,
   RESET_SELECT_CHAT_CONVERSATION_MESSAGE,
   TOGGLE_SELECT_CHAT_CONVERSATION_MESSAGE,
   UPDATE_CHAT_CONVERSATION_MESSAGE,
} from './Constants';

export const addChatMessage = data => {
   console.log('addChatMessage data ==>', JSON.stringify(data, null, 2));
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
