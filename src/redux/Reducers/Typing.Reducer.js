import {
  RESET_STORE,
  RESET_TYPING_STATUS_DATA,
  TYPING_STATUS,
  TYPING_STATUS_REMOVE,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';


const initialState = {
  id: 0,
  data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const TypingReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case TYPING_STATUS:
      const _updatedTypingData = { ...state.data };
      if (action.payload && !_updatedTypingData[action.payload]) {
        _updatedTypingData[action.payload] = true;
        return {
          id: Date.now(),
          data: _updatedTypingData,
        };
      } else {
        return state;
      }
    case TYPING_STATUS_REMOVE:
      const _updatedTypingGoneData = { ...state.data };
      if (action.payload) {
        delete _updatedTypingGoneData[action.payload];
      }
      return {
        id: Date.now(),
        data: _updatedTypingGoneData,
      };
    case RESET_TYPING_STATUS_DATA:
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default TypingReducer;
