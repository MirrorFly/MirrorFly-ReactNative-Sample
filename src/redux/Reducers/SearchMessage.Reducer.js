import {
  RESET_STORE,
  UPDATE_SEARCH__MESSAGE_DETAILS,
} from '../Actions/Constants';

const initialState = {
  searchMessageText: '',
};

const searchMessageReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SEARCH__MESSAGE_DETAILS:
      return {
        ...state,
        searchMessageText: action.payload,
      };

    case RESET_STORE:
      return initialState;
    default:
      return state;
  }
};

export default searchMessageReducer;
