import { updateConversationMessage, updateRecentChatMessage } from "../components/chat/common/createMessage";
import { REGISTERSCREEN } from "../constant";
import { setXmppStatus } from "../redux/connectionSlice";
import { updateChatConversationHistory } from "../redux/conversationSlice";
import { navigate } from "../redux/navigationSlice";
import { updateProfileDetail } from "../redux/profileSlice";
import { updateRecentChatMessageStatus } from "../redux/recentChatDataSlice";
import { storeDeliveryStatus, storeSeenStatus } from "../redux/storageSlice";
import store from "../redux/store";
import { updateUserPresence } from "../redux/userSlice";
import * as RootNav from '../Navigation/rootNavigation'
export const callBacks = {
    connectionListener: (response) => {
        store.dispatch(setXmppStatus(response.status))
        if (response.status === "CONNECTED") {
            console.log("Connection Established");
        } else if (response.status === "DISCONNECTED") {
            console.log("Disconnected");
        } else if (response.status === "LOGOUT") {
            console.log("LOGOUT");
            store.dispatch(navigate({ screen: REGISTERSCREEN }))
            RootNav.navigate(REGISTERSCREEN)
        }
    },
    dbListener: (res) => {
        console.log('dbListener', JSON.stringify(res));
    },
    messageListener: (res) => {
        if (res.chatType === 'chat' &&
            (res.msgType === "sentMessage" ||
                res.msgType === "carbonSentMessage" ||
                res.msgType === "receiveMessage" ||
                res.msgType === "carbonReceiveMessage" ||
                res.msgType === "receiveMessage")) {
            updateRecentChatMessage(res, store.getState())
            updateConversationMessage(res, store.getState())
        }
        if (res.msgType === "carbonDelivered" || res.msgType === "delivered" || res.msgType === "seen" || res.msgType === "carbonSeen") {
            store.dispatch(updateRecentChatMessageStatus(res))
            store.dispatch(updateChatConversationHistory(res))
            store.dispatch(storeDeliveryStatus(res))
            if(res.msgType === "seen" || res.msgType === "carbonSeen"){
                store.dispatch(storeSeenStatus(res))
            }
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
    },
    presenceListener: (res) => {
        console.log('presenceListener', res)
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