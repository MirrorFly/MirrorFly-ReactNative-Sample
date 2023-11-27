import {
  getChatHistoryData,
  getUpdatedHistoryData,
  getUpdatedHistoryDataUpload,
  updateDeletedMessageInHistory,
  updateMediaUploadStatusHistory,
} from '../../Helper/Chat/ChatHelper';
import {
  ADD_CHAT_CONVERSATION_HISTORY,
  CANCEL_MEDIA_DOWNLOAD,
  CANCEL_MEDIA_UPLOAD,
  CLEAR_CHAT_HISTORY,
  DELETE_CHAT_HISTORY,
  DELETE_CONVERSATION,
  DELETE_MESSAGE_FOR_EVERYONE,
  DELETE_MESSAGE_FOR_ME,
  RESET_STORE,
  RETRY_MEDIA_UPLOAD,
  UPDATE_CHAT_CONVERSATION_HISTORY,
  UPDATE_UPLOAD_STATUS,
} from '../Actions/Constants';
import { StateToObj, getObjectDeepClone } from '../reduxHelper';

const initialState = {
  id: Date.now(),
  data: [],
};

const initialStateClone = getObjectDeepClone(initialState);

const deleteChatHandle = (data, stateData) => {
  const currentData = { ...stateData };
  delete currentData[data.fromUserId];
  return currentData;
};

const conversationReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case ADD_CHAT_CONVERSATION_HISTORY:
      return {
        id: Date.now(),
        data: getChatHistoryData(action.payload, state.data),
      };
    case UPDATE_CHAT_CONVERSATION_HISTORY:
      return {
        ...state,
        id: Date.now(),
        data: getUpdatedHistoryData(action.payload, StateToObj(state.data)),
      };
    case UPDATE_UPLOAD_STATUS:
      return {
        ...state,
        id: Date.now(),
        data: getUpdatedHistoryDataUpload(
          action.payload,
          StateToObj(state.data),
        ),
      };
    case CANCEL_MEDIA_UPLOAD:
    case RETRY_MEDIA_UPLOAD:
    case CANCEL_MEDIA_DOWNLOAD:
      return {
        id: Date.now(),
        data: updateMediaUploadStatusHistory(
          action.payload,
          StateToObj(state.data),
        ),
      };
    case CLEAR_CHAT_HISTORY:
      let chatId = action.payload;
      return {
        ...state,
        id: Date.now(),
        data: {
          ...state.data,
          [chatId]: {
            messages: {},
          },
        },
      };
    case DELETE_CHAT_HISTORY:
      return {
        ...state,
        id: Date.now(),
        data: deleteChatHandle(action.payload, StateToObj(state.data)),
      };
    case DELETE_CONVERSATION:
      const _state = { ...state.data };
      if (_state[action.payload.chatId]) {
        delete _state[action.payload.chatId];
      }
      return {
        id: Date.now(),
        data: _state,
      };

    case DELETE_MESSAGE_FOR_ME:
    case DELETE_MESSAGE_FOR_EVERYONE:
      return {
        ...state,
        id: Date.now(),
        data: updateDeletedMessageInHistory(
          action.type,
          action.payload,
          state.data,
        ),
      };
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default conversationReducer;
