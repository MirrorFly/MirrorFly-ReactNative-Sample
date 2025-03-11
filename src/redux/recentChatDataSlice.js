import { createSelector, createSlice } from '@reduxjs/toolkit';
import { getCurrentChatUser, isLocalUser } from '../helpers/chatHelpers';
import { ARCHIVED_SCREEN } from '../screens/constants';
import { clearState } from './clearSlice';

const initialState = {
   recentChats: [],
   searchText: '',
};

const recentChatDataSlice = createSlice({
   name: 'recentChatData',
   initialState,
   reducers: {
      setRecentChats(state, action) {
         const newChats = action.payload;

         // Create a map of existing chats by userJid for quick lookup
         const existingChatsMap = state.recentChats.reduce((acc, chat) => {
            acc[chat.userJid] = chat;
            return acc;
         }, {});

         // Merge the new chats into the existing ones, prioritizing new chats
         const updatedChats = [
            ...Object.values(existingChatsMap),
            ...newChats.filter(chat => !existingChatsMap[chat.userJid]),
         ];

         // Update the state with the combined result
         state.recentChats = updatedChats;
      },
      addRecentChatItem(state, action) {
         const { userJid, newIndex = 0, archiveSetting, publisherId } = action.payload;
         const index = state.recentChats.findIndex(item => item?.userJid === userJid);

         if (index !== -1) {
            const existingChat = state.recentChats[index];
            const updatedChat = {
               ...existingChat,
               ...action.payload,
               deleteStatus: 0,
               recallStatus: 0,
               archiveStatus: archiveSetting === 0 ? archiveSetting : existingChat.archiveStatus,
            };
            if (userJid !== getCurrentChatUser() && !isLocalUser(publisherId)) {
               updatedChat.unreadCount += 1;
               updatedChat.isUnread = 1;
            }

            const newData = [...state.recentChats];
            newData.splice(index, 1); // Remove the old entry
            newData.splice(newIndex, 0, updatedChat); // Insert the updated entry

            state.recentChats = newData;
         } else if (action.payload) {
            // If the item is not found, add the new message at the top
            const newChat = {
               ...action.payload,
               unreadCount: !isLocalUser(publisherId) ? 1 : 0,
               isUnread: !isLocalUser(publisherId) ? 1 : 0,
               userJid,
               deleteStatus: 0,
               recallStatus: 0,
               archiveStatus: archiveSetting === 0 ? archiveSetting : action.payload.archiveStatus,
            };

            state.recentChats = [newChat, ...state.recentChats];
         }
      },
      toggleChatSelection(state, action) {
         const userJid = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid);
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
         state.recentChats[index] = { ...state.recentChats[index], ...action.payload };
      },
      deleteMessagesForEveryoneInRecentChat(state, action) {
         const userJid = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid);
         state.recentChats[index].recallStatus = 1;
      },
      deleteRecentChats(state, action) {
         const component = action.payload;
         if (component === ARCHIVED_SCREEN) {
            state.recentChats = state.recentChats.filter(item => !(item.isSelected === 1 && item.archiveStatus === 1));
         } else {
            state.recentChats = state.recentChats.filter(item => item.isSelected !== 1);
         }
      },
      deleteRecentChatOnUserId(state, action) {
         const userJid = action.payload;
         state.recentChats = state.recentChats.filter(item => item.userJid !== userJid);
      },
      toggleArchiveChats(state, action) {
         const archive = action.payload;
         state.recentChats = state.recentChats
            .map(chat => (chat.isSelected === 1 ? { ...chat, archiveStatus: archive ? 1 : 0, isSelected: 0 } : chat))
            .sort((a, b) => b.timestamp - a.timestamp);
      },
      toggleArchiveChatsByUserId(state, action) {
         const { fromUserJid, isArchived } = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === fromUserJid);
         if (index !== -1) {
            state.recentChats[index].archiveStatus = isArchived;
         }
      },
      toggleChatMute(state, action) {
         const { userJid, muteStatus } = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid);
         if (index !== -1) {
            state.recentChats[index] = { ...state.recentChats[index], muteStatus, isSelected: 0 };
         }
      },
      resetUnreadCountForChat(state, action) {
         const userJid = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid);
         if (index !== -1) {
            // Toggle the isSelected property
            state.recentChats[index] = { ...state.recentChats[index], unreadCount: 0, isUnread: 0 };
         }
      },
      editRecentChatItem(state, action) {
         const { userJid, msgId, message, caption, msgStatus } = action.payload;
         const index = state.recentChats.findIndex(item => item.userJid === userJid && item.msgId === msgId);
         if (state.recentChats[index]) {
            state.recentChats[index].msgStatus = msgStatus;
         }
         if (state.recentChats[index] && message) {
            state.recentChats[index].msgBody.message = message;
         }
         if (state[index] && caption) {
            state.recentChats[index].msgBody.media.caption = caption;
         }
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
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
   deleteRecentChats,
   deleteRecentChatOnUserId,
   toggleArchiveChats,
   toggleChatMute,
   resetUnreadCountForChat,
   toggleArchiveChatsByUserId,
   editRecentChatItem,
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
