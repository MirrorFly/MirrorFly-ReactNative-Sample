import { changeTimeFormat } from "../../common/TimeStamp";
import { formatUserIdToJid, isGroupChat } from "./ChatHelper";
import { GROUP_CHAT_PROFILE_UPDATED_NOTIFY, MSG_PROCESSING_STATUS, MSG_SENT_STATUS_CARBON } from "./Constant";


export const getUserIdFromJid = (userJid) => {
    return userJid && userJid.includes("@") ? userJid.split("@")[0] : userJid;
};

export const getMessageObjSender = async (dataObj, idx) => {
    const {
        jid,
        msgType,
        userProfile,
        msgId,
        chatType,
        message = "",
        file,
        fileOptions = {},
        replyTo,
        fromUserJid
    } = dataObj;
    const timestamp = Date.now() * 1000;
    const senderId = userProfile.fromUser;
    const msgBody = {
        message_type: msgType,
        nickName: userProfile.nickName,
        ...(replyTo && { replyTo }),
    };

    if (msgType === "text") {
        msgBody.message = message;
    } else {
        let webWidth = 0,
            webHeight = 0,
            androidWidth = 0,
            androidHeight = 0,
            originalWidth = 0,
            originalHeight = 0;

        if (msgType === "image") {
          /**  let mediaFileURL = fileOptions.blobUrl;
            const mediaDimension = await getMediaDimension(mediaFileURL, msgType);
            ({ webWidth, webHeight, androidWidth, androidHeight } = mediaDimension);*/ 
        } else if (msgType === "video") {
            /**({
                webWidth,
                webHeight,
                androidWidth,
                androidHeight,
                originalWidth,
                originalHeight,
            } = fileDetails);*/
        }
        msgBody.message = "";
        msgBody.media = {
            file,
            caption: fileOptions.caption || "",
            fileName: fileOptions.fileName,
            file_size: fileOptions.fileSize,
            is_downloaded: 0,
            is_uploading: idx === 0 ? 1 : 0,
            /**file_url: fileOptions.blobUrl,
            duration: fileOptions.duration || 0,
            local_path: "",
            thumb_image: fileOptions.thumbImage,
            webWidth: webWidth,
            webHeight: webHeight,
            androidWidth: androidWidth,
            androidHeight: androidHeight,
            originalWidth,
            originalHeight,
            audioType: fileOptions.audioType,*/
        };
    }

    const retunVal = {
        chatType: chatType,
        createdAt: changeTimeFormat(timestamp),
        deleteStatus: 0,
        favouriteBy: "0",
        favouriteStatus: 0,
        fromUserId: senderId,
        fromUserJid: fromUserJid,
        msgBody: msgBody,
        msgId: msgId,
        msgStatus: 3,
        timestamp: timestamp,
        msgType: MSG_PROCESSING_STATUS,
        publisherId: senderId,
        publisherJid: fromUserJid,
        ...(isGroupChat(chatType) && {
            fromUserId: getUserIdFromJid(jid),
            fromUserJid: jid,
        }),
    };
    return retunVal
};

export const getRecentChatMsgObj = (dataObj) => {
    const {
        jid,
        msgType,
        userProfile,
        msgId,
        chatType,
        message = "",
        fileOptions = {},
    } = dataObj;

    const createdAt = changeTimeFormat(Date.now() * 1000);
    const senderId = userProfile.fromUser;
    const msgBody = {
        message_type: msgType,
        nickName: userProfile.nickName,
    };

    if (msgType === "text") {
        msgBody.message = message;
    } else {
        msgBody.media = {
            caption: fileOptions.caption || "",
            fileName: fileOptions.fileName,
            file_size: fileOptions.fileSize,
            is_downloaded: 0,
            is_uploading: 1,
            local_path: "",
            /**file_url: fileOptions.blobUrl,
            duration: fileOptions.duration || 0,
            thumb_image: fileOptions.thumbImage,
            audioType: fileOptions.audioType,*/
        };
    }
    const fromUserId = getUserIdFromJid(jid);

    return {
        chatType: chatType,
        createdAt: createdAt,
        deleteStatus: 0,
        fromUserId: fromUserId,
        msgBody: msgBody,
        msgId: msgId,
        msgStatus: 3,
        muteStatus: 0,
        msgType: msgType,
        notificationTo: "",
        publisherId: senderId,
        timestamp: new Date(createdAt).getTime(),
        toUserId: fromUserId,
        unreadCount: 0,
        filterBy: fromUserId,
    };
};

export const getMessageObjReceiver = (messgeObject, newChatTo) => {
    const {
        msgType,
        msgBody,
        chatType,
        msgId,
        publisherId,
        publisherJid,
        profileUpdatedStatus,
        msgStatus,
    } = messgeObject;
    const timestamp = Date.now() * 1000;
    return {
        chatType: chatType,
        createdAt: changeTimeFormat(timestamp),
        deleteStatus: 0,
        favouriteBy: "0",
        favouriteStatus: 0,
        fromUserId: newChatTo,
        fromUserJid: formatUserIdToJid(newChatTo, chatType),
        msgBody: msgBody,
        msgId: msgId,
        msgStatus: msgType === MSG_SENT_STATUS_CARBON ? msgStatus : 1,
        timestamp: timestamp,
        publisherId,
        publisherJid,
        ...(msgType === GROUP_CHAT_PROFILE_UPDATED_NOTIFY && {
            profileUpdatedStatus,
            msgType,
            userId: messgeObject.userId,
            userJid: messgeObject.userJid,
            msgId:
                messgeObject.msgId ||
                (messgeObject.timestamp.toString()) ||
                uuidv4(),
        }),
    };
};