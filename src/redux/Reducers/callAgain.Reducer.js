import { RESET_STORE, UPDTAE_CALL_AGAIN_DATA } from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
   id: null,
   /**
    * {
    *    callType: 'audio' | 'video',
    *    userId: '9988776655'
    * }
    */
   data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const callAgainReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case UPDTAE_CALL_AGAIN_DATA:
         return {
            id: Date.now(),
            data: action.payload,
         };
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default callAgainReducer;
