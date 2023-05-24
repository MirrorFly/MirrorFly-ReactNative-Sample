import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SDK from '../SDK/SDK';
import { RECENTCHATLOADING } from '../constant';
import { v4 as uuidv4 } from 'uuid';

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
    const recentChatsFilter = recentChatsRes?.data.filter(item => item.chatType == 'chat')
    return { recentChatsFilter }
})

export const getMessages = createAsyncThunk('chat/getMessages', async (fromUserJId) => {
    let message = await SDK.getChatMessages(fromUserJId);
    return { fromUserJId, message }
})

export const getReceiveMessage = createAsyncThunk('chat/getReceiveMessage', async (res, { getState }) => {
    let message = {}
    const chatMessages = getState()?.chat?.chatMessages
    if (chatMessages[res.fromUserJid]) {
        message.data = [res, ...chatMessages[res.fromUserJid]]
        return { res, message };
    } else {
        message = await SDK.getChatMessages(res.fromUserJid);
        return { res, message };
    }
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (message, { getState }) => {
    let userJid = getState()?.auth?.currentUserJID
    let [val, fromUserJId] = message;
    let msgId = uuidv4()
    let chatMessage = {
        chatType: 'chat',
        favouriteBy: 0,
        favouriteStatus: 0,
        deleteStatus: 0,
        fromUserJid: userJid,
        timestamp: Date.now(),
        msgStatus: 0,
        msgId: msgId,
        msgBody: {
            msgId: msgId,
            message: val,
            message_type: 'text'
        }
    }
    await SDK.sendTextMessage(fromUserJId, val, chatMessage.msgId);
    return { chatMessage, fromUserJId }
})

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        updateMessageStatus: (state, action) => {
            const res = action.payload
            state.chatMessages[res.fromUserJid]?.forEach(chat => {
                if (chat.msgId == res.msgId) {
                    chat.msgStatus = res.msgStatus || 0
                }
            });
        },
    },
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
                let msg = action?.payload?.res
                state.chatMessages[msg?.fromUserJid] = action?.payload?.message?.data;
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
    },
});
export default chatSlice.reducer;

export const updateMessageStatus = chatSlice.actions.updateMessageStatus