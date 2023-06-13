import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';

const initialState = {
    profileInfoList: {
        nickName: "",
        status: "I am in Mirror Fly",
        email: "",
        mobileNumber: ""
    },
}

export const profileData = createAsyncThunk('profile/profileData', async (res, { getState }) => {
    let userJid = getState()?.auth?.currentUserJID;
    let userId = userJid.split("@")[0];
    let getUserInfo = await SDK.getUserProfile(userId);
    if (getUserInfo.statusCode == 200) {
        if (getUserInfo.data.image) {
            let imageUrl = await SDK.getMediaURL(getUserInfo.data.image)
            getUserInfo.data.image = imageUrl.data
        }
        return getUserInfo.data;
    }
})

export const updateProfile = createAsyncThunk('profile/updateProfile', async (res, { getState }) => {
    let profileInfo = getState()?.profile.profileInfoList
    if (res.userId == profileInfo.userId && res !== profileInfo) {
        profileInfo = res
        if (res.image) {
            let imageUrl = await SDK.getMediaURL(res.image)
            profileInfo.image = imageUrl.data
            return profileInfo
        }
        return profileInfo
    }
})

const profileSlice = createSlice({
    name: 'profileSlice',
    initialState,
    reducers: {


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
            .addCase(updateProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.status = 'profile Updated';
                state.profileInfoList = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.status = 'failed';
            })
    },
});

export default profileSlice.reducer;