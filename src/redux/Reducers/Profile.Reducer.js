import { getObjectDeepClone } from '../reduxHelper';
import { RESET_STORE, SET_PROFILE_DETAILS, UPDATE_PROFILE_DETAILS } from '../Actions/Constants';

const initialState = {
   profileInfoList: '',
   profileDetails: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const profileReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case SET_PROFILE_DETAILS:
         return {
            ...state,
            profileDetails: action.payload,
         };
      case UPDATE_PROFILE_DETAILS:
         if (action.payload.userId === state.profileDetails.userId && action.payload !== state.profileDetails) {
            return {
               ...state,
               profileDetails: action.payload,
            };
         }
         return state;
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default profileReducer;
