import { formatUserIdToJid } from "../../../Helper/Chat/ChatHelper";
import { getMessageObjReceiver } from "../../../Helper/Chat/Utility";
import { changeTimeFormat } from "../../../common/TimeStamp";
import { addChatConversationHistory } from "../../../redux/conversationSlice";
import { updateRecentChat } from "../../../redux/recentChatDataSlice";
import store from "../../../redux/store";

export const updateRecentChatMessage = (messgeObject, stateObject) => {
    const { recentChatData } = stateObject;
    const { rosterData: { recentChatNames } = {} } = recentChatData;
    if (!recentChatNames) {
        return;
    }
    const { msgType, fromUserId, toUserId, msgId, timestamp, chatType, msgBody, publisherId, profileDetails } = messgeObject;

    const newChatTo = msgType === "carbonSentMessage" ? toUserId : fromUserId;
    const newChatFrom = chatType === "groupchat" ? publisherId : fromUserId;
    const updateTime = changeTimeFormat(timestamp);
    const leftGroup = !msgType && msgType === "receiveMessage" && msgBody === "3";
    const x = new Date();
    let UTCseconds = x.getTime() + x.getTimezoneOffset() * 60 * 1000;

    // Temp - Reorder Issue Fix
    if (Number(UTCseconds).toString().length > 13) UTCseconds = UTCseconds / 1000;

    /**
     * update the chat message if message alredy exist in recent chat
     */
    if (recentChatNames.indexOf(newChatTo) !== -1) {
        const constructNewMessage = {
            ...messgeObject,
            MessageType: msgType ? msgType : msgBody.message_type || "",
            msgType: msgBody.message_type ? msgBody.message_type : msgType,
            publisher: newChatFrom,
            publisherId: newChatFrom,
            leftGroup: leftGroup,
            filterBy: newChatTo,
            fromUserId: newChatTo,
            chatType: chatType,
            createdAt: updateTime,
            timestamp: parseInt(UTCseconds)
        };
        store.dispatch(updateRecentChat(constructNewMessage));
    } else {
        /**
         * New chat that is not alreay exist in recent chat
         */
        const newMessage = {
            archiveStatus: 0,
            chatType: chatType,
            msgBody: msgBody,
            msgId: msgId,
            msgStatus: 0,
            muteStatus: 0,
            msgType: msgBody.message_type ? msgBody.message_type : msgType,
            deleteStatus: 0,
            unreadCount: 0,
            fromUserId: newChatTo,
            timestamp: parseInt(UTCseconds),
            publisher: newChatFrom,
            publisherId: newChatFrom,
            toUserId: toUserId,
            createdAt: updateTime,
            filterBy: newChatTo,
            profileDetails: {
                ...profileDetails
            }
        };
        store.dispatch(updateRecentChat(newMessage));
    }
};

export const updateConversationMessage = (messgeObject, currentState) => {
    const newChatTo = messgeObject.msgType === "carbonSentMessage" ? messgeObject.toUserId : messgeObject.fromUserId;
    const conversationChatObj = getMessageObjReceiver(messgeObject, messgeObject.fromUserId);
    const dispatchData = {
        data: [conversationChatObj],
        ...({ userJid: formatUserIdToJid(newChatTo) })
    };
    store.dispatch(addChatConversationHistory(dispatchData));
};