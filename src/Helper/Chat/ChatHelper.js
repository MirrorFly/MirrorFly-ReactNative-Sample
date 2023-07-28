import { SDK } from "../../SDK"
import { CHAT_TYPE_GROUP, CHAT_TYPE_SINGLE, MSG_DELIVERED_STATUS_ID, MSG_PROCESSING_STATUS_ID, MSG_SEEN_STATUS_ID, MSG_SENT_ACKNOWLEDGE_STATUS_ID } from "./Constant"
import { getUserIdFromJid } from "./Utility";
import store from "../../redux/store";
import { updateUploadStatus } from "../../redux/conversationSlice";

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


export const uploadFileToSDK = async (file, jid, msgId, media) => {
    const { caption = "", fileDetails: { replyTo = "", image : { playableDuration = 0 }, audioType = "", type } = {} } = file;
    const msgType = type.split('/')[0];
    let fileOptions = {
        msgId: msgId,
        caption: caption,
        duration: playableDuration,
        webWidth: media.webWidth || 0,
        webHeight: media.webHeight || 0,
        androidWidth: media.androidWidth || 0,
        androidHeight: media.androidHeight || 0,
        originalWidth: media.originalWidth || 0,
        originalHeight: media.originalHeight || 0,
        ...(msgType === "video" || msgType === "image" && { thumbImage: media?.thumb_image }),
        ...(msgType === "audio" && { audioType })
    };

    let response = {};
    if (msgType === "file") {
        response = await SDK.sendDocumentMessage(jid, file, fileOptions, replyTo);
    } else if (msgType === "image") {
        response = await SDK.sendImageMessage(jid, file, fileOptions, replyTo);
    } else if (msgType === "video") {
        response = await SDK.sendVideoMessage(jid, file, fileOptions, replyTo);
    } else if (msgType === "audio") {
        response = await SDK.sendAudioMessage(jid, file, fileOptions, replyTo);
    }
    let updateObj = {
        msgId,
        statusCode: response.statusCode,
        fromUserId: getUserIdFromJid(jid)
    };
    if (response.statusCode === 200) {
        /**
        if (msgType === "image" || msgType === "audio") {
            // const fileBlob = await fileToBlob(file);
            // indexedDb.setImage(response.fileToken, fileBlob, getDbInstanceName(msgType));
        }
        */
        updateObj.fileToken = response.fileToken;
        updateObj.thumbImage = response.thumbImage;
        // updateObj.fileKey = response.data.msgBody.media.file_key;
    } else if (response.statusCode === 500) {
        updateObj.uploadStatus = 3;
    }
    store.dispatch(updateUploadStatus(updateObj));
};

export const updateMediaUploadStatusHistory = (data, stateData) => {
    // Here Get the Current Active Chat History and Active Message
    const currentChatData = stateData[data.fromUserId];
    if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
        const currentMessage = currentChatData.messages[data.msgId];
        if (currentMessage) {
            currentMessage.msgBody.media.is_uploading = data.uploadStatus;
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

export const getUpdatedHistoryDataUpload = (data, stateData) => {
    // Here Get the Current Active Chat History and Active Message
    const currentChatData = stateData[data.fromUserId];
    if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
        const currentMessage = currentChatData.messages[data.msgId];

        if (currentMessage) {
            currentMessage.msgBody.media.is_uploading = data.uploadStatus;
            if (data.statusCode === 200) {
                currentMessage.msgBody.media.file_url = data.fileToken || "";
                currentMessage.msgBody.media.thumb_image = data.thumbImage || "";
                currentMessage.msgBody.media.file_key = data.fileKey || "";
            }
            if(data.local_path){
                currentMessage.msgBody.media.local_path = data.local_path || "";
            }

            let msgIds = Object.keys(currentChatData?.messages);
            let nextIndex = msgIds.indexOf(data.msgId) + 1;
            let nextItem = msgIds[nextIndex];

            if (nextItem) {
                let nextMessage = currentChatData.messages[nextItem];
                if (nextMessage?.msgBody?.media?.is_uploading === 0) {
                    nextMessage.msgBody.media.is_uploading = 1;

                    return {
                        ...stateData,
                        [data.fromUserId]: {
                            ...currentChatData,
                            [data.msgId]: currentMessage,
                            [nextItem]: nextMessage
                        }
                    };
                }
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
    const localUserJid = data.userJid
    const userId = localUserJid ? getUserIdFromJid(localUserJid) : "";
    if (userId === lastMessage?.publisherId) {
        newSortedData = sortedData.map((msg => {
            msg.msgStatus = getMsgStatusInOrder(msg.msgStatus, lastMessage?.msgStatus);
            return msg;
        }));
    } else newSortedData = sortedData;

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

export const getChatHistoryMessagesData = () => {
    const { chatConversationData: { data } = {} } = store.getState();
    return data;
};

/**
 * Get the active conversation user ID
 */
export const getActiveConversationChatId = () => {
    const { navigation: { fromUserJid: chatId = "" } = {} } = store.getState();
    return getUserIdFromJid(chatId);
}

/**
 * Check the give USER or GROUP ID is in the active conversation screen
 * @param {string} userOrGroupId 
 * @param {string} chatType 
 */
export const isActiveConversationUserOrGroup = (userOrGroupId, chatType = CHAT_TYPE_SINGLE) => {
    if (!userOrGroupId) return false;
    const conversationUserOrGroupId = getActiveConversationChatId();
    userOrGroupId = getUserIdFromJid(userOrGroupId);
    return conversationUserOrGroupId === userOrGroupId;
}

/**
 * Check the given user is local or not
 * @param {*} userId 
 */
export const isLocalUser = (userId = "") => {
    if (!userId) return false;
    userId = getUserIdFromJid(userId);
    const vCardData = store.getState()?.auth?.currentUserJID;
    return userId === getUserIdFromJid(vCardData);
};

