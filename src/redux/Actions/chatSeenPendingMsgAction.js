import {
  ADD_CHAT_SEEN_PENDING_MSG,
  DELETE_CHAT_SEEN_PENDING_MSG,
} from './Constants';

export const addchatSeenPendingMsg = data => {
  return {
    type: ADD_CHAT_SEEN_PENDING_MSG,
    payload: data,
  };
};

export const deleteChatSeenPendingMsg = data => {
  return {
    type: DELETE_CHAT_SEEN_PENDING_MSG,
    payload: data,
  };
};
