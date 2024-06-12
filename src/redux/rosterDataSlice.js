import { createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';
import { clearState } from './clearSlice';

const initialState = {
   data: {},
};

const rosterDataSlice = createSlice({
   name: 'rosterData',
   initialState,
   reducers: {
      resetRoasterData(state) {
         state = initialState;
      },
      setRoasterData(state, action) {
         const data = Array.isArray(action.payload) ? action.payload : [action.payload];
         const _updatedData = { ...state.data };
         data.forEach(d => {
            if (d?.userId) {
               if (!d.colorCode) {
                  d.colorCode = _updatedData[d.userId]?.colorCode || SDK.getRandomColorCode();
               }
               _updatedData[d.userId] = { ...d };
            }
         });
         state.data = _updatedData;
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { resetRoasterData, setRoasterData } = rosterDataSlice.actions;

export default rosterDataSlice.reducer;
