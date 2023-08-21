import { RESET_STORE, UPDATE_USER_PRESENCE } from '../Actions/Constants';

const initialState = {
  userPresence: {},
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USER_PRESENCE:
      return {
        ...state,
        userPresence: action.payload,
      };
    case RESET_STORE:
      return initialState
    default:
      return state;
  }
};

export default userReducer;
