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


export const updateData = createAsyncThunk('profile/profileupdate', async (res, { getState }) => {

    // let userJid = getState()?.auth?.currentUserJID;
    // let userId = userJid.split("@")[0];
   

    // if (res.userId == userId) {

    //     console.log("userId", userId);
    //     let getUserInfo = await SDK.getUserProfile(userId);
    //     return getUserInfo.data;

    // }

    console.log(res);


})


export const profileData = createAsyncThunk('profile/profileData', async (res, { getState }) => {

    let userJid = getState()?.auth?.currentUserJID;
    let userId = userJid.split("@")[0];
    console.log("userId", userId);

    let getUserInfo = await SDK.getUserProfile(userId);
    return getUserInfo.data;

})

const profileSlice = createSlice({
    name: 'profileSlice',
    initialState,
    reducers: {
        updateProfile: (state, action) => {
            console.log(action);
            state.profileInfoList = action.payload;
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
            .addCase(updateData.pending, (state) => {
                state.status = 'loading';
                console.log("loading");
            })
            .addCase(updateData.fulfilled, (state, action) => {
                state.status = 'profile Updated';
                state.profileInfoList = action.payload;
                console.log("fulfiled");
            })
            .addCase(updateData.rejected, (state, action) => {
                state.status = 'failed';
                console.log("failed");
            })

    },
});

export const updateProfile = profileSlice.actions.updateProfile

export default profileSlice.reducer;