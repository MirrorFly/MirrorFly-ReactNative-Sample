import { LARGE_VIDEO_USER } from '../../Helper/Calls/Constant';
import {
  CALLCONNECTION_STATE_DATA,
  CLOSE_CALL_MODAL,
  OPEN_CALL_MODAL,
  PIN_USER,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
  id: null,
  showCallModal: false,
  connectionState: {},
  callDuration: 0,
  /*
    // Example data for largeVideoUser property
    largeVideoUser: {
      userJid: largeUserJid,
      volumeLevelsBasedOnUserJid: { '919988776655@xmpp.contus.us': 10 },
      showVoiceDetect: true | false,
      volumeLevelVideo: 0
    } */
  largeVideoUser: {},
  /* 
    // Example data for pinUserData property
    pinUserData: {
      userJid: '919988776655@xmpp.contus.us' | null
    }
   */
  pinUserData: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const CallStateReducer = (state = initialStateClone, action = {}) => {
  switch (action.type) {
    case CALLCONNECTION_STATE_DATA:
      return {
        ...state,
        id: Date.now(),
        connectionState: action.payload,
      };
    case OPEN_CALL_MODAL:
      return {
        ...state,
        id: Date.now(),
        showCallModal: true,
      };
    case CLOSE_CALL_MODAL:
      return {
        ...state,
        id: Date.now(),
        showCallModal: false,
      };
    case LARGE_VIDEO_USER:
      return {
        ...state,
        id: Date.now(),
        largeVideoUser: action.payload,
      };
    case PIN_USER:
      return {
        ...state,
        id: Date.now(),
        pinUserData: action.payload,
      }
  }
  return state;
};

export default CallStateReducer;
