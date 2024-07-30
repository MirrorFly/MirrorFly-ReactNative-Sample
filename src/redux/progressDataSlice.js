import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';


const initialState = {};

const progressDataSlice = createSlice({
   name: 'progressData',
   initialState,
   reducers: {
      resetProgressData() {
         return initialState;
      },
      setProgress(state, action) {
         const { msgId } = action.payload;
         state[msgId] = action.payload;
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
