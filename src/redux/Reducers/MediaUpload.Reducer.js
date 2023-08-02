import { UPDATE_MEDIA_UPLOAD_DATA } from '../Actions/Constants';

const initialState = {
  id: null,
  data: {},
};

const mediaUploadReducer = (state = initialState, action) => {
  if (action === UPDATE_MEDIA_UPLOAD_DATA) {
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
  } else {
    return state;
  }
};

export default mediaUploadReducer;
