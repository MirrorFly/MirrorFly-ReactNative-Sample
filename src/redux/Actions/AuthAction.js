import { GET_USER_JID } from './Constants';

export const getCurrentUserJid = id => {
  return {
    type: GET_USER_JID,
    payload: id,
  };
};
