import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {
   id: null,
   data: {},
};

const notificationDataSlice = createSlice({
   name: 'notificationData',
   initialState,
   reducers: {
      setNotificationData(state, action) {
         return {
            id: Date.now(),
            data: action.payload,
         };
      },
      resetNotificationData(state) {
         return { ...initialState };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { setNotificationData, resetNotificationData } = notificationDataSlice.actions;
export default notificationDataSlice.reducer;
