import { getObjectDeepClone } from '../reduxHelper';
import { CANCEL_MEDIA_UPLOAD_DATA, RESET_STORE, UPDATE_MEDIA_UPLOAD_DATA } from '../Actions/Constants';

const initialState = {
   id: null,
   data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const mediaUploadReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case UPDATE_MEDIA_UPLOAD_DATA:
         return {
            ...state,
            ...{
               id: Date.now(),
               data: {
                  ...state.data,
                  [action.payload.msgId]: action.payload,
               },
            },
         };
      case CANCEL_MEDIA_UPLOAD_DATA:
         const { msgId } = action.payload;
         const newData = { ...state.data };
         delete newData[msgId];

         return {
            ...state,
            data: newData,
            id: Date.now(),
         };
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default mediaUploadReducer;
