import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

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

const callControlsSlice = createSlice({
   name: 'callControlsData',
   initialState,
   reducers: {
      updateCallAudioMutedAction(state, action) {
         return {
            id: Date.now(),
            ...state,
            isAudioMuted: action.payload,
         };
      },
      updateCallVideoMutedAction(state, action) {
         return {
            id: Date.now(),
            ...state,
            isVideoMuted: action.payload,
         };
      },
      updateCallSpeakerEnabledAction(state, action) {
         return {
            id: Date.now(),
            ...state,
            isSpeakerEnabled: action.payload,
         };
      },
      updateCallWiredHeadsetConnected(state, action) {
         return {
            id: Date.now(),
            ...state,
            isWiredHeadsetConnected: action.payload,
         };
      },
      updateSwitchCamera(state, action) {
         return {
            id: Date.now(),
            ...state,
            isFrontCameraEnabled: action.payload,
         };
      },
      updateCallBluetoothHeadsetConnected(state, action) {
         return {
            id: Date.now(),
            ...state,
            isBluetoothHeadsetConnected: action.payload,
         };
      },
      updateCallSelectedAudioRoute(state, action) {
         return {
            id: Date.now(),
            ...state,
            selectedAudioRoute: action.payload,
         };
      },
      updateCurrentDeviceAudioState(state, action) {
         return {
            id: Date.now(),
            ...state,
            currentDeviceAudioRouteState: action.payload,
         };
      },
      resetCallControlsStateAction(state, action) {
         return { ...initialState };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const {
   updateCallAudioMutedAction,
   updateCallVideoMutedAction,
   updateCallSpeakerEnabledAction,
   updateCallWiredHeadsetConnected,
   updateSwitchCamera,
   updateCallBluetoothHeadsetConnected,
   updateCallSelectedAudioRoute,
   updateCurrentDeviceAudioState,
   resetCallControlsStateAction,
} = callControlsSlice.actions;
export default callControlsSlice.reducer;
