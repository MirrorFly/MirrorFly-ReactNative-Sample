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

export const sendSeenStatus = createAsyncThunk('chat/sendSeenStatus', async (res) => {
    await SDK.sendSeenStatus(res.toJid, res.msgId);
    return true
})

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

export const sendMediaMsg = createAsyncThunk('chat/sendMediaMsg', async (mediaMsg) => {
    return mediaMsg
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (message, { getState, dispatch }) => {
    let userJid = getState()?.auth?.currentUserJID
    let [val, fromUserJId] = message;
    let msgId = uuidv4()
    let chatMessage = {
        chatType: 'chat',
        favouriteBy: 0,
        favouriteStatus: 0,
        deleteStatus: 0,
        fromUserJid: userJid,
        toUserJid: fromUserJId,
        timestamp: Date.now(),
        msgStatus: 3,
        msgId: msgId,
        msgType: 'sendMessage',
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
        updateMessageList: (state, action) => {
            let [val, fromUserJId,currentUserJID] = action.payload;
            val.forEach((item) => {
                let msgId = uuidv4()
                let chatMessage = {
                    chatType: 'chat',
                    favouriteBy: 0,
                    favouriteStatus: 0,
                    deleteStatus: 0,
                    fromUserJid: currentUserJID,
                    toUserJid: fromUserJId,
                    timestamp: Date.now(),
                    msgStatus: 3,
                    msgId: msgId,
                    msgType: 'sendMessage',
                    msgBody: {
                        msgId: msgId,
                        message: item.image.fileCopyUri,
                        message_type: item.image.type.split('/')[0]
                    }
                }
                state.chatMessages[fromUserJId] = [chatMessage, ...state.chatMessages[fromUserJId]]
                let fileOptions= {
                    msgId:msgId,
                    caption:item.caption
                }
                switch(chatMessage.msgBody.message_type){
                    case 'image':
                        SDK.sendImageMessage(fromUserJId, item.image, fileOptions);
                        break;
                    case 'video':
                        SDK.sendVideoMessage(fromUserJId, item.image, fileOptions);
                }
            })
        },
        updateRecentChat: (state, action) => {
            const res = action.payload
            switch (res.msgType) {
                case 'receiveMessage':
                    state.recentChat = state.recentChat.map(user => {
                        if (user.fromUserId === res.fromUserId) {
                            // Remove the object that satisfies the condition
                            return undefined;
                        } else {
                            // Return the original object
                            return user;
                        }
                    }).filter(Boolean);
                    state.recentChat = [res, ...state.recentChat]
                    break;
                case 'sendMessage':
                    state.recentChat = state.recentChat.map(chat => {
                        if (chat.fromUserId === res.toUserJid.split('@')[0]) {
                            // Remove the object that satisfies the condition
                            return undefined;
                        } else {
                            // Return the original object
                            return user;
                        }
                    }).filter(Boolean);
                    state.recentChat = [res, ...state.recentChat]
                    break;
            }
        }
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
            .addCase(sendSeenStatus.pending, (state) => {
                state.recentChatStatus = RECENTCHATLOADING;
            })
            .addCase(sendSeenStatus.fulfilled, (state, action) => {
                state.recentChatStatus = 'succeeded';
            })
            .addCase(sendSeenStatus.rejected, (state, action) => {
                state.recentChatStatus = 'failed';
            })
            .addCase(sendMediaMsg.pending, (state) => {
                state.recentChatStatus = RECENTCHATLOADING;
            })
            .addCase(sendMediaMsg.fulfilled, (state, action) => {
                state.recentChatStatus = 'succeeded';
            })
            .addCase(sendMediaMsg.rejected, (state, action) => {
                state.recentChatStatus = 'failed';
            })

    },
});
export default chatSlice.reducer;

export const updateMessageStatus = chatSlice.actions.updateMessageStatus
export const updateRecentChat = chatSlice.actions.updateRecentChat
export const updateMessageList = chatSlice.actions.updateMessageList