import {
  ADD_CHAT_CONVERSATION_HISTORY,
  UPDATE_CHAT_CONVERSATION_HISTORY,
} from './Constants';

export const addChatConversationHistory = data => {
  return {
    type: ADD_CHAT_CONVERSATION_HISTORY,
    payload: data,
  };
};

export const updateChatConversationHistory = data => {
  return {
    type: UPDATE_CHAT_CONVERSATION_HISTORY,
    payload: data,
  };
};
