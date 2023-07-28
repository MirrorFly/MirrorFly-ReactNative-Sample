import { NOTCONNECTED } from '../../constant';
import { GET_USER_JID } from '../Actions/Constants';

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
    default:
      return state;
  }
};

export default authReducer;
