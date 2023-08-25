import { UPDATE_SEARCH__MESSAGE_DETAILS } from './Constants';

export const updateSearachMessageDetail = data => {
  return {
    type: UPDATE_SEARCH__MESSAGE_DETAILS,
    payload: data,
  };
};
