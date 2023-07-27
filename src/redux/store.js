import { configureStore } from '@reduxjs/toolkit';
import navigationSlice from './navigationSlice';
import authSlice from './authSlice';
import chatSlice from './chatSlice';
import profileSlice from './profileSlice';
import userSlice from './userSlice';
import storageSlice from './storageSlice';
import dbSlice from './dbSlice';
import recentChatDataSlice from './recentChatDataSlice';
import conversationSlice from './conversationSlice';
import SingleChatSelectedImageSlice from './SingleChatImageSlice';
const store = configureStore({
    reducer: {
        navigation: navigationSlice,
        recentChatData:recentChatDataSlice,
        auth: authSlice,
        chat: chatSlice,
        chatConversationData:conversationSlice,
        profile:profileSlice,
        user: userSlice,
        storage:storageSlice,
        dbValues:dbSlice,
        chatSelectedMedia:SingleChatSelectedImageSlice
    },middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
});

export default store;