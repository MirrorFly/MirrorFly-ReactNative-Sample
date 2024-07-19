import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {
   id: null,
   data: {},
};

const permissionSlice = createSlice({
   name: 'permissionData',
   initialState,
   reducers: {
      showPermissionModal(state, action) {
         return {
            ...state,
            permissionStatus: true,
         };
      },
      closePermissionModal(state, action) {
         return {
            ...state,
            permissionStatus: false,
         };
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { showPermissionModal, closePermissionModal } = permissionSlice.actions;
export default permissionSlice.reducer;
