import { createSlice } from '@reduxjs/toolkit';

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
