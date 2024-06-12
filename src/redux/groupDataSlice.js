import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

const initialState = {};

const groupDataSlice = createSlice({
   name: 'groupData',
   initialState,
   reducers: {
      setMemberParticipantsList(state, action) {
         const { groupId, participantsList } = action.payload;
         state[groupId] = participantsList;
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { setMemberParticipantsList } = groupDataSlice.actions;

export default groupDataSlice.reducer;
