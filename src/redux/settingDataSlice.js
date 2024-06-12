import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {};

const settingDataSlice = createSlice({
   name: 'settingDataData',
   initialState,
   reducers: {
      toggleArchiveSetting(state, action) {
         state['archive'] = action.payload;
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { toggleArchiveSetting } = settingDataSlice.actions;
export default settingDataSlice.reducer;
