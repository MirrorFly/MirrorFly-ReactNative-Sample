import { SDK } from "../../SDK"
import { CHAT_TYPE_GROUP, CHAT_TYPE_SINGLE, MSG_DELIVERED_STATUS_ID, MSG_PROCESSING_STATUS_ID, MSG_SEEN_STATUS_ID, MSG_SENT_ACKNOWLEDGE_STATUS_ID } from "./Constant"
import { getUserIdFromJid } from "./Utility";
import store from "../../redux/store";

export const isGroupChat = (chatType) => chatType === CHAT_TYPE_GROUP;
export const isSingleChat = (chatType) => chatType === CHAT_TYPE_SINGLE;

export const formatUserIdToJid = (userId, chatType = CHAT_TYPE_SINGLE) => {
    const jidResponse = chatType === CHAT_TYPE_SINGLE ? SDK.getJid(userId) : SDK.getGroupJid(userId)
    if (jidResponse.statusCode === 200) {
        return jidResponse.userJid || jidResponse.groupJid
    }
}

export const getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

export const concatMessageArray = (activeData, stateData, uniqueId, sortId) => {
    const updateMessage = [
        ...stateData,
        ...activeData,
    ]
    return getUniqueListBy(updateMessage, uniqueId).sort((a, b) => {
        if (a[sortId] > b[sortId]) return 1;
        else if (a[sortId] < b[sortId]) return -1;
        else return 0;
    });
}

/**
 * keepin the order of the message delivery status
 * 3 - processing, 0 - sent, 1 - delivered to remote user, 2 - seen by remote user
 */
export const msgStatusOrder = [MSG_PROCESSING_STATUS_ID, MSG_SENT_ACKNOWLEDGE_STATUS_ID, MSG_DELIVERED_STATUS_ID, MSG_SEEN_STATUS_ID];

export const getMsgStatusInOrder = (currentStatus, newStatus) => {
    const currentStatusIndex = msgStatusOrder.indexOf(currentStatus);
    const newStatusIndex = msgStatusOrder.indexOf(newStatus);
    if (newStatusIndex > currentStatusIndex) {
        return newStatus;
    }
    return currentStatus;
}

export const arrayToObject = (arr, key) => {
    return arr.reduce((obj, item) => {
        obj[item[key]] = item;
        return obj;
    }, {});
};

export const getChatHistoryData = (data, stateData) => {
    // To Avoid Unnecessary Looping, We are Using Key Value Pair for Chat and Messages
    // Eg: userId: {} or groupId: {} or msgId: {}
    const chatId = getUserIdFromJid(data.userJid || data.groupJid);
    const state = Object.keys(stateData).length > 0 ? stateData[chatId]?.messages || {} : {};
    const sortedData = concatMessageArray(data.data, Object.values(state), "msgId", "timestamp");
    const lastMessage = sortedData[sortedData.length - 1];
    let newSortedData;
    console.log(data.userJid, '\n ***userJid')
    const localUserJid = data.userJid
    const userId = localUserJid ? getUserIdFromJid(localUserJid) : "";
    console.log(lastMessage)
    console.log(lastMessage.publisherId)
    if (userId === lastMessage?.publisherId) {
        newSortedData = sortedData.map((msg => {
            // msg.msgStatus = getMsgStatusInOrder(msg.msgStatus, lastMessage?.msgStatus);
            return msg;
        }));
    } else newSortedData = sortedData;

    // let isScrollNeeded = true;
    // if (data.fetchLimit) {
    //     isScrollNeeded = data.data.length === data.fetchLimit; // To Check If this is the Last Message in the Chat, So no Scroll Fetch is Needed
    // }
    const finalData = { messages: arrayToObject(newSortedData, "msgId") };

    let datata = {
        ...stateData,
        [chatId]: finalData
    };
    return datata
};

export const getUpdatedHistoryData = (data, stateData) => {
    // Here Get the Current Active Chat History and Active Message
    const currentChatData = stateData[data.fromUserId];
    const msgIds = currentChatData?.messages ? Object.keys(currentChatData?.messages) : {};
    if (msgIds.length > 0) {
        const currentMessage = currentChatData.messages[data.msgId];
        if (currentMessage) {
            const msgStatus = getMsgStatusInOrder(currentMessage.msgStatus, data.msgStatus);
            currentMessage.msgStatus = msgStatus;
            currentMessage.msgType = data.msgType;
            if (currentMessage?.msgBody?.media && data.msgType === "acknowledge") {
                currentMessage.msgBody.media.is_uploading = 2
            }

            // Updating Old Msg Statuses to Current Status
            const currentMessageIndex = msgIds.indexOf(data.msgId);
            for (let i = 0; i < msgIds.length && i <= currentMessageIndex; i++) {
                const message = currentChatData?.messages[msgIds[i]];
                currentChatData.messages[msgIds[i]] = {
                    ...message,
                    ...(message.msgStatus !== 3 && {
                        msgStatus: getMsgStatusInOrder(message.msgStatus, msgStatus)
                    })
                };
            }

            return {
                ...stateData,
                [data.fromUserId]: {
                    ...currentChatData,
                    [data.msgId]: currentMessage
                }
            };
        }
    }
    return {
        ...stateData
    };
};

export const getChatMessageHistoryById = (id) => {
    const { chatConversationData } = store.getState() || {};
    const { data = {} } = chatConversationData
    if (data[id]?.messages) return Object.values(data[id]?.messages);
    return [];
};