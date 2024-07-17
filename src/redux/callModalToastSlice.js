import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const defaultToastDuration = 2500;

const initialState = {
   id: null,
   toastMessage: '',
   toastDuration: defaultToastDuration,
};

const callModalToastSlice = createSlice({
   name: 'callModalToastData',
   initialState,
   reducers: {
      showCallModalToastAction(state, action) {
         return {
            ...state,
            id: Date.now(),
            toastMessage: action.payload.message,
            toastDuration: action.payload.duration || defaultToastDuration,
         };
      },
      resetCallModalToastDataAction(state) {
         return { ...initialState };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { showCallModalToastAction, resetCallModalToastDataAction } = callModalToastSlice.actions;
export default callModalToastSlice.reducer;
