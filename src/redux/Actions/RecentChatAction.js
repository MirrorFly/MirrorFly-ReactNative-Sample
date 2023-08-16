import {
  UPDATE_RECENT_CHAT,
  ADD_RECENT_CHAT,
  UPDATE_RECENT_CHAT_MESSAGE_STATUS,
  UPDATE_ROSTER_LAST_MESSAGE,
} from './Constants';

export const updateRecentChat = data => {
  return {
    type: UPDATE_RECENT_CHAT,
    payload: data,
  };
};

export const addRecentChat = data => {
  return {
    type: ADD_RECENT_CHAT,
    payload: data,
  };
};

export const updateRecentChatMessageStatus = data => {
  return {
    type: UPDATE_RECENT_CHAT_MESSAGE_STATUS,
    payload: data,
  };
};

export const clearLastMessageinRecentChat = data => {
  return {
    type: UPDATE_ROSTER_LAST_MESSAGE,
    payload: data,
  };
};
