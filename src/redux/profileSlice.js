import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';

const initialState = {
    profileInfoList: {
        nickName: "",
        status: "",
        email: "",
        mobileNumber: ""
    },
}

export const profileData = createAsyncThunk('profile/profileData', async (res, { getState }) => {
    let userJid = getState()?.auth?.currentUserJID;
    let userId = userJid.split("@")[0];
    let getUserInfo = await SDK.getUserProfile(userId);
    return getUserInfo.data;

})

const profileSlice = createSlice({
    name: 'profileSlice',
    initialState,
    reducers: {
        updateProfile: (state, action) => {
            if(action.payload.userId == state.profileInfoList.userId && action.payload !== state.profileInfoList){
                state.profileInfoList = action.payload;
            }
        },
        
    },
    extraReducers: (builder) => {
        builder
            .addCase(profileData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(profileData.fulfilled, (state, action) => {
                state.status = 'profile Updated';
                state.profileInfoList = action.payload;
            })
            .addCase(profileData.rejected, (state, action) => {
                state.status = 'failed';
            })

    },
});

export const updateProfile = profileSlice.actions.updateProfile

export default profileSlice.reducer;