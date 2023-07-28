import { SET_PROFILE_DETAILS, UPDATE_PROFILE_DETAILS } from './Constants';

export const profileDetail = data => {
  return {
    type: SET_PROFILE_DETAILS,
    payload: data,
  };
};

export const updateProfileDetail = data => {
  return {
    type: UPDATE_PROFILE_DETAILS,
    payload: data,
  };
};
