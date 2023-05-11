import { configureStore } from '@reduxjs/toolkit';
import navigationSlice from './navigationSlice';
import authSlice from './authSlice';
import chatSlice from './chatSlice';

const store = configureStore({
    reducer: {
        navigation: navigationSlice,
        auth: authSlice,
        chat: chatSlice
    },
});

export default store;