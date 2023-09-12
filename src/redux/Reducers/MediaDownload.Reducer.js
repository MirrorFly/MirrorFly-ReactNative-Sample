import { RESET_STORE, UPDATE_MEDIA_DOWNLOAD_DATA } from '../Actions/Constants';

const initialState = {
  id: null,
  data: {},
};

const mediaDownloadReducer = (state = initialState, action) => {
  if (action.type === UPDATE_MEDIA_DOWNLOAD_DATA) {
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
    return initialState;
  } else {
    return state;
  }
};

export default mediaDownloadReducer;
