import {CLEAR_STREAM, STREAM_DATA} from './Constants';

export const setStreamData = data => {
  return {
    type: STREAM_DATA,
    payload: data,
  };
};
export const clearStreamData = data => {
  return {
    type: CLEAR_STREAM,
  };
};
