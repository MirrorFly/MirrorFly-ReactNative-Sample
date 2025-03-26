import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const defaultToastDuration = 2500;

const initialState = {
   id: null,
   toastMessage: '',
   toastDuration: defaultToastDuration,
};

const toastMessageSlice = createSlice({
   name: 'toastMessageData',
   initialState,
   reducers: {
      showToastMessage(state, action) {
         return {
            ...state,
            id: Date.now(),
            toastMessage: action.payload.message,
            toastDuration: action.payload.duration || defaultToastDuration,
         };
      },
      resetToastMessage(state) {
         return { ...initialState };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { showToastMessage, resetToastMessage } = toastMessageSlice.actions;
export default toastMessageSlice.reducer;
