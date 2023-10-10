import {CLEAR_STATUS, STATUS_DATA} from './Constants';

export const setStatusData = data => {
  return {
    type: STATUS_DATA,
    payload: data,
  };
};
export const clearStatusData = data => {
  return {
    type: CLEAR_STATUS,
  };
};
