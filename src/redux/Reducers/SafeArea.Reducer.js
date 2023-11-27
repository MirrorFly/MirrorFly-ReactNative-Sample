import {
  RESET_SAFE_AREA,
  UPDATE_SAFE_AREA_BG_COLOR,
} from '../Actions/Constants';

const initialState = {
  id: Date.now(),
  color: '#E5E5E5',
};

const safeAreaReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SAFE_AREA_BG_COLOR:
      return {
        ...state,
        id: Date.now(),
        color: action.payload,
      };
    case RESET_SAFE_AREA:
      return initialState;
    default:
      return state;
  }
};

export default safeAreaReducer;
