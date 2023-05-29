import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';

const initialState = {
    userPresence: {}
}

const userSlice = createSlice({
    name: 'userSlice',
    initialState,
    reducers: {
        updateUserPresence: (state, action) => {
            state.userPresence = action.payload
        },
    },
})

export const updateUserPresence = userSlice.actions.updateUserPresence

export default userSlice.reducer;
