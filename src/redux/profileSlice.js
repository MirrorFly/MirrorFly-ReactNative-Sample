import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';

const initialState = {
  profileInfo: {
    nickname:"",
    status:"",
    email:"",
    mobileNumber:""
  },
    
}


export const profileData = createAsyncThunk('profile/InfoData', async () => {
   
        
            let getUserInfo = await SDK.getUserProfile();
            console.log("get profile", getUserInfo);
       
       
   
})



const profileSlice = createSlice({
    name: 'profileSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(profileData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(profileData.fulfilled, (state, action) => {
                state.status = 'profile Updated';
                
            })
            .addCase(profileData.rejected, (state, action) => {
                state.status = 'failed';
            })
            
           
          

    },
});

export default profileSlice.reducer;