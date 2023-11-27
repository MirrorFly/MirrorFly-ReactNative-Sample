import {
  CLAER_CONVERSATION_SEARCH_DATA,
  UPDATE_CONVERSATION_TOTAL_SEARCH_RESULTS,
  UPDATE_CONVERSATION_SEARCH_MESSAGE_INDEX,
  SET_CONVERSATION_SEARCH_TEXT,
} from './Constants';

export const setConversationSearchText = data => {
  return {
    type: SET_CONVERSATION_SEARCH_TEXT,
    payload: data,
  };
};

export const updateConversationTotalSearchResults = data => {
  return {
    type: UPDATE_CONVERSATION_TOTAL_SEARCH_RESULTS,
    payload: data,
  };
};

export const updateConversationSearchMessageIndex = data => {
  return {
    type: UPDATE_CONVERSATION_SEARCH_MESSAGE_INDEX,
    payload: data,
  };
};

export const clearConversationSearchData = () => {
  return {
    type: CLAER_CONVERSATION_SEARCH_DATA,
  };
};
