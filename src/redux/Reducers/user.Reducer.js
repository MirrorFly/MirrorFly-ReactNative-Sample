import { getObjectDeepClone } from '../reduxHelper';
import { RESET_STORE, UPDATE_USER_PRESENCE } from '../Actions/Constants';

const initialState = {
  userPresence: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const userReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case UPDATE_USER_PRESENCE:
      return {
        ...state,
        userPresence: action.payload,
      };
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default userReducer;
