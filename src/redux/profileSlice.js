import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';

const initialState = {
    profileInfoList: '',
    profileDetails: ""
}

const profileSlice = createSlice({
    name: 'profileSlice',
    initialState,
    reducers: {
        profileDetail: (state, action) => {
            state.profileDetails = action.payload
        },
        updateProfileDetail: (state, action) => {
            if (action.payload.userId == state.profileDetails.userId && action.payload !== state.profileDetails) {
                state.profileDetails = action.payload
            }
        }
    }
});
export const { profileDetail, updateProfileDetail } = profileSlice.actions

export default profileSlice.reducer;