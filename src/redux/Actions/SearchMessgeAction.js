import {
  CLAER_CONVERSATION_SEARCH_TEXT,
  SET_CONVERSATION_SEARCH_TEXT,
} from './Constants';

export const setConversationSearchText = data => {
  return {
    type: SET_CONVERSATION_SEARCH_TEXT,
    payload: data,
  };
};

export const clearConversationSearchText = () => {
  return {
    type: CLAER_CONVERSATION_SEARCH_TEXT,
  };
};
