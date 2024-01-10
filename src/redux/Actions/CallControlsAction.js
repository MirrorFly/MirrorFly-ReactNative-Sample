import {
   RESET_CALL_CONTROLS_DATA,
   UPDATE_CALL_AUDIO_MUTED,
   UPDATE_CALL_SPEAKER_ENABLED,
   UPDATE_CALL_VIDEO_MUTED,
   UPDATE_CALL_WIRED_HEADSET_CONNECTED,
} from './Constants';

export const updateCallAudioMutedAction = data => {
   return {
      type: UPDATE_CALL_AUDIO_MUTED,
      payload: data,
   };
};

export const updateCallVideoMutedAction = data => {
   return {
      type: UPDATE_CALL_VIDEO_MUTED,
      payload: data,
   };
};

export const updateCallSpeakerEnabledAction = data => {
   return {
      type: UPDATE_CALL_SPEAKER_ENABLED,
      payload: data,
   };
};

export const updateCallWiredHeadsetConnected = data => {
   return {
      type: UPDATE_CALL_WIRED_HEADSET_CONNECTED,
      payload: data,
   };
};

export const resetCallControlsStateAction = () => {
   return {
      type: RESET_CALL_CONTROLS_DATA,
   };
};
