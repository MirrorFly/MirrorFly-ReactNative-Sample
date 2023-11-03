import {
  CONFRENCE_POPUP_STATUS,
  RESET_CONFRENCE_POPUP_STATUS,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
  id: null,
  data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const showConfrenceReducer = (state = initialStateClone, action = {}) => {
  if (action.type === CONFRENCE_POPUP_STATUS) {
    return {
      id: Date.now(),
      data: action.payload,
    };
  } else if (action.type === RESET_CONFRENCE_POPUP_STATUS) {
    return getObjectDeepClone(initialState);
  }
  return state;
};

export default showConfrenceReducer;