import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {
   alertModalContent: null,
};

const alertModalSlice = createSlice({
   name: 'alertModalData',
   initialState,
   reducers: {
      setModalContent(state, action) {
         state.alertModalContent = action.payload;
      },
      toggleModalContent() {
         return { ...initialState };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { setModalContent, toggleModalContent } = alertModalSlice.actions;
export default alertModalSlice.reducer;
