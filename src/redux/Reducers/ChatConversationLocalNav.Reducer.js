import { getObjectDeepClone } from '../reduxHelper';
import { CHATCONVERSATION } from '../../constant';
import {
  RESET_STORE,
  UPDATE_CHAT_CONVERSATION_LOCAL_NAV,
} from '../Actions/Constants';

const initialState = {
  chatConversationLocalNav: CHATCONVERSATION,
};

const initialStateClone = getObjectDeepClone(initialState);

const chatConversationLocalNavReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case UPDATE_CHAT_CONVERSATION_LOCAL_NAV:
      return {
        ...state,
        chatConversationLocalNav: action.payload,
      };
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};
export default chatConversationLocalNavReducer;
