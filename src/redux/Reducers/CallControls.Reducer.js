import {
   RESET_CALL_CONTROLS_DATA,
   RESET_STORE,
   UPDATE_CALL_AUDIO_MUTED,
   UPDATE_CALL_SPEAKER_ENABLED,
   UPDATE_CALL_VIDEO_MUTED,
} from '../Actions/Constants';
import { getObjectDeepClone } from '../reduxHelper';

const initialState = {
   id: null,
   isAudioMuted: false,
   isVideoMuted: true,
   isSpeakerEnabled: false,
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
      case RESET_CALL_CONTROLS_DATA:
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default callControlsReducer;
