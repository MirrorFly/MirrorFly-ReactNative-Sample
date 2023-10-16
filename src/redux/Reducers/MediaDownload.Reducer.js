import { updateMediaDownloadStatusHistory } from '../../Helper/Chat/ChatHelper';
import {
  CANCEL_MEDIA_DOWNLOAD,
  RESET_STORE,
  UPDATE_MEDIA_DOWNLOAD_DATA,
} from '../Actions/Constants';
import { StateToObj } from '../reduxHelper';

const initialState = {
  id: null,
  data: {},
};

const mediaDownloadReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_MEDIA_DOWNLOAD_DATA:
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
    case CANCEL_MEDIA_DOWNLOAD:
      return {
        id: Date.now(),
        data: updateMediaDownloadStatusHistory(
          action.payload,
          StateToObj(state.data),
        ),
      };
    case RESET_STORE:
      return initialState;
    default:
      return state;
  }
};

export default mediaDownloadReducer;
