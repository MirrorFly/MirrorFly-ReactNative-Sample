import {
  getChatHistoryData,
  getUpdatedHistoryData,
} from '../../Helper/Chat/ChatHelper';
import {
  ADD_CHAT_CONVERSATION_HISTORY,
  UPDATE_CHAT_CONVERSATION_HISTORY,
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
    default:
      return state;
  }
};

export default conversationReducer;
