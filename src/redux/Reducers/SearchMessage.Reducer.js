import {
  CLAER_CONVERSATION_SEARCH_TEXT,
  RESET_STORE,
  SET_CONVERSATION_SEARCH_TEXT,
} from '../Actions/Constants';

const initialState = {
  searchMessageText: '',
};

const searchMessageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONVERSATION_SEARCH_TEXT:
      return {
        ...state,
        searchMessageText: action.payload,
      };
    case CLAER_CONVERSATION_SEARCH_TEXT:
      return {
        ...state,
        searchMessageText: '',
      };
    case RESET_STORE:
      return initialState;
    default:
      return state;
  }
};

export default searchMessageReducer;
