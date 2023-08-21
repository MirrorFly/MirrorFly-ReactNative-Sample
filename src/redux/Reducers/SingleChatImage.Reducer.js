import {
  RESET_SINGLE_CHAT_SELECTED_MEDIA_IMAGE,
  RESET_STORE,
  UPDATE_SINGLE_CHAT_SELECTED_MEDIA_IMAGE,
} from '../Actions/Constants';

const initialState = {
  id: Date.now(),
  data: {},
};

const singleChatImageReducer = (state = initialState, action) => {
  if (action.type === UPDATE_SINGLE_CHAT_SELECTED_MEDIA_IMAGE) {
    return {
      id: Date.now(),
      data: action.payload,
    };
  } else if (action.type === RESET_SINGLE_CHAT_SELECTED_MEDIA_IMAGE) {
    return initialState;
  } else if (action.type === RESET_STORE) {
    return initialState;
  } else {
    return state;
  }
};

export default singleChatImageReducer;
