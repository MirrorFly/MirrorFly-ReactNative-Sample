import { RESET_CALL_AGAIN_DATA, UPDTAE_CALL_AGAIN_DATA } from './Constants';

export const updateCallAgainData = data => {
   return {
      type: UPDTAE_CALL_AGAIN_DATA,
      payload: data,
   };
};

export const resetCallAgainData = data => {
   return {
      type: RESET_CALL_AGAIN_DATA,
   };
};
