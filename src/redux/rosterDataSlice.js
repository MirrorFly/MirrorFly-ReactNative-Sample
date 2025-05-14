import { createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';
import { clearState } from './clearSlice';
import { getUserIdFromJid } from '../helpers/chatHelpers';

const initialState = {
   data: {},
};

const rosterDataSlice = createSlice({
   name: 'rosterData',
   initialState,
   reducers: {
      resetRoasterData() {
         return { ...initialState };
      },
      setRoasterData(state, action) {
         const data = Array.isArray(action.payload) ? action.payload : [action.payload];
         const _updatedData = { ...state.data };
         data.forEach(d => {
            if (d?.userId) {
               if (!d.colorCode) {
                  d.colorCode = _updatedData[d.userId]?.colorCode || SDK.getRandomColorCode();
               }
               _updatedData[d.userId] = { ..._updatedData[d.userId], ...d };
            }
         });
         state.data = _updatedData;
      },
      updateBlockUser(state, action) {
         const { userId, isBlocked } = action.payload;
         if (state.data[userId]) {
            state.data[userId] = { ...state.data[userId], isBlocked };
         }
      },
      updateIsBlockedMe(state, action) {
         const { userId, isBlockedMe } = action.payload;
         if (state.data[userId]) {
            state.data[userId] = { ...state.data[userId], isBlockedMe };
         }
      },
      toggleMute(state, action) {
         const { userJids, muteStatus } = action.payload;

         const updatedData = { ...state.data };
         userJids.forEach(jid => {
            const normalizedJid = getUserIdFromJid(jid);

            if (updatedData[normalizedJid]) {
               updatedData[normalizedJid] = {
                  ...updatedData[normalizedJid],
                  muteStatus: muteStatus ? 1 : 0,
               };
            }
         });
         state.data = updatedData;
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const { resetRoasterData, setRoasterData, updateBlockUser, updateIsBlockedMe, toggleMute } = rosterDataSlice.actions;

export default rosterDataSlice.reducer;
