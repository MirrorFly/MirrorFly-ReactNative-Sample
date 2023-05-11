import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';

const initialState = {
    chatMessages: {},
    recentChat: [],
    fromUserJId: '',
    status: 'idle',
    error: null,
}

export const getRecentChat = createAsyncThunk('chat/getRecentChat', async () => {
    let recentChatsRes = await SDK.getRecentChats();
    console.log(recentChatsRes)
    const recentChatsFilter = recentChatsRes?.data?.filter(item => item.chatType == 'chat')
    return { recentChatsFilter }
})

export const getMessages = createAsyncThunk('chat/getMessages', async (fromUserJId, { getState }) => {
    let message = await SDK.getChatMessages(fromUserJId);
    return { fromUserJId, message }
})

export const getReceiveMessage = createAsyncThunk('chat/getReceiveMessage', async (msg) => {
    let message
    switch (msg.msgType) {
        case 'receiveMessage':
            if (msg.fromUserJid) {
                message = await SDK.getChatMessages(msg.fromUserJid);
            }
            return { msg, message };
        default:
            break;
    }
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (message, { getState }) => {
    let userJid = getState()?.register?.currentUserJID
    let [val, fromUserJId] = message;
    SDK.sendTextMessage(fromUserJId, val);
    let chatMessage = {
        fromUserJid: userJid,
        timestamp: Date.now(),
        msgStatus: 0,
        msgBody: {
            message: val
        }
    }
    return { chatMessage, fromUserJId }
})


const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMessages.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages = {
                    ...state.messages, [action?.payload?.fromUserJId]: action?.payload?.message?.data
                };
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.status = 'failed';
                // state.error = action.error.message;
            })
            .addCase(sendMessage.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages[action.payload.fromUserJId] = [action.payload.chatMessage, ...state.messages[action.payload.fromUserJId]]
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.status = 'failed';
            })
            .addCase(getReceiveMessage.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getReceiveMessage.fulfilled, (state, action) => {
                state.status = 'succeeded';
                let msg = action?.payload?.msg
                if (msg?.msgType === 'receiveMessage') {
                    state.messages[msg?.fromUserJid] = action?.payload?.message?.data
                }
            })
            .addCase(getReceiveMessage.rejected, (state, action) => {
                state.status = 'failed';
            })
            .addCase(getRecentChat.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getRecentChat.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.recentChat = action.payload.recentChatsFilter
            })
            .addCase(getRecentChat.rejected, (state, action) => {
                state.status = 'failed';
            });
    },
});

export default chatSlice.reducer;