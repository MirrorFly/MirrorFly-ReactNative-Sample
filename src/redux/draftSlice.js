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
      setAudioRecording(state, action) {
         const { userId, message } = action.payload;
         if (state.data[userId]) {
            state.data[userId] = { ...state.data[userId], audioRecord: message };
         } else {
            state.data[userId] = { audioRecord: message };
         }
      },
      setAudioRecordTime(state, action) {
         const { userId, time } = action.payload;
         if (state.data[userId]) {
            state.data[userId] = { ...state.data[userId], audioRecordTime: time };
         } else {
            state.data[userId] = { audioRecordTime: time };
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

export const { setReplyMessage, setTextMessage, resetDaftData, setAudioRecording, setAudioRecordTime } =
   draftSlice.actions;
export default draftSlice.reducer;
