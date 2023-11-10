import {
   CONFRENCE_POPUP_STATUS,
   RESET_CONFRENCE_POPUP_STATUS,
   RESET_STORE,
   UPDATE_CONFRENCE_POPUP_STATUS,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
   id: null,
   data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const showConfrenceReducer = (state = initialStateClone, action = {}) => {
   switch (action.type) {
      case CONFRENCE_POPUP_STATUS:
         return {
            id: Date.now(),
            data: action.payload,
         };
      case UPDATE_CONFRENCE_POPUP_STATUS:
         return {
            id: Date.now(),
            data: {
               ...state.data,
               ...action.payload,
            },
         };
      case RESET_STORE:
      case RESET_CONFRENCE_POPUP_STATUS:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default showConfrenceReducer;
