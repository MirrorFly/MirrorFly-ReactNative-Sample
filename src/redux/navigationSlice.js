import { createSlice } from '@reduxjs/toolkit';
import { PROFILESCREEN, RECENTCHATSCREEN, REGISTERSCREEN } from '../constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
    screen: REGISTERSCREEN,
    fromUserJid: '',
    number: '',
    status: 'idle',
    error: null,
    selectContryCode: {
        name: "India",
        dial_code: "91",
        code: "IN"
    },
    prevScreen: ""
}

const navigationSlice = createSlice({
    name: 'navigateSlice',
    initialState: initialState,
    reducers: {
        navigate: (state, action) => {
            state.screen = action.payload?.screen;
            state.number = action.payload?.number
            state.fromUserJid = action.payload?.fromUserJID;
            state.selectContryCode = action?.payload?.selectContryCode || state.selectContryCode
            state.prevScreen = action?.payload.prevScreen;
            AsyncStorage.setItem('screenObj', JSON.stringify({ prevScreen: action.payload?.prevScreen, screen: action.payload?.screen }))
        }
    },
});


export const { navigate } = navigationSlice.actions;

export default navigationSlice.reducer;