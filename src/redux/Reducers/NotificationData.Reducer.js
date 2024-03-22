import { RESET_NOTIFICATION_DATA, RESET_STORE, SET_NOTIFICATION_DATA } from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
   id: null,
   data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const notificationDataReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case SET_NOTIFICATION_DATA:
         return {
            id: Date.now(),
            data: action.payload,
         };
        case RESET_NOTIFICATION_DATA:
        case RESET_STORE:
           return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default notificationDataReducer;
