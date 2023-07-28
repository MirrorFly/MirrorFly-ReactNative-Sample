import { UPDATE_USER_PRESENCE } from './Constants';

export const updateUserPresence = data => {
  return {
    type: UPDATE_USER_PRESENCE,
    payload: data,
  };
};
