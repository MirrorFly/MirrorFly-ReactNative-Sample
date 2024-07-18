import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {
   id: null,
   data: {},
};

const showConfrenceSlice = createSlice({
   name: 'showConfrenceSData',
   initialState,
   reducers: {
      showConfrence(state, action) {
         return {
            id: Date.now(),
            data: action.payload,
         };
      },
      updateConference(state, action) {
         return {
            id: Date.now(),
            data: {
               ...state.data,
               ...action.payload,
            },
         };
      },
      resetConferencePopup() {
         return { ...initialState };
      },
      extraReducers: builder => {
         builder.addCase(clearState, () => initialState);
      },
   },
});

export const { showConfrence, updateConference, resetConferencePopup } = showConfrenceSlice.actions;

export default showConfrenceSlice.reducer;
