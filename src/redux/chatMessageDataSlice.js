import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';
const { getUserIdFromJid } = require('../helpers/chatHelpers');

const initialState = {
   searchText: '',
};

const chatMessageDataSlice = createSlice({
   name: 'chatMessageData',
   initialState,
   reducers: {
      setChatMessages(state, action) {
         const { userJid = '', data } = action.payload;
         const userId = getUserIdFromJid(userJid);
         if (!Array.isArray(data)) return;
         if (state[userId]) {
            state[userId] = [...state[userId], ...data];
         } else {
            state[userId] = data;
         }
      },
      toggleMessageSelection(state, action) {
         const { chatUserId, msgId } = action.payload;
         const index = state[chatUserId]?.findIndex(item => item.msgId === msgId);
         if (index !== -1) {
            // Toggle the isSelected property
            state[chatUserId][index].isSelected = state[chatUserId][index].isSelected ? 0 : 1;
         }
      },
      resetMessageSelections(state, action) {
         const chatUserId = action.payload;
         state[chatUserId] = state[chatUserId]?.map(item =>
            item.isSelected === 1 ? { ...item, isSelected: 0 } : item,
         );
      },
      addChatMessageItem(state, action) {
         const { userJid } = action.payload;
         const userId = getUserIdFromJid(userJid);
         if (state[userId]) {
            state[userId] = [action.payload, ...state[userId]];
         }
      },
      updateChatMessageStatus(state, action) {
         const { fromUserId: userId, msgId, msgStatus } = action.payload;
         const index = state[userId]?.findIndex(item => item.msgId === msgId);
         if (index !== -1 && state[userId]) {
            state[userId][index].msgStatus = msgStatus;
         }
      },
      updateChatMessageSeenStatus(state, action) {
         const { fromUserId: userId, msgId } = action.payload;
         const index = state[userId]?.findIndex(item => item.msgId === msgId);
         if (index !== -1 && state[userId]) {
            state[userId][index].msgStatus = 2;
         }
      },
      setChatSearchText(state, action) {
         state.searchText = action.payload;
      },
      clearChatMessageData(state, action) {
         const userId = action.payload;
         if (state[userId]) {
            delete state[userId];
         }
      },
      deleteMessagesForMe(state, action) {
         const { userId, msgIds } = action.payload;
         if (state[userId]) {
            state[userId] = state[userId].map(message => {
               if (msgIds.includes(message.msgId)) {
                  return { ...message, deleteStatus: 1, isSelected: 0 };
               }
               return message;
            });
         }
      },
      deleteMessagesForEveryone(state, action) {
         const { userId, msgIds } = action.payload;
         if (state[userId]) {
            state[userId] = state[userId].map(message => {
               if (msgIds.includes(message.msgId)) {
                  return { ...message, recallStatus: 1, isSelected: 0 };
               }
               return message;
            });
         }
      },
      updateMediaStatus(state, action) {
         const { userId, msgId, is_downloaded, is_uploading, local_path } = action.payload;
         if (state[userId]) {
            state[userId] = state[userId].map(message => {
               if (message.msgId === msgId) {
                  return {
                     ...message,
                     msgBody: {
                        ...message.msgBody,
                        media: {
                           ...message.msgBody.media,
                           ...(is_downloaded !== undefined && { is_downloaded, local_path }),
                           ...(is_uploading !== undefined && { is_uploading }),
                        },
                     },
                  };
               }
               return message;
            });
         }
      },
      extraReducers: builder => {
         builder.addCase(clearState, () => initialState);
      },
   },
});

export const {
   setChatMessages,
   toggleMessageSelection,
   resetMessageSelections,
   addChatMessageItem,
   updateChatMessageStatus,
   updateChatMessageSeenStatus,
   setChatSearchText,
   clearChatMessageData,
   deleteMessagesForMe,
   deleteMessagesForEveryone,
   updateMediaStatus,
   resetChatMessageSlice,
} = chatMessageDataSlice.actions;

export default chatMessageDataSlice.reducer;
