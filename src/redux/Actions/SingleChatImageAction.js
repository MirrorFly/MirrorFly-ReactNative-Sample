import {
  RESET_SINGLE_CHAT_SELECTED_MEDIA_IMAGE,
  UPDATE_SINGLE_CHAT_SELECTED_MEDIA_IMAGE,
} from './Constants';

export const singleChatSelectedMediaImage = data => {
  return {
    type: UPDATE_SINGLE_CHAT_SELECTED_MEDIA_IMAGE,
    payload: data,
  };
};

export const resetSingleChatSelectedMediaImage = () => {
  return {
    type: RESET_SINGLE_CHAT_SELECTED_MEDIA_IMAGE,
  };
};
