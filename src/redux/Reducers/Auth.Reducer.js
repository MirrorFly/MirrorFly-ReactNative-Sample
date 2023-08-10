import { NOTCONNECTED } from '../../constant';
import { GET_USER_JID, RESET_STORE } from '../Actions/Constants';

const initialState = {
  userData: {},
  currentUserJID: '',
  status: 'idle',
  isConnected: NOTCONNECTED,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_JID:
      return {
        ...state,
        currentUserJID: action.payload,
      };
    case RESET_STORE:
       return initialState
    default:
      return state;
  }
};

export default authReducer;
