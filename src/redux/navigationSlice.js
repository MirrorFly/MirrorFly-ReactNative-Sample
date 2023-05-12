import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { REGISTERSCREEN } from '../constant';

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
    }
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
        }
    },
});


export const { navigate } = navigationSlice.actions;

export default navigationSlice.reducer;