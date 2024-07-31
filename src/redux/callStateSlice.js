import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const defaultCallLayout = 'tile';

const initialState = {
   id: null,
   showCallModal: false,
   screenName: '',
   connectionState: {},
   callDuration: 0,
   callConversionData: {},
   largeVideoUser: {},
   pinUserData: {},
   callerUUID: '',
   // selected Call Layout ('grid'|'tile'), by default it is 'tile'
   callLayout: defaultCallLayout,
   isCallFromVoip: false,
};

const callStateSlice = createSlice({
   name: 'callStateData', // Name of the slice
   initialState, // Initial state
   reducers: {
      updateCallConnectionState(state, action) {
         return {
            ...state,
            id: Date.now(),
            connectionState: action.payload,
         };
      },
      openCallModal(state) {
         return {
            ...state,
            id: Date.now(),
            showCallModal: true,
         };
      },
      closeCallModal(state) {
         return {
            ...state,
            id: Date.now(),
            showCallModal: false,
         };
      },
      setCallModalScreen(state, action) {
         return {
            ...state,
            id: Date.now(),
            screenName: action.payload,
         };
      },
      setLargeVideoUser(state, action) {
         return {
            ...state,
            id: Date.now(),
            largeVideoUser: action.payload,
         };
      },
      pinUser(state, action) {
         let userJid = action.payload;
         let pinUserData = state.pinUserData || {};
         userJid = userJid && pinUserData.userJid !== userJid ? userJid : null;
         return {
            ...state,
            id: Date.now(),
            pinUserData: userJid,
         };
      },
      updateCallerUUID(state, action) {
         return {
            ...state,
            id: Date.now(),
            callerUUID: String(action.payload).toUpperCase(),
         };
      },
      callDurationTimestamp(state, action) {
         return {
            ...state,
            id: Date.now(),
            callDuration: action.payload,
         };
      },
      clearCallData(state, action) {
         return {
            ...state,
            id: Date.now(),
            connectionState: {},
            callerUUID: '',
            callLayout: defaultCallLayout,
            isCallFromVoip: false,
         };
      },
      updateCallLayout(state, action) {
         return {
            ...state,
            id: Date.now(),
            callLayout: action.payload,
         };
      },
      updateIsCallFromVoip(state, action) {
         return {
            ...state,
            id: Date.now(),
            isCallFromVoip: action.payload,
         };
      },
      callConversion(state, action) {
         return {
            ...state,
            id: Date.now(),
            callConversionData: action.payload,
         };
      },
      resetCallStateData() {
         return { ...initialState };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const {
   updateCallConnectionState,
   openCallModal,
   closeCallModal,
   setCallModalScreen,
   setLargeVideoUser,
   pinUser,
   updateCallerUUID,
   callDurationTimestamp,
   clearCallData,
   updateCallLayout,
   updateIsCallFromVoip,
   resetCallStateData,
   callConversion,
} = callStateSlice.actions;

export default callStateSlice.reducer;
