import { createSlice } from '@reduxjs/toolkit';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { clearState } from './clearSlice';

const initialState = {};

const presenceDataSlice = createSlice({
   name: 'presenceData',
   initialState,
   reducers: {
      resetPresenceData(state) {
         state = initialState;
      },
      setPresenceData(state, action) {
         const { fromUserJid } = action.payload;
         const userId = getUserIdFromJid(fromUserJid);
         state[userId] = action.payload;
      },
      extraReducers: builder => {
         builder.addCase(clearState, () => initialState);
      },
   },
});

export const { resetPresenceData, setPresenceData } = presenceDataSlice.actions;

export default presenceDataSlice.reducer;
