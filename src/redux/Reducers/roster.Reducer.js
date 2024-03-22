import { getObjectDeepClone } from '../reduxHelper';
import SDK from '../../SDK/SDK';
import { RESET_STORE, UPDATE_ROSTER_DATA } from '../Actions/Constants';

const initialState = {
  data: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const rosterDataReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case UPDATE_ROSTER_DATA:
      const data = action.payload;
      const _updatedData = { ...state.data };
      data.forEach(d => {
        if (d.userId) {
          if (!d.colorCode) {
            d.colorCode =
              _updatedData[d.userId]?.colorCode || SDK.getRandomColorCode();
          }
          _updatedData[d.userId] = { ...d };
        }
      });
      return { data: _updatedData };
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default rosterDataReducer;
