import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';
import { RECENTCHATLOADING } from '../constant';

const initialState = {
    chatMessages: {},
    recentChat: [],
    fromUserJId: '',
    status: 'idle',
    error: null,
    recentChatStatus: 'idle'
}

export const getRecentChat = createAsyncThunk('chat/getRecentChat', async () => {
    let recentChatsRes = await SDK.getRecentChats();
    const recentChatsFilter = recentChatsRes?.data?.filter(item => item.chatType == 'chat')
    return { recentChatsFilter }
})

export const updateRecentChat = createAsyncThunk('chat/updateRecentChat', async (res, { getState }) => {
    let recentChatsRes = await SDK.getRecentChats();
    const recentChatsFilter = recentChatsRes?.data?.filter(item => item.chatType == 'chat')
    return { recentChatsFilter }
})

export const getMessages = createAsyncThunk('chat/getMessages', async (fromUserJId, { getState }) => {
    let message = await SDK.getChatMessages(fromUserJId);
    return { fromUserJId, message }
})

export const getReceiveMessage = createAsyncThunk('chat/getReceiveMessage', async (msg, { dispatch }) => {
    let message
    await dispatch(updateRecentChat())
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
    let userJid = getState()?.auth?.currentUserJID
    let [val, fromUserJId] = message;
    let chatMessage = {
        fromUserJid: userJid,
        timestamp: Date.now(),
        msgStatus: 0,
        msgBody: {
            message: val,
            message_type:'text'
        }
    }
    await SDK.sendTextMessage(fromUserJId, val);
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
                state.chatMessages = {
                    ...state.chatMessages, [action?.payload?.fromUserJId]: action?.payload?.message?.data
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
                state.chatMessages[action.payload.fromUserJId] = [action.payload.chatMessage, ...state.chatMessages[action.payload.fromUserJId]]
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
                    state.chatMessages[msg?.fromUserJid] = action?.payload?.message?.data;
                }
            })
            .addCase(getReceiveMessage.rejected, (state, action) => {
                state.status = 'failed';
            })
            .addCase(getRecentChat.pending, (state) => {
                state.recentChatStatus = RECENTCHATLOADING;
            })
            .addCase(getRecentChat.fulfilled, (state, action) => {
                state.recentChatStatus = 'succeeded';
                state.recentChat = action.payload.recentChatsFilter?.reverse()
            })
            .addCase(getRecentChat.rejected, (state, action) => {
                state.recentChatStatus = 'failed';
            })
            .addCase(updateRecentChat.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateRecentChat.fulfilled, (state, action) => {
                state.recentChatStatus = 'succeeded';
                state.recentChat = action.payload.recentChatsFilter.reverse()
            })
            .addCase(updateRecentChat.rejected, (state, action) => {
                state.recentChatStatus = 'failed';
            })
    },
});

export default chatSlice.reducer;