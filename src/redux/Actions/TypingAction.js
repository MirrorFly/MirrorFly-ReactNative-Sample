import { TYPING_STATUS, TYPING_STATUS_REMOVE } from './Constants';

export const updateChatTypingStatus = data => {
  return {
    type: TYPING_STATUS,
    payload: data,
  };
};

export const updateChatTypingGoneStatus = data => {
  return {
    type: TYPING_STATUS_REMOVE,
    payload: data,
  };
};
