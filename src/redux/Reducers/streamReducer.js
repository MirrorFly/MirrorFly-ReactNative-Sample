import {CLEAR_STREAM, STREAM_DATA} from '../Actions/Constants';

const initialState = {
  id: Date.now(),
  data: {
    localStream: null,
    remoteStream: [],
  },
};

const streamReducer = (state = initialState, action) => {
  switch (action.type) {
    case STREAM_DATA:
      return {
        ...state,
        id: Date.now(),
        data: {
          localStream: action.payload.localStream,
          remoteStream: action.payload.remoteStream,
        },
      };
    case CLEAR_STREAM:
      return initialState;
    default:
      return state;
  }
};

export default streamReducer;
