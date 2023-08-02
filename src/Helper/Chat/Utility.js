import { changeTimeFormat } from '../../common/TimeStamp';
import { formatUserIdToJid, isGroupChat } from './ChatHelper';
import {
  GROUP_CHAT_PROFILE_UPDATED_NOTIFY,
  MAX_HEIGHT_AND,
  MAX_HEIGHT_WEB,
  MAX_WIDTH_AND,
  MAX_WIDTH_WEB,
  MIN_HEIGHT_AND,
  MIN_HEIGHT_WEB,
  MIN_WIDTH_AND,
  MIN_WIDTH_WEB,
  MSG_PROCESSING_STATUS,
  MSG_SENT_STATUS_CARBON,
} from './Constant';
import { v4 as uuidv4 } from 'uuid';

export const getUserIdFromJid = userJid => {
  return userJid && userJid.includes('@') ? userJid.split('@')[0] : userJid;
};

export const getThumbBase64URL = thumb => `data:image/png;base64,${thumb}`;

// Recalculates Image/Video Width and Height for Multiple Platforms
export const calculateWidthAndHeight = (width, height) => {
  let response = {};

  switch (true) {
    // Horizontal Video
    case width > height:
      let resultHeight = Math.round((height / width) * MAX_WIDTH_WEB),
        resultHeightAnd = Math.round((height / width) * MAX_WIDTH_AND);

      response = {
        webWidth: MAX_WIDTH_WEB,
        webHeight:
          resultHeight > MIN_HEIGHT_WEB ? resultHeight : MIN_HEIGHT_WEB,
        androidWidth: MAX_WIDTH_AND,
        androidHeight:
          resultHeightAnd > MIN_HEIGHT_AND ? resultHeightAnd : MIN_HEIGHT_AND,
      };
      break;

    // Vertical Video
    case width < height:
      response = {
        webWidth: MIN_WIDTH_WEB,
        webHeight: MAX_HEIGHT_WEB,
        androidWidth: MIN_WIDTH_AND,
        androidHeight: MAX_HEIGHT_AND,
      };
      break;

    // Default/Square Video
    default:
      response = {
        webWidth: MAX_WIDTH_WEB,
        webHeight: MAX_WIDTH_WEB,
        androidWidth: MAX_WIDTH_AND,
        androidHeight: MAX_WIDTH_AND,
      };
      break;
  }
  return response;
};

export const getMessageObjSender = async (dataObj, idx) => {
  const {
    jid,
    msgType,
    userProfile,
    msgId,
    chatType,
    message = '',
    file,
    fileOptions = {},
    fileDetails,
    replyTo,
    fromUserJid,
  } = dataObj;
  const timestamp = Date.now() * 1000;
  const senderId = userProfile.fromUser;
  const msgBody = {
    message_type: msgType,
    nickName: userProfile.nickName,
    ...(replyTo && { replyTo }),
  };

  if (msgType === 'text') {
    msgBody.message = message;
  } else {
    let webWidth = 0,
      webHeight = 0,
      androidWidth = 0,
      androidHeight = 0,
      originalWidth = 0,
      originalHeight = 0;
    if (msgType === 'image') {
      const mediaDimension = calculateWidthAndHeight(
        fileDetails?.image?.width,
        fileDetails?.image?.height,
      );
      ({ webWidth, webHeight, androidWidth, androidHeight } = mediaDimension);
    } else if (msgType === 'video') {
      ({ originalWidth, originalHeight } = fileDetails);
      const mediaDimension = calculateWidthAndHeight(
        fileDetails?.image?.width,
        fileDetails?.image?.height,
      );
      ({ webWidth, webHeight, androidWidth, androidHeight } = mediaDimension);
    }
    msgBody.message = '';
    msgBody.media = {
      file,
      caption: fileOptions.caption || '',
      fileName: fileOptions.fileName,
      file_size: fileOptions.fileSize,
      is_downloaded: 0,
      is_uploading: idx === 0 ? 1 : 0,
      file_url: '',
      duration: fileOptions.duration || 0,
      local_path: '',
      thumb_image: fileOptions.thumbImage,
      webWidth: webWidth,
      webHeight: webHeight,
      androidWidth: androidWidth,
      androidHeight: androidHeight,
      originalWidth,
      originalHeight,
    };
  }

  const retunVal = {
    chatType: chatType,
    createdAt: changeTimeFormat(timestamp),
    deleteStatus: 0,
    favouriteBy: '0',
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
  return retunVal;
};

export const getRecentChatMsgObj = dataObj => {
  const {
    jid,
    msgType,
    userProfile,
    msgId,
    chatType,
    message = '',
    fileOptions = {},
  } = dataObj;

  const createdAt = changeTimeFormat(Date.now() * 1000);
  const senderId = userProfile.fromUser;
  const msgBody = {
    message_type: msgType,
    nickName: userProfile.nickName,
  };

  if (msgType === 'text') {
    msgBody.message = message;
  } else {
    msgBody.media = {
      caption: fileOptions.caption || '',
      fileName: fileOptions.fileName,
      file_size: fileOptions.fileSize,
      is_downloaded: 0,
      is_uploading: 1,
      local_path: '',
      file_url: '',
      duration: fileOptions.duration || 0,
      thumb_image: fileOptions.thumbImage,
      audioType: fileOptions.audioType,
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
    notificationTo: '',
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
    favouriteBy: '0',
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
        messgeObject.msgId || messgeObject.timestamp.toString() || uuidv4(),
    }),
  };
};

export const setDurationSecToMilli = seconds => {
  return seconds * 1000;
};

export const millisToMinutesAndSeconds = millis => {
  let minutes = Math.floor(millis / 60000);
  let seconds = parseInt((millis % 60000) / 1000);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};
