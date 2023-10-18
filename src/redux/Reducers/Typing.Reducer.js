import {
  RESET_STORE,
  TYPING_STATUS,
  TYPING_STATUS_REMOVE,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

/**
 * @example Example reducer data
 * {
 *    id: 123,
 *    data: {
 *      '919988776655@xmpp-contus.in': true,
 *      '919080706050@xmpp-contus.in': true,
 *    }
 * }
 */
const initialState = {
  id: 0,
  data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const TypingReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case TYPING_STATUS:
      const _updatedTypingData = { ...state.data };
      if (action.payload) {
        _updatedTypingData[action.payload] = true;
      }
      return {
        id: Date.now(),
        data: _updatedTypingData,
      };
    case TYPING_STATUS_REMOVE:
      const _updatedTypingGoneData = { ...state.data };
      if (action.payload) {
        delete _updatedTypingGoneData[action.payload];
      }
      return {
        id: Date.now(),
        data: _updatedTypingGoneData,
      };
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default TypingReducer;
