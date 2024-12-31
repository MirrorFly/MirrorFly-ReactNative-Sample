import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {};

const loggedInUserDataSlice = createSlice({
   name: 'loggedInUserData',
   initialState,
   reducers: {
      resetLoggedinUserData() {
         return initialState;
      },
      setUserJid: (state, action) => {
         state.currentUserJID = action.payload;
      },
      setXmppConnectionStatus: (state, action) => {
         state.xmppStatus = action.payload;
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { resetLoggedinUserData, setUserJid, setXmppConnectionStatus } = loggedInUserDataSlice.actions;

export default loggedInUserDataSlice.reducer;
