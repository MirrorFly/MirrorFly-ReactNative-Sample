import { getObjectDeepClone } from '../../Helper';
import { RESET_STORE, SET_XMPP_CONNECTION_STATUS } from '../Actions/Constants';

const initialState = {
  id: '',
  xmppStatus: '',
};

const initialStateClone = getObjectDeepClone(initialState);

const connectionReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case SET_XMPP_CONNECTION_STATUS:
      return {
        id: Date.now(),
        xmppStatus: action.payload,
      };
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default connectionReducer;
