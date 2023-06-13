import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    dbProfileDetails: []
}

const dbSlice = createSlice({
    name: 'dbSlice',
    initialState,
    reducers: {
        updateDBProfileDetails: (state, action) => {
            state.dbProfileDetails = action.payload
        },
    },
})

export const updateDBProfileDetails = dbSlice.actions.updateDBProfileDetails

export default dbSlice.reducer;