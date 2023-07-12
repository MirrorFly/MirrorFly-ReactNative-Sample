import { updateConversationMessage, updateRecentChatMessage } from "../components/chat/common/createMessage";
import { REGISTERSCREEN } from "../constant";
import { getReceiveMessage, updateMessageStatus } from "../redux/chatSlice";
import { updateChatConversationHistory } from "../redux/conversationSlice";
import { navigate } from "../redux/navigationSlice";
import { updateProfileDetail } from "../redux/profileSlice";
import { updateRecentChatMessageStatus } from "../redux/recentChatDataSlice";
import { storeDeliveryStatus, storeSeenStatus } from "../redux/storageSlice";
import store from "../redux/store";
import { updateUserPresence } from "../redux/userSlice";

export const callBacks = {
    connectionListener: (response) => {
        if (response.status === "CONNECTED") {
            console.log("Connection Established");
        } else if (response.status === "DISCONNECTED") {
            console.log("Disconnected");
        } else if (response.status === "LOGOUT") {
            console.log("LOGOUT");
            store.dispatch(navigate({ screen: REGISTERSCREEN }))
        }
    },
    dbListener: (res) => {
        console.log('dbListener', JSON.stringify(res));
    },
    messageListener: (res) => {
        if (
            res.msgType === "sentMessage" ||
            res.msgType === "carbonSentMessage" ||
            res.msgType === "receiveMessage" ||
            res.msgType === "carbonReceiveMessage" ||
            res.msgType === "receiveMessage") {
            updateRecentChatMessage(res, store.getState())
            updateConversationMessage(res, store.getState())
        }
        if (res.msgType === "carbonDelivered" || res.msgType === "delivered" || res.msgType === "seen" || res.msgType === "carbonSeen") {
            store.dispatch(updateRecentChatMessageStatus(res))
            store.dispatch(updateChatConversationHistory(res))
            // store.dispatch(addMessageInfoUpdate(
            //     {
            //         id: uuidv4(),
            //         activeUserId: res.publisherId,
            //         time: res.timestamp,
            //         messageStatus:
            //             res.msgType === MSG_DELIVERED_STATUS_CARBON || res.msgType === MSG_DELIVERED_STATUS
            //                 ? MSG_DELIVERED_STATUS_ID
            //                 : MSG_SEEN_STATUS_ID
            //     }))
        }
        if (res.msgType === "acknowledge" && res.type === "acknowledge") {
            store.dispatch(updateRecentChatMessageStatus(res))
            store.dispatch(updateChatConversationHistory(res))
        }
        // switch (res.msgType) {
        //     case 'receiveMessage':
        //         store.dispatch(getReceiveMessage(res))
        //         break;
        //     case 'acknowledge':
        //     case 'delivered':
        //         store.dispatch(storeDeliveryStatus(res))
        //         // break;
        //     case 'seen':
        //         if (res.fromUserJid) {
        //             store.dispatch(storeSeenStatus(res))
        //             store.dispatch(updateMessageStatus(res))
        //         }
        //         break;
        //     default:
        //         break;
        // }
    },
    presenceListener: (res) => {
        store.dispatch(updateUserPresence(res))
    },
    userProfileListener: (res) => {
        console.log('userProfileListener', res)
        store.dispatch(updateProfileDetail(res))
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