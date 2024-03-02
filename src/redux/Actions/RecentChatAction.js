import {
   UPDATE_RECENT_CHAT,
   ADD_RECENT_CHAT,
   UPDATE_RECENT_CHAT_MESSAGE_STATUS,
   UPDATE_ROSTER_LAST_MESSAGE,
   DELETE_SINGLE_CHAT,
   RECENT_REMOVE_MESSAGE_UPDATE,
   UPDATE_MSG_BY_LAST_MSGID,
   RECENT_RECALL_UPDATE,
   RESET_UNREAD_COUNT,
} from './Constants';

export const updateRecentChat = data => {
   return {
      type: UPDATE_RECENT_CHAT,
      payload: data,
   };
};

export const addRecentChat = data => {
   return {
      type: ADD_RECENT_CHAT,
      payload: data,
   };
};

export const updateRecentChatMessageStatus = data => {
   return {
      type: UPDATE_RECENT_CHAT_MESSAGE_STATUS,
      payload: data,
   };
};

export const clearLastMessageinRecentChat = data => {
   return {
      type: UPDATE_ROSTER_LAST_MESSAGE,
      payload: data,
   };
};

export const deleteActiveChatAction = data => {
   return {
      type: DELETE_SINGLE_CHAT,
      payload: data,
   };
};

export const recentRemoveMessageUpdate = data => {
   return {
      type: RECENT_REMOVE_MESSAGE_UPDATE,
      payload: data,
   };
};

export const updateMsgByLastMsgId = data => {
   return {
      type: UPDATE_MSG_BY_LAST_MSGID,
      payload: data,
   };
};

export const recentRecallUpdate = data => {
   return {
      type: RECENT_RECALL_UPDATE,
      payload: data,
   };
};

export const resetUnreadCountForChat = chatId => {
   return {
      type: RESET_UNREAD_COUNT,
      payload: chatId,
   };
};
