import {
  CLAER_CONVERSATION_SEARCH_DATA,
  RESET_STORE,
  SET_CONVERSATION_SEARCH_TEXT,
  UPDATE_CONVERSATION_SEARCH_MESSAGE_INDEX,
  UPDATE_CONVERSATION_TOTAL_SEARCH_RESULTS,
} from '../Actions/Constants';

const initialState = {
  searchText: '',
  messageIndex: -1,
  totalSearchResults: 0,
};

const conversationSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATION_SEARCH_TEXT:
      return {
        ...state,
        searchText: action.payload,
        messageIndex: -1,
        totalSearchResults: 0,
      };
    case UPDATE_CONVERSATION_TOTAL_SEARCH_RESULTS:
      return {
        ...state,
        totalSearchResults: action.payload,
      };
    case UPDATE_CONVERSATION_SEARCH_MESSAGE_INDEX:
      return {
        ...state,
        messageIndex: action.payload,
      };
    case CLAER_CONVERSATION_SEARCH_DATA:
      return {
        ...state,
        searchText: '',
        messageIndex: -1,
        totalSearchResults: 0,
      };
    case RESET_STORE:
      return initialState;
    default:
      return state;
  }
};

export default conversationSearchReducer;
