import { getObjectDeepClone } from '../reduxHelper';
import { RESET_STORE, UPDATE_MEDIA_UPLOAD_DATA } from '../Actions/Constants';

const initialState = {
  id: null,
  data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const mediaUploadReducer = (state = initialStateClone, action) => {
  if (action.type === UPDATE_MEDIA_UPLOAD_DATA) {
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
  } else if (action.type === RESET_STORE) {
    return getObjectDeepClone(initialState);
  } else {
    return state;
  }
};

export default mediaUploadReducer;
