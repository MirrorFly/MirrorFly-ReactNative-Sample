import { DELETE_RECOVER_MESSAGE, RECOVER_MESSAGE } from './Constants';

export const recoverMessage = data => {
  return {
    type: RECOVER_MESSAGE,
    payload: data,
  };
};

export const deleteRecoverMessage = data => {
  return {
    type: DELETE_RECOVER_MESSAGE,
    payload: data,
  };
};
