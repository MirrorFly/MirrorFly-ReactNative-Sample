import { getObjectDeepClone } from '../reduxHelper';
import {
   CLEAR_RECENT_CHAT_SELECTED_ITEMS,
   RESET_STORE,
   TOGGLE_RECENT_CHAT_SEARCH,
   UPDATE_RECENT_CHAT_SEARCH_TEXT,
   UPDATE_RECENT_CHAT_SELECTED_ITEMS,
   UPDATE_RECENT_CHAT_SELECTED_ITEMS_OBJECT,
} from '../Actions/Constants';

const initialState = {
   isSearching: false,
   searchText: '',
   selectedItemsObj: {},
   selectedItems: [],
};

const initialStateClone = getObjectDeepClone(initialState);

const recentChatSearchReducer = (state = initialStateClone, { type, payload } = {}) => {
   switch (type) {
      case TOGGLE_RECENT_CHAT_SEARCH:
         return {
            ...state,
            isSearching: payload,
         };
      case UPDATE_RECENT_CHAT_SEARCH_TEXT:
         return {
            ...state,
            searchText: payload,
         };
      case UPDATE_RECENT_CHAT_SELECTED_ITEMS:
         const _state = { ...state };
         if (payload.userJid in _state.selectedItemsObj) {
            delete _state.selectedItemsObj[payload.userJid];
            _state.selectedItems = _state.selectedItems.filter(i => i.userJid !== payload.userJid);
         } else {
            _state.selectedItemsObj[payload.userJid] = payload;
            _state.selectedItems.push(payload);
         }
         return _state;
      case UPDATE_RECENT_CHAT_SELECTED_ITEMS_OBJECT:
         const updatedState = { ...state };
         if (payload.userJid in updatedState.selectedItemsObj) {
            updatedState.selectedItemsObj[payload.userJid] = {
               ...updatedState.selectedItemsObj[payload.userJid],
               ...payload,
            };
            const index = updatedState.selectedItems.findIndex(item => item.userJid === payload.userJid);
            if (index !== -1) {
               updatedState.selectedItems[index] = { ...payload };
            }
         }
         return updatedState;
      case CLEAR_RECENT_CHAT_SELECTED_ITEMS:
         return {
            ...state,
            selectedItemsObj: {},
            selectedItems: [],
         };
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default recentChatSearchReducer;
