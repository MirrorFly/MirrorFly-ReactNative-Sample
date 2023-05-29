import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    updateMsgStatus: [],
    status: 'idle',
    error: null,
}

export const storeDeliveryStatus = createAsyncThunk('chat/storeDeliveryStatus', async (res) => {
    let updateMessageStatusRes = await AsyncStorage.getItem('deliveryStatus')
    let parseData = JSON.parse(updateMessageStatusRes)
    if (!updateMessageStatusRes) {
        await AsyncStorage.setItem('deliveryStatus', JSON.stringify([res]));
    } else {
        let updatedStatus = [...parseData, res]
        await AsyncStorage.setItem('deliveryStatus', JSON.stringify(updatedStatus));
    }
})

export const storeSeenStatus = createAsyncThunk('chat/storeSeenStatus', async (res) => {
    let updateMessageStatusRes = await AsyncStorage.getItem('seenStatus')
    let parseData = JSON.parse(updateMessageStatusRes)
    if (!updateMessageStatusRes) {
        await AsyncStorage.setItem('seenStatus', JSON.stringify([res]));
    } else {
        let updatedStatus = [...parseData, res]
        await AsyncStorage.setItem('seenStatus', JSON.stringify(updatedStatus));
    }
})

export const updateAsyncStorage = createAsyncThunk('chat/updateAsyncStorage', async (res, { dispatch }) => {
    switch (res.msgType) {
        case 'delivered':
            dispatch(storeDeliveryStatus(res))
            break;
        case 'seen':
            dispatch(storeSeenStatus(res))
            break;
        default:
            let updateMessageStatusRes = await AsyncStorage.getItem('updateMessageStatus')
            let parseData = JSON.parse(updateMessageStatusRes)
            if (!updateMessageStatusRes) {
                await AsyncStorage.setItem('updateMessageStatus', JSON.stringify([res]));
            } else {
                let updatedStatus = [...parseData, res]
                await AsyncStorage.setItem('updateMessageStatus', JSON.stringify(updatedStatus));
            }
            break;
    }
    return true
})

const storageSlice = createSlice({
    name: 'storage',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateAsyncStorage.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAsyncStorage.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(updateAsyncStorage.rejected, (state, action) => {
                state.status = 'failed';
            })
            .addCase(storeDeliveryStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(storeDeliveryStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(storeDeliveryStatus.rejected, (state, action) => {
                state.status = 'failed';
            })
            .addCase(storeSeenStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(storeSeenStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(storeSeenStatus.rejected, (state, action) => {
                state.status = 'failed';
            })
    }
})

export default storageSlice.reducer;
