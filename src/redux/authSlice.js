import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CONNECTED, DISCONNECTED, NOTCONNECTED, REGISTERSCREEN } from '../constant';
import { navigate } from './navigationSlice';
import { profileDetail } from './profileSlice';

const initialState = {
    userData: {},
    currentUserJID: "",
    status: 'idle',
    isConnected: NOTCONNECTED,
    error: null,

}

export const logout = createAsyncThunk('register/logout', async (val, { dispatch }) => {
    let logout = await SDK.logout()
    const getPrevUserIdentifier = await AsyncStorage.getItem('userIdentifier')
    await AsyncStorage.setItem('prevUserIdentifier', getPrevUserIdentifier);
    await AsyncStorage.setItem('credential', '');
    await AsyncStorage.setItem('userIdentifier', '');
    await AsyncStorage.setItem('screenObj', '')
    dispatch(profileDetail({}))
    dispatch(navigate({ screen: REGISTERSCREEN }))
    return logout.statusCode
})

export const getCurrentUserJid = createAsyncThunk('register/getCurrentUserJid', async (val) => {
    let userJID = val
    return userJID
})

export const registerData = createAsyncThunk('register/userData', async (number, { dispatch }) => {
    try {
        let register
        if (number) {
            register = await SDK.register(number);
            if (register.statusCode == 200) {
                await AsyncStorage.setItem('mirrorFlyLoggedIn', 'true');
                await AsyncStorage.setItem('userIdentifier', JSON.stringify(number));
                await AsyncStorage.setItem('credential', JSON.stringify(register.data));
                await dispatch(connectXMPP(register.data))
            }
        }
        return register.data
    } catch (error) {
        console.log(error, 'registerData error');
    }
})

export const connectXMPP = createAsyncThunk('register/connect', async (register, { dispatch }) => {
    let connect = await SDK.connect(register.username, register.password);
    switch (connect?.statusCode) {
        case 200:
        case 409:
            await dispatch(getCurrentUserJid());
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
                state.userData = action.payload
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

            .addCase(logout.pending, (state) => {
                state.isConnected = 'loading';
            })
            .addCase(logout.fulfilled, (state, action) => {
                if (action.payload == 200) {
                    state.isConnected = DISCONNECTED;
                }
            })
            .addCase(logout.rejected, (state, action) => {
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