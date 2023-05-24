import { getRecentChat } from "../redux/chatSlice";
import {  getReceiveMessage, updateMessageStatus } from "../redux/chatSlice";
import store from "../redux/store";

export const callBacks = {
    connectionListener: (response) => {
        if (response.status === "CONNECTED") {
            console.log("Connection Established");
        } else if (response.status === "DISCONNECTED") {
            console.log("Disconnected");
        }
    },
    messageListener: (res) => {
        console.log('messageListener');
        store.dispatch(getRecentChat())
        switch (res.msgType) {
            case 'receiveMessage':
                store.dispatch(getReceiveMessage(res))
                break;
            case 'acknowledge':
            case 'delivered':
            case 'seen':
                if (res.fromUserJid) {
                    store.dispatch(updateMessageStatus(res))
                }
            default:
                break;
        }
    },
    presenceListener: (res) => {
        console.log('presenceListener', res)
    },
    userProfileListener: (res) => {
        console.log('userProfileListener', res)
    },
    replyMessageListener: (res) => {
        console.log('replyMessageListener', res)
    },
    favouriteMessageListener: (res) => {
        console.log('favouriteMessageListener', res)
    },
    groupProfileListener: (res) => {
        console.log('groupProfileListener = (res) => { }', res)
    },
    groupMsgInfoListener: (res) => {
        console.log('groupMsgInfoListener = (res) => { }', res)
    },
    mediaUploadListener: (res) => {
        console.log('mediaUploadListener = (res) => { }', res)
    },
    blockUserListener: (res) => {
        console.log('blockUserListener = (res) => { }', res)
    },
    singleMessageDataListener: (res) => {
        console.log('singleMessageDataListener = (res) => { }', res)
    },
    muteChatListener: (res) => {
        console.log('muteChatListener = (res) => { }', res)
    },
    archiveChatListener: (res) => {
        console.log('archiveChatListener = (res) => { }', res)
    },
    userDeletedListener: (res) => {
        console.log('userDeletedListener = (res) => { }', res)
    },
    adminBlockListener: (res) => {
        console.log('adminBlockListener = (res) => { }', res)
    }
}