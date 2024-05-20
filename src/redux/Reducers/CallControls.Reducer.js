import {
   RESET_CALL_CONTROLS_DATA,
   RESET_STORE,
   UPDATE_CALL_AUDIO_MUTED,
   UPDATE_CALL_BLUETOOTH_HEADSET_CONNECTED,
   UPDATE_CALL_SELECTED_AUDIO_ROUTE,
   UPDATE_CALL_SPEAKER_ENABLED,
   UPDATE_CALL_VIDEO_MUTED,
   UPDATE_CALL_WIRED_HEADSET_CONNECTED,
   UPDATE_DEVICE_AUDIO_ROUTE_STATE,
   UPDATE_SWITCH_CAMERA,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
   id: null,
   isAudioMuted: false,
   isVideoMuted: true,
   isSpeakerEnabled: false,
   isWiredHeadsetConnected: false,
   isFrontCameraEnabled: true,
   isBluetoothHeadsetConnected: false,
   selectedAudioRoute: '', // '' (earpiece) | 'Speaker' | 'Headset' | 'Bluetooth'
   currentDeviceAudioRouteState: {},
};

const initialStateClone = getObjectDeepClone(initialState);

const callControlsReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case UPDATE_CALL_AUDIO_MUTED:
         return {
            id: Date.now(),
            ...state,
            isAudioMuted: action.payload,
         };
      case UPDATE_CALL_VIDEO_MUTED:
         return {
            id: Date.now(),
            ...state,
            isVideoMuted: action.payload,
         };
      case UPDATE_CALL_SPEAKER_ENABLED:
         return {
            id: Date.now(),
            ...state,
            isSpeakerEnabled: action.payload,
         };
      case UPDATE_CALL_WIRED_HEADSET_CONNECTED:
         return {
            id: Date.now(),
            ...state,
            isWiredHeadsetConnected: action.payload,
         };
      case UPDATE_SWITCH_CAMERA:
         return {
            id: Date.now(),
            ...state,
            isFrontCameraEnabled: action.payload,
         };
      case UPDATE_CALL_BLUETOOTH_HEADSET_CONNECTED:
         return {
            id: Date.now(),
            ...state,
            isBluetoothHeadsetConnected: action.payload,
         };
      case UPDATE_CALL_SELECTED_AUDIO_ROUTE:
         return {
            id: Date.now(),
            ...state,
            selectedAudioRoute: action.payload,
         };
      case UPDATE_DEVICE_AUDIO_ROUTE_STATE:
         return {
            id: Date.now(),
            ...state,
            currentDeviceAudioRouteState: action.payload,
         };
      case RESET_CALL_CONTROLS_DATA:
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default callControlsReducer;
