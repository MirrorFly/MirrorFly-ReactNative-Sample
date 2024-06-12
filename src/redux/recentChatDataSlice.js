import { createAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { ARCHIVED_SCREEN } from '../screens/constants';
import { clearState } from './clearSlice';

// Define the reset action
export const reset = createAction('reset');

const initialState = {
   recentChats: [],
   searchText: '',
   archivedChats: [],
};

const recentChatDataSlice = createSlice({
   name: 'recentChatData',
   initialState,
   reducers: {
      setRecentChats(state, action) {
         state.recentChats = [...state.recentChats, ...action.payload];
      },
      addRecentChatItem(state, action) {
         const { userJid, newIndex = 0 } = action.payload;
         const index = state.recentChats.findIndex(item => item?.userJid === userJid);
         if (index !== -1) {
            // If the item is found, update its position and data
            const newData = [...state.recentChats];
            newData[index] = { ...newData[index], ...action.payload } || {};
            const [movedItem] = newData.splice(index, 1);
            newData.splice(newIndex, 0, movedItem);
            state.recentChats = newData;
         } else if (action.payload) {
            // If the item is not found, add the new message at the top
            state.recentChats = [action.payload, ...state.recentChats];
         }
      },
      toggleChatSelection(state, action) {
         const userId = action.payload;
         const index = state.recentChats.findIndex(item => item.userId === userId);
         if (index !== -1) {
            // Toggle the isSelected property
            state.recentChats[index].isSelected = state.recentChats[index].isSelected ? 0 : 1;
         }
      },
      resetChatSelections(state, action) {
         const component = action.payload;
         if (component === ARCHIVED_SCREEN) {
            state.recentChats = state.recentChats.map(item =>
               item.isSelected === 1 && item.archiveStatus === 1 ? { ...item, isSelected: 0 } : item,
            );
         } else {
            state.recentChats = state.recentChats.map(item =>
               item.isSelected === 1 ? { ...item, isSelected: 0 } : item,
            );
         }
      },
      updateRecentMessageStatus(state, action) {
         const { fromUserId: userId, msgStatus, msgId } = action.payload;
         const index = state.recentChats.findIndex(item => item.userId === userId && item.msgId === msgId);
         if (index !== -1) {
            state.recentChats[index].msgStatus = msgStatus;
         }
      },
      setSearchText(state, action) {
         state.searchText = action.payload;
      },
      clearRecentChatData(state, action) {
         const userJid = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid);
         state.recentChats[index].msgBody = {};
      },
      updateMsgByLastMsgId(state, action) {
         const { userJid } = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid);
         state.recentChats[index] = action.payload;
      },
      deleteMessagesForEveryoneInRecentChat(state, action) {
         const userJid = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid);
         state.recentChats[index].recallStatus = 1;
      },
      toggleArchiveChats(state, action) {},
      extraReducers: builder => {
         builder.addCase(clearState, () => initialState);
      },
   },
});

export const {
   resetRecentChat,
   setRecentChats,
   addRecentChatItem,
   toggleChatSelection,
   resetChatSelections,
   updateRecentMessageStatus,
   setSearchText,
   clearRecentChatData,
   updateMsgByLastMsgId,
   deleteMessagesForEveryoneInRecentChat,
} = recentChatDataSlice.actions;

export default recentChatDataSlice.reducer;

// Selectors
export const selectRecentChatData = state => state.recentChatData.recentChats;
export const selectSearchText = state => state.recentChatData.searchText;

export const selectFilteredRecentChatData = createSelector(
   [selectRecentChatData, selectSearchText],
   (_recentChatData, searchText) => {
      if (!searchText) {
         return _recentChatData.filter(chat => chat.archiveStatus !== 1);
      }

      return _recentChatData.filter(chat =>
         chat?.profileDetails?.nickName?.toLowerCase().includes(searchText.toLowerCase()),
      );
   },
);

export const selectArchivedChatData = createSelector([selectRecentChatData], _recentChatData => {
   return _recentChatData.filter(chat => chat.archiveStatus == 1);
});
