import {CLEAR_STATUS, STATUS_DATA} from '../Actions/Constants';

const initialState = {
  id: Date.now(),
  data: {
    status: '',
  },
};

const stateReducer = (state = initialState, action) => {
  switch (action.type) {
    case STATUS_DATA:
      return {
        ...state,
        id: Date.now(),
        data: {
          status: action.payload.callType,
        },
      };
    case CLEAR_STATUS:
      return initialState;
    default:
      return state;
  }
};

export default stateReducer;
