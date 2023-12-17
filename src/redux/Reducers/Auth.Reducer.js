import { getObjectDeepClone } from '../reduxHelper';
import { NOTCONNECTED } from '../../constant';
import { GET_USER_JID, RESET_STORE } from '../Actions/Constants';

const initialState = {
  userData: {},
  currentUserJID: '',
  status: 'idle',
  isConnected: NOTCONNECTED,
  error: null,
};

const initialStateClone = getObjectDeepClone(initialState);

const authReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case GET_USER_JID:
      return {
        ...state,
        currentUserJID: action.payload,
      };
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default authReducer;
