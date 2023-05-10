import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { REGISTERSCREEN } from '../constant';

const initialState = {
    screen: REGISTERSCREEN,
    fromUserJid: '',
    number: '',
    status: 'idle',
    error: null,
}

const navigationSlice = createSlice({
    name: 'navigateSlice',
    initialState: initialState,
    reducers: {
        navigate: (state, action) => {
            state.screen = action.payload?.screen;
            state.number = action.payload?.number
            state.fromUserJid = action.payload?.fromUserJID;
        }
    },
});


export const { navigate } = navigationSlice.actions;

export default navigationSlice.reducer;