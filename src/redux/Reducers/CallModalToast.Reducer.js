import { RESET_CALL_MODAL_TOAST_DATA, RESET_STORE, SHOW_CALL_MODAL_TOAST } from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const defaultToastDuration = 2500

const initialState = {
   id: null,
   toastMessage: '',
   toastDuration: defaultToastDuration,
};

const initialStateClone = getObjectDeepClone(initialState);

const callModalToastReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case SHOW_CALL_MODAL_TOAST:
         return {
            id: Date.now(),
            toastMessage: action.payload.message,
            toastDuration: action.payload.duration || defaultToastDuration,
         }
      case RESET_CALL_MODAL_TOAST_DATA:
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default callModalToastReducer;
