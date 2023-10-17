import { getObjectDeepClone } from '../../Helper';
import SDK from '../../SDK/SDK';
import { RESET_STORE, UPDATE_ROSTER_DATA } from '../Actions/Constants';

/**
 * @example
 * {
 *	data: {
 *		'919080706050': {
 *			nickName: "John Doe",
 *			image: "91908070605016901014578071nNll3A4z5qfBiOI89Po.jpg",
 *			status: "I am in Mirrorfly",
 *			colorCode: "",
 *			email: "johndoe@gmail.com",
 *			userId: "919080706050",
 *			userJid: "919080706050@xmpp-uikit-qa.contus.us"
 *			mobileNumber: "",
 *      isAdminBlocked: 0
 *		}
 *	}
 * }
 */
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
