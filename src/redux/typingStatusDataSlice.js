import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';
const initialState = {};
const typingStatusDataSlice = createSlice({
   name: 'presenceData',
   initialState,
   reducers: {
      resetTypingStatusData() {
         return { ...initialState };
      },
      setTypingStatus(state, action) {
         const { fromUserId, groupId } = action.payload;
         if (groupId) {
            state[groupId] = action.payload;
         } else {
            state[fromUserId] = action.payload;
         }
      },
      resetTypingStatus(state, action) {
         const { fromUserId, groupId } = action.payload;

         if (groupId) {
            delete state[groupId];
         } else {
            delete state[fromUserId];
         }
      },
      extraReducers: builder => {
         builder.addCase(clearState, () => initialState);
      },
   },
});

export const { resetTypingStatusData, setTypingStatus, resetTypingStatus } = typingStatusDataSlice.actions;

export default typingStatusDataSlice.reducer;
