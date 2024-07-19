import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {
   id: null,
   data: {},
};

const draftSlice = createSlice({
   name: 'draftData',
   initialState,
   reducers: {
      setReplyMessage(state, action) {
         const { userId, message } = action.payload;
         if (state.data[userId]) {
            state.data[userId] = { ...state.data[userId], replyMessage: message };
         } else {
            state.data[userId] = { replyMessage: message };
         }
      },
      setTextMessage(state, action) {
         const { userId, message } = action.payload;
         if (state.data[userId]) {
            state.data[userId] = { ...state.data[userId], text: message };
         } else {
            state.data[userId] = { text: message };
         }
      },
      resetDaftData(state, action) {
         const userId = action.payload;
         delete state.data[userId];
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { setReplyMessage, setTextMessage, resetDaftData } = draftSlice.actions;
export default draftSlice.reducer;
