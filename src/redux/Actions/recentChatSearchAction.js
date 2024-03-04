import {
   CLEAR_RECENT_CHAT_SELECTED_ITEMS,
   TOGGLE_RECENT_CHAT_SEARCH,
   UPDATE_RECENT_CHAT_SEARCH_TEXT,
   UPDATE_RECENT_CHAT_SELECTED_ITEMS,
} from './Constants';

export const toggleRecentChatSearch = data => {
   return {
      type: TOGGLE_RECENT_CHAT_SEARCH,
      payload: data,
   };
};

export const updateRecentChatSearchText = data => {
   return {
      type: UPDATE_RECENT_CHAT_SEARCH_TEXT,
      payload: data,
   };
};

export const updateRecentChatSelectedItems = data => {
   return {
      type: UPDATE_RECENT_CHAT_SELECTED_ITEMS,
      payload: data,
   };
};

export const clearRecentChatSelectedItems = () => {
   return {
      type: CLEAR_RECENT_CHAT_SELECTED_ITEMS,
   };
};
