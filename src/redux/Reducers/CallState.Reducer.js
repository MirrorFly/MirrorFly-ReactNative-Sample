import { CALLCONNECTION_STATE_DATA, CLOSE_CALL_MODAL } from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
  id: null,
  showCallModal: false,
  connectionState: {},
  callDuration: 0,
};

const initialStateClone = getObjectDeepClone(initialState);

const CallStateReducer = (state = initialStateClone, action = {}) => {
  switch (action.type) {
    case CALLCONNECTION_STATE_DATA:
      return {
        ...state,
        id: Date.now(),
        connectionState: action.payload,
        showCallModal: true,
      };
    case CLOSE_CALL_MODAL:
      return {
        ...state,
        showCallModal: false,
      }
  }
  return state;
};

export default CallStateReducer;
