// import { configureStore } from '@reduxjs/toolkit';
// import navigationSlice from './navigationSlice';
// import authSlice from './authSlice';
// import chatSlice from './chatSlice';
// import profileSlice from './profileSlice';
// import userSlice from './userSlice';
// import storageSlice from './storageSlice';
// import dbSlice from './dbSlice';
// import recentChatDataSlice from './recentChatDataSlice';
// import conversationSlice from './conversationSlice';
// import connectionSlice from './connectionSlice';
// import chatSeenPendingMsg from './chatSeenPendingMsg';
// import galleryDataSlice from './galleryDataSlice';
// import mediaUploadDataSlice from './mediaUploadDataSlice';
// import SingleChatSelectedImageSlice from './SingleChatImageSlice';
// import mediaDownloadDataSlice from './mediaDownloadDataSlice';

// const store = configureStore({
//   reducer: {
//     navigation: navigationSlice,
//     recentChatData: recentChatDataSlice,
//     auth: authSlice,
//     chat: chatSlice,
//     chatConversationData: conversationSlice,
//     profile: profileSlice,
//     user: userSlice,
//     chatSeenPendingMsgData: chatSeenPendingMsg,
//     storage: storageSlice,```
//     dbValues: dbSlice,
//     galleryData: galleryDataSlice,
//     mediaUploadData: mediaUploadDataSlice,
//     connection: connectionSlice,
//     chatSelectedMedia: SingleChatSelectedImageSlice,
//     mediaDownloadData: mediaDownloadDataSlice,
//   },
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });

import { legacy_createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
// import rootReducer from './Reducers/in';
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
});

const Store = legacy_createStore(rootReducer, applyMiddleware(thunkMiddleware));

export const getStoreState = store => {
  store = store || Store;
  return (store.getState && store.getState()) || {};
};

export default Store;
