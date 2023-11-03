import { CALLCONNECTION_STATE_DATA } from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
  id: null,
  data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const CallConnectionStateReducer = (state = initialStateClone, action = {}) => {
  if (action.type === CALLCONNECTION_STATE_DATA) {
    return {
      id: Date.now(),
      data: action.payload,
    };
  }
  return state;
};

export default CallConnectionStateReducer;
