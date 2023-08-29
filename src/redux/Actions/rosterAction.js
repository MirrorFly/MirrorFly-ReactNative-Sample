import { UPDATE_ROSTER_DATA } from './Constants';

export const updateRosterData = data => {
  if (!Array.isArray(data) && typeof data === 'object') {
    data = [data];
  }
  return {
    type: UPDATE_ROSTER_DATA,
    payload: data,
  };
};
