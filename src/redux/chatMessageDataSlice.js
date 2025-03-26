import { createSlice } from '@reduxjs/toolkit';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { clearState } from './clearSlice';

const initialState = {
   searchText: '',
   editMessage: '',
   parentMessage: {},
   isChatSearching: false,
};

const chatMessageDataSlice = createSlice({
   name: 'chatMessageData',
   initialState,
   reducers: {
      setChatMessages(state, action) {
         const removeDuplicates = messages => {
            const seen = new Set();
            return messages.filter(message => {
               const isDuplicate = seen.has(message.msgId);
               seen.add(message.msgId);
               return !isDuplicate;
            });
         };
         const { userJid = '', data, forceUpdate = false } = action.payload;
         data.forEach(message => {
            const parentMessage = message.msgBody?.parentMessage;
            if (parentMessage) {
               state.parentMessage[parentMessage.msgId] = parentMessage;
            }
         });
         const userId = getUserIdFromJid(userJid);
         if (!Array.isArray(data)) {
            return;
         }
         if (state[userId] && !forceUpdate) {
            // Merge existing messages with new ones
            state[userId] = removeDuplicates([...state[userId], ...data]);
         } else {
            // Add new messages if userId does not exist
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
         const { userJid, msgBody: { replyTo = '' } = {}, msgId } = action.payload;
         const userId = getUserIdFromJid(userJid);
         if (replyTo && state[userId]) {
            const message = state[userId].find(item => item.msgId === replyTo);
            if (message) {
               state.parentMessage[replyTo] = message;
            }
         }
         if (state[userId]) {
            const messageIndex = state[userId].findIndex(item => item.msgId === msgId);

            if (messageIndex !== -1) {
               if (state[userId][messageIndex] !== action.payload) {
                  state[userId][messageIndex] = {
                     ...action.payload,
                     ...state[userId][messageIndex],
                  };
               }
            } else {
               state[userId].unshift({ ...action.payload, deleteStatus: 0, recallStatus: 0 });
            }
         } else {
            state[userId] = [{ ...action.payload, deleteStatus: 0, recallStatus: 0 }];
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
                  if (state.parentMessage[message.msgId]) {
                     state.parentMessage[message.msgId].deleteStatus = 1;
                  }
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
                  if (state.parentMessage[message.msgId]) {
                     state.parentMessage[message.msgId].recallStatus = 1;
                  }
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
      highlightMessage(state, action) {
         const { msgId: highlightMessageId, shouldHighlight, userId } = action.payload;
         const index = state[userId]?.findIndex(item => item.msgId === highlightMessageId);
         if (index !== -1 && state[userId]) {
            state[userId][index].shouldHighlight = shouldHighlight;
         }
      },
      editChatMessageItem(state, action) {
         const { userJid, msgId, caption, message, editMessageId, msgStatus } = action.payload;
         const userId = getUserIdFromJid(userJid);
         const index = state[userId]?.findIndex(item => item.msgId === msgId);
         if (state[userId]) {
            state[userId][index].editMessageId = editMessageId;
            state[userId][index].msgStatus = msgStatus;
         }
         if (state[userId] && message) {
            state[userId][index].msgBody.message = message;
         }
         if (state[userId] && caption) {
            state[userId][index].msgBody.media.caption = caption;
         }
      },
      toggleEditMessage(state, action) {
         state.editMessage = action.payload;
      },
      setParentMessage(state, action) {
         state.parentMessage[action.payload.msgId] = action.payload;
      },
      toggleIsChatSearching(state, action) {
         state.isChatSearching = action.payload;
      },
      setIsSearchChatLoading(state, action) {
         state.isSearchChatLoading = action.payload;
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
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
   highlightMessage,
   toggleEditMessage,
   editChatMessageItem,
   setParentMessage,
   toggleIsChatSearching,
   setIsSearchChatLoading,
} = chatMessageDataSlice.actions;

export default chatMessageDataSlice.reducer;
