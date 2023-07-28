import { SET_XMPP_CONNECTION_STATUS } from './Constants';

export const setXmppStatus = data => {
  return {
    type: SET_XMPP_CONNECTION_STATUS,
    payload: data,
  };
};
