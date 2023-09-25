import { CHATCONVERSATION } from '../../constant';
import { UPDATE_CHAT_CONVERSATION_LOCAL_NAV } from '../Actions/Constants';

const initialState = {
  chatConversationLocalNav: CHATCONVERSATION,
};
const chatConversationLocalNavReducer = (state = initialState, action) => {
  if (action.type === UPDATE_CHAT_CONVERSATION_LOCAL_NAV) {
    return {
      ...state,
      chatConversationLocalNav: action.payload,
    };
  } else {
    return state;
  }
};
export default chatConversationLocalNavReducer;
