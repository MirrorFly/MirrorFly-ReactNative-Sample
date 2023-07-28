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

// const store = configureStore({
//     reducer: {
//         navigation: navigationSlice,
//         recentChatData: recentChatDataSlice,
//         auth: authSlice,
//         chat: chatSlice,
//         chatConversationData: conversationSlice,
//         profile: profileSlice,
//         user: userSlice,
//         chatSeenPendingMsgData: chatSeenPendingMsg,
//         storage: storageSlice,
//         dbValues: dbSlice,
//         connection: connectionSlice
//     }, middleware: (getDefaultMiddleware) => getDefaultMiddleware({
//         actionCreatorInvariant: false,
//         immutableStateInvariant: false,
//         serializableStateInvariant: false,
//     }),
// });

// export default store;

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
});

const Store = legacy_createStore(rootReducer, applyMiddleware(thunkMiddleware));

export const getStoreState = store => {
  store = store || Store;
  return (store.getState && store.getState()) || {};
};

export default Store;
