import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {
   id: null,
   /**
    * {
    *    callType: 'audio' | 'video',
    *    userId: '9988776655'
    * }
    */
   data: {},
};

const callAgainSlice = createSlice({
   name: 'callAgainData',
   initialState,
   reducers: {
      updateCallAgainData(state, action) {
         return {
            id: Date.now(),
            data: action.payload,
         };
      },
      resetCallAgainData() {
         return { ...initialState };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { updateCallAgainData, resetCallAgainData } = callAgainSlice.actions;
export default callAgainSlice.reducer;
