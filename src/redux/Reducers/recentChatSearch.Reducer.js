import {
  CLEAR_RECENT_CHAT_SELECTED_ITEMS,
  RESET_STORE,
  TOGGLE_RECENT_CHAT_SEARCH,
  UPDATE_RECENT_CHAT_SEARCH_TEXT,
  UPDATE_RECENT_CHAT_SELECTED_ITEMS,
} from '../Actions/Constants';

const initialState = {
  isSearching: false,
  searchText: '',
  selectedItemsObj: {},
  selectedItems: [],
};

const recentChatSearchReducer = (
  state = initialState,
  { type, payload } = {},
) => {
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
        _state.selectedItems = _state.selectedItems.filter(
          i => i.userJid !== payload.userJid,
        );
      } else {
        _state.selectedItemsObj[payload.userJid] = payload;
        _state.selectedItems.push(payload);
      }
      return _state;
    case CLEAR_RECENT_CHAT_SELECTED_ITEMS:
      return {
        ...state,
        selectedItemsObj: {},
        selectedItems: [],
      };
    case RESET_STORE:
      return { ...initialState };
    default:
      return state;
  }
};

export default recentChatSearchReducer;
