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
import connectionSlice from './connectionSlice';
import chatSeenPendingMsg from './chatSeenPendingMsg';
import galleryDataSlice from './galleryDataSlice';
import mediaUploadDataSlice from './mediaUploadDataSlice';
import SingleChatSelectedImageSlice from './SingleChatImageSlice';

const store = configureStore({
    reducer: {
        navigation: navigationSlice,
        recentChatData: recentChatDataSlice,
        auth: authSlice,
        chat: chatSlice,
        chatConversationData: conversationSlice,
        profile: profileSlice,
        user: userSlice,
        chatSeenPendingMsgData: chatSeenPendingMsg,
        storage: storageSlice,
        dbValues: dbSlice,
        galleryData: galleryDataSlice, 
        mediaUploadData:mediaUploadDataSlice,
        connection: connectionSlice,
        chatSelectedMedia:SingleChatSelectedImageSlice
    }, middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
});

export default store;