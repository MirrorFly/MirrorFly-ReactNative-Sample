import { LARGE_VIDEO_USER } from '../../Helper/Calls/Constant';
import {
   CALLCONNECTION_STATE_DATA,
   CALL_DURATION_TIMESTAMP,
   CLEAR_CALL_DATA,
   CLOSE_CALL_MODAL,
   OPEN_CALL_MODAL,
   PIN_USER,
   RESET_CALL_DATA,
   RESET_STORE,
   SET_CALL_MODAL_SCREEN,
   UPDATE_CALLER_UUID,
   UPDATE_CALL_LAYOUT,
   UPDATE_IS_CALL_FROM_VOIP,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const defaultCallLayout = 'tile';

const initialState = {
   id: null,
   showCallModal: false,
   screenName: '',
   connectionState: {},
   callDuration: 0,

   /* // Example data for largeVideoUser property
   largeVideoUser: {
      userJid: largeUserJid,
      volumeLevelsBasedOnUserJid: { '919988776655@xmpp.contus.us': 10 },
      showVoiceDetect: true | false,
      volumeLevelVideo: 0,
   }, */
   largeVideoUser: {},
   // largeVideoUser: {
   //    userJid: '919094237501@xmpp-uikit-qa.contus.us',
   //    volumeLevelsBasedOnUserJid: { '919094237501@xmpp-uikit-qa.contus.us': 10 },
   //    showVoiceDetect: false,
   //    volumeLevelVideo: 0,
   // },
   /* // Example data for pinUserData property
   pinUserData: {
      userJid: '919988776655@xmpp.contus.us' | null,
   }, */
   pinUserData: {},
   callerUUID: '',
   // selected Call Layout ('grid'|'tile'), by default it is 'tile'
   callLayout: defaultCallLayout,
   isCallFromVoip: false,
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
      case SET_CALL_MODAL_SCREEN:
         return {
            ...state,
            id: Date.now(),
            screenName: action.payload,
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
         };
      case UPDATE_CALLER_UUID:
         return {
            ...state,
            id: Date.now(),
            callerUUID: String(action.payload).toUpperCase(),
         };
      case CALL_DURATION_TIMESTAMP:
         return {
            ...state,
            id: Date.now(),
            callDuration: action.payload,
         };
      case CLEAR_CALL_DATA:
         return {
            ...state,
            id: Date.now(),
            connectionState: {},
            callerUUID: '',
            callLayout: defaultCallLayout,
            isCallFromVoip: false,
         };
      case UPDATE_CALL_LAYOUT:
         return {
            ...state,
            id: Date.now(),
            callLayout: action.payload,
         };
      case UPDATE_IS_CALL_FROM_VOIP:
         return {
            ...state,
            id: Date.now(),
            isCallFromVoip: action.payload,
         };
      case RESET_CALL_DATA:
      case RESET_STORE:
         return getObjectDeepClone(initialState);
   }
   return state;
};

export default CallStateReducer;
