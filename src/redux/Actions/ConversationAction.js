import {
  ADD_CHAT_CONVERSATION_HISTORY,
  CANCEL_MEDIA_UPLOAD,
  RETRY_MEDIA_UPLOAD,
  UPDATE_CHAT_CONVERSATION_HISTORY,
  UPDATE_UPLOAD_STATUS,
} from './Constants';

export const addChatConversationHistory = data => {
  return {
    type: ADD_CHAT_CONVERSATION_HISTORY,
    payload: data,
  };
};

export const updateChatConversationHistory = data => {
  return {
    type: UPDATE_CHAT_CONVERSATION_HISTORY,
    payload: data,
  };
};
export const CancelMediaUpload = data => {
  return {
    type: CANCEL_MEDIA_UPLOAD,
    payload: data,
  };
};

export const RetryMediaUpload = data => {
  return {
    type: RETRY_MEDIA_UPLOAD,
    payload: data,
  };
};

export const updateUploadStatus = data => {
  return {
    type: UPDATE_UPLOAD_STATUS,
    payload: data,
  };
};
