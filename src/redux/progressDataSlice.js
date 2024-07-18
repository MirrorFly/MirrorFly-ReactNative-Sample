import { clearState } from './clearSlice';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const progressDataSlice = createSlice({
   name: 'progressData',
   initialState,
   reducers: {
      resetProgressData(state) {
         state = initialState;
      },
      setProgress(state, action) {
         const { msgId } = action.payload;
         state[msgId] = JSON.parse(JSON.stringify(action.payload));
      },
      deleteProgress(state, action) {
         const { msgId } = action.payload;
         if (state[msgId]) {
            delete state[msgId];
         }
      },
      extraReducers: builder => {
         builder.addCase(clearState, () => initialState);
      },
   },
});

export const { resetProgressData, setProgress, deleteProgress } = progressDataSlice.actions;

export default progressDataSlice.reducer;
