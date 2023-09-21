import { UPDATE_CHAT_CONVERSATION_LOCAL_NAV } from './Constants';

export const updateChatConversationLocalNav = data => {
  return {
    type: UPDATE_CHAT_CONVERSATION_LOCAL_NAV,
    payload: data,
  };
};
