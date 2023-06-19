import { configureStore } from '@reduxjs/toolkit';
import navigationSlice from './navigationSlice';
import authSlice from './authSlice';
import chatSlice from './chatSlice';
import profileSlice from './profileSlice';
import userSlice from './userSlice';
import storageSlice from './storageSlice';
import dbSlice from './dbSlice';

const store = configureStore({
    reducer: {
        navigation: navigationSlice,
        auth: authSlice,
        chat: chatSlice,
        profile:profileSlice,
        user: userSlice,
        storage:storageSlice,
        dbValues:dbSlice
    },
});

export default store;