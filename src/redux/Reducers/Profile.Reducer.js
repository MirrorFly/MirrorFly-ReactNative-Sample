import {
  SET_PROFILE_DETAILS,
  UPDATE_PROFILE_DETAILS,
} from '../Actions/Constants';

const initialState = {
  profileInfoList: '',
  profileDetails: {},
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PROFILE_DETAILS:
      return {
        ...state,
        profileDetails: action.payload,
      };
    case UPDATE_PROFILE_DETAILS:
      if (
        action.payload.userId == state.profileDetails.userId &&
        action.payload !== state.profileDetails
      ) {
        return {
          ...state,
          profileDetails: action.payload,
        };
      }
      return state;
    default:
      return state;
  }
};

export default profileReducer;
