import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { navigate } from './navigationSlice';
import { CONNECTED, NOTCONNECTED } from '../constant';

const initialState = {
    UserData: {},
    currentUserJID: "",
    status: 'idle',
    isConnected: NOTCONNECTED,
    error: null,
}

export const getCurrentUserJid = createAsyncThunk('register/getCurrentUserJid', async () => {
    let jid = await SDK.getCurrentUserJid()
    let userJID = jid.userJid.split('/')[0]
    return userJID
})

export const registerData = createAsyncThunk('register/userData', async (number, { dispatch }) => {
    try {

        let register
        if (number) {
            register = await SDK.register(number);
            switch (register.statusCode) {
                case 200:
                    await AsyncStorage.setItem('mirrorFlyLoggedIn', 'true');
                    await AsyncStorage.setItem('credential', JSON.stringify(register.data));
                    await dispatch(connectXMPP(register.data))
                    break;
            }
        }
        return { register }
    } catch (error) {
        console.log(error, 'registerData error')
    }
})

export const connectXMPP = createAsyncThunk('register/connect', async (register, { dispatch }) => {
    let connect = await SDK.connect(register.username, register.password);
    switch (connect?.statusCode) {
        case 200:
            ('Connection Established register/connect');
            await dispatch(getCurrentUserJid());
            break;
        case 409:
            break;
        default:
            errorToast(connect.message);
            break;
    }
    return connect.statusCode
})

const authSlice = createSlice({
    name: 'authSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(registerData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(registerData.fulfilled, (state, action) => {
                state.status = 'registered';
            })
            .addCase(registerData.rejected, (state, action) => {
                state.status = 'failed';
            })
            .addCase(connectXMPP.pending, (state) => {
                state.isConnected = 'loading';
            })
            .addCase(connectXMPP.fulfilled, (state, action) => {
                if (action.payload == 200 || action.payload == 409) {
                    state.isConnected = CONNECTED;
                }
            })
            .addCase(connectXMPP.rejected, (state, action) => {
                state.isConnected = 'failed';
            })
            .addCase(getCurrentUserJid.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getCurrentUserJid.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentUserJID = action.payload;
            })
            .addCase(getCurrentUserJid.rejected, (state, action) => {
                state.status = 'failed';
            });

    },
});

export default authSlice.reducer;