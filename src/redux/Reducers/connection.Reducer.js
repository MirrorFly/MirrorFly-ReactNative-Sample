import { SET_XMPP_CONNECTION_STATUS } from '../Actions/Constants';

const initialState = {
  id: '',
  xmppStatus: '',
};

const connectionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_XMPP_CONNECTION_STATUS:
      return {
        id: Date.now(),
        xmppStatus: action.payload,
      };
    default:
      return state;
  }
};

export default connectionReducer;
