import {
  getChatHistoryData,
  getUpdatedHistoryData,
  getUpdatedHistoryDataUpload,
  updateMediaUploadStatusHistory,
} from '../../Helper/Chat/ChatHelper';
import {
  ADD_CHAT_CONVERSATION_HISTORY,
  CANCEL_MEDIA_UPLOAD,
  CLEAR_CHAT_HISTORY,
  RESET_STORE,
  RETRY_MEDIA_UPLOAD,
  UPDATE_CHAT_CONVERSATION_HISTORY,
  UPDATE_UPLOAD_STATUS,
} from '../Actions/Constants';
import { StateToObj } from '../reduxHelper';

const initialState = {
  id: Date.now(),
  data: [],
};

const conversationReducer = (state = initialState, action) => {
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
        data: getUpdatedHistoryData(action.payload, StateToObj(state).data),
      };
    case UPDATE_UPLOAD_STATUS:
      return {
        ...state,
        id: Date.now(),
        data: getUpdatedHistoryDataUpload(
          action.payload,
          StateToObj(state).data,
        ),
      };
    case CANCEL_MEDIA_UPLOAD:
    case RETRY_MEDIA_UPLOAD:
      return {
        id: Date.now(),
        data: updateMediaUploadStatusHistory(
          action.payload,
          StateToObj(state).data,
        ),
      };
    case CLEAR_CHAT_HISTORY:
      console.log(action.payload, state, '3456789');
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
    case RESET_STORE:
      return initialState;
    default:
      return state;
  }
};

export default conversationReducer;
