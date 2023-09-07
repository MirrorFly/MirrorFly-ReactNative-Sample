import { legacy_createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import navigationReducer from './Reducers/Navigation.Reducer';
import recentChatReducer from './Reducers/RecentChat.Reducer';
import authReducer from './Reducers/Auth.Reducer';
import conversationReducer from './Reducers/Conversation.Reducer';
import profileReducer from './Reducers/Profile.Reducer';
import chatSeenPendingMsgReducer from './Reducers/chatSeenPendingMsg.Reducer';
import chatReducer from './Reducers/chat.Reducer';
import connectionReducer from './Reducers/connection.Reducer';
import userReducer from './Reducers/user.Reducer';
import galleryReducer from './Reducers/Gallery.Reducer';
import mediaDownloadReducer from './Reducers/MediaDownload.Reducer';
import mediaUploadReducer from './Reducers/MediaUpload.Reducer';
import singleChatImageReducer from './Reducers/SingleChatImage.Reducer';
import safeAreaReducer from './Reducers/SafeArea.Reducer';
import conversationSearchReducer from './Reducers/conversationSearch.Reducer';
import rosterReducer from './Reducers/roster.Reducer';
import recoverMessageReducer from './Reducers/RecoverMessage.Reducer';

const rootReducer = combineReducers({
  navigation: navigationReducer,
  recentChatData: recentChatReducer,
  auth: authReducer,
  chatConversationData: conversationReducer,
  profile: profileReducer,
  chatSeenPendingMsgData: chatSeenPendingMsgReducer,
  chat: chatReducer,
  connection: connectionReducer,
  user: userReducer,
  galleryData: galleryReducer,
  mediaUploadData: mediaUploadReducer,
  chatSelectedMedia: singleChatImageReducer,
  mediaDownloadData: mediaDownloadReducer,
  safeArea: safeAreaReducer,
  conversationSearchData: conversationSearchReducer,
  rosterData: rosterReducer,
  recoverMessage: recoverMessageReducer,
});

const Store = legacy_createStore(rootReducer, applyMiddleware(thunkMiddleware));

export const getStoreState = store => {
  store = store || Store;
  return store.getState?.() || {};
};

export default Store;
