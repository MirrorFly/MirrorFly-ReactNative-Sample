import { configureStore } from '@reduxjs/toolkit';
import navigationSlice from './navigationSlice';
import authSlice from './authSlice';
import chatSlice from './chatSlice';
import profileSlice from './profileSlice';
import userSlice from './userSlice';
import storageSlice from './storageSlice';

const store = configureStore({
    reducer: {
        navigation: navigationSlice,
        auth: authSlice,
        chat: chatSlice,
        profile:profileSlice,
        user: userSlice,
        storage:storageSlice

      
    },
});

export default store;