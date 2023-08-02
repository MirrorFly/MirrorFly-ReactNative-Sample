import { UPDATE_MEDIA_DOWNLOAD_DATA } from '../Actions/Constants';

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
  } else {
    return state;
  }
};

export default mediaDownloadReducer;
