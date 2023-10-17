import SDK from '../../SDK/SDK';
import { changeTimeFormat } from '../../common/TimeStamp';
import { updateRecentChat } from '../../redux/Actions/RecentChatAction';
import { batch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { getThumbImage, getVideoThumbImage } from '..';
import {
  addChatConversationHistory,
  updateUploadStatus,
} from '../../redux/Actions/ConversationAction';
import store from '../../redux/store';
import {
  CHAT_TYPE_GROUP,
  CHAT_TYPE_SINGLE,
  DOCUMENT_FORMATS,
  MSG_DELIVERED_STATUS_ID,
  MSG_PROCESSING_STATUS_ID,
  MSG_SEEN_STATUS_ID,
  MSG_SENT_ACKNOWLEDGE_STATUS_ID,
} from './Constant';
import {
  getMessageObjSender,
  getRecentChatMsgObj,
  getUserIdFromJid,
} from './Utility';
import { updateRosterData } from '../../redux/Actions/rosterAction';
import {
  DELETE_MESSAGE_FOR_EVERYONE,
  DELETE_MESSAGE_FOR_ME,
} from '../../redux/Actions/Constants';
import { isActiveChatScreenRef } from '../../components/ChatConversation';

export const isGroupChat = chatType => chatType === CHAT_TYPE_GROUP;
export const isSingleChat = chatType => chatType === CHAT_TYPE_SINGLE;

export const formatUserIdToJid = (userId, chatType = CHAT_TYPE_SINGLE) => {
  const currentUserJid = store.getState().auth?.currentUserJID || '';
  if (chatType === CHAT_TYPE_SINGLE) {
    return userId?.includes('@')
      ? userId
      : `${userId}@${currentUserJid?.split('@')[1] || ''}`;
  }
  const jidResponse = SDK.getJid(userId);
  if (jidResponse.statusCode === 200) {
    return jidResponse.groupJid;
  }
};

export const getUniqueListBy = (arr, key) => {
  return [...new Map(arr.map(item => [item[key], item])).values()];
};

export const uploadFileToSDK = async (file, jid, msgId, media) => {
  const {
    caption = '',
    fileDetails: { replyTo = '', duration = 0, audioType = '', type } = {},
  } = file;

  const isDocument = DOCUMENT_FORMATS.includes(type);
  const msgType = isDocument ? 'file' : type.split('/')[0];
  let fileOptions = {
    msgId: msgId,
    caption: caption,
    duration: duration,
    webWidth: media.webWidth || 0,
    webHeight: media.webHeight || 0,
    androidWidth: media.androidWidth || 0,
    androidHeight: media.androidHeight || 0,
    originalWidth: media.originalWidth || 0,
    originalHeight: media.originalHeight || 0,
    ...((msgType === 'video' || msgType === 'image') && {
      thumbImage: media?.thumb_image,
    }),
    ...(msgType === 'audio' && { audioType }),
  };

  let response = {};
  if (msgType === 'file') {
    response = await SDK.sendDocumentMessage(
      jid,
      file.fileDetails,
      fileOptions,
      replyTo,
    );
  } else if (msgType === 'image') {
    response = await SDK.sendImageMessage(
      jid,
      file.fileDetails,
      fileOptions,
      replyTo,
    );
  } else if (msgType === 'video') {
    response = await SDK.sendVideoMessage(
      jid,
      file.fileDetails,
      fileOptions,
      replyTo,
    );
  } else if (msgType === 'audio') {
    response = await SDK.sendAudioMessage(
      jid,
      file.fileDetails,
      fileOptions,
      replyTo,
    );
  }
  let updateObj = {
    msgId,
    statusCode: response.statusCode,
    fromUserId: getUserIdFromJid(jid),
  };
  console.log(response, 'uploadfile response');
  if (response.statusCode === 200) {
    /**
        if (msgType === "image" || msgType === "audio") {
            // const fileBlob = await fileToBlob(file);
            // indexedDb.setImage(response.fileToken, fileBlob, getDbInstanceName(msgType));
        }
        */
    updateObj.fileToken = response.fileToken;
    updateObj.thumbImage = response.thumbImage;
  } else if (response.statusCode === 500) {
    updateObj.uploadStatus = 3;
  }
  store.dispatch(updateUploadStatus(updateObj));
};

export const updateMediaUploadStatusHistory = (data, stateData) => {
  // Here Get the Current Active Chat History and Active Message
  const currentChatData = stateData[data.fromUserId];
  if (
    currentChatData?.messages &&
    Object.keys(currentChatData?.messages).length > 0
  ) {
    const currentMessage = currentChatData.messages[data.msgId];
    if (currentMessage) {
      currentMessage.msgBody.media.is_uploading = data.uploadStatus;
      return {
        ...stateData,
        [data.fromUserId]: {
          ...currentChatData,
          [data.msgId]: currentMessage,
        },
      };
    }
  }
  return {
    ...stateData,
  };
};

export const updateDeletedMessageInHistory = (actionType, data, stateData) => {
  // Here Get the Current Active Chat History and Active Message
  const currentChatData = stateData[data.fromUserId];

  if (currentChatData) {
    if (actionType === DELETE_MESSAGE_FOR_ME) {
      for (const msgId of data.msgIds) {
        if (currentChatData.messages[msgId]) {
          currentChatData.messages[msgId].deleteStatus = 2;
        }
      }
    } else if (actionType === DELETE_MESSAGE_FOR_EVERYONE) {
      const messageIds = data.msgId.split(',');
      for (const msgId of messageIds) {
        if (currentChatData.messages[msgId]) {
          currentChatData.messages[msgId].deleteStatus = 1;
        }
      }
    }

    return {
      ...stateData,
      [data.fromUserId]: {
        ...currentChatData,
      },
    };
  }
  return {
    ...stateData,
  };
};

export const getUpdatedHistoryDataUpload = (data, stateData) => {
  // Here Get the Current Active Chat History and Active Message
  const currentChatData = stateData[data.fromUserId];
  if (
    currentChatData?.messages &&
    Object.keys(currentChatData?.messages).length > 0
  ) {
    const currentMessage = currentChatData.messages[data.msgId];

    if (currentMessage) {
      currentMessage.msgBody.media.is_uploading = data.uploadStatus;
      if (data.statusCode === 200) {
        currentMessage.msgBody.media.file_url = data.fileToken || '';
        currentMessage.msgBody.media.thumb_image = data.thumbImage || '';
        currentMessage.msgBody.media.file_key = data.fileKey || '';
        currentMessage.msgBody.media.is_downloaded = data.is_downloaded || '';
      }
      if (data.local_path) {
        currentMessage.msgBody.media.local_path = data.local_path || '';
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
              [nextItem]: nextMessage,
            },
          };
        }
      }
      return {
        ...stateData,
        [data.fromUserId]: {
          ...currentChatData,
          [data.msgId]: currentMessage,
        },
      };
    }
  }
  return {
    ...stateData,
  };
};

export const concatMessageArray = (activeData, stateData, uniqueId, sortId) => {
  const updateMessage = [...stateData, ...activeData];
  return getUniqueListBy(updateMessage, uniqueId).sort((a, b) => {
    if (a[sortId] > b[sortId]) return 1;
    else if (a[sortId] < b[sortId]) return -1;
    else return 0;
  });
};

/**
 * keepin the order of the message delivery status
 * 3 - processing, 0 - sent, 1 - delivered to remote user, 2 - seen by remote user
 */
export const msgStatusOrder = [
  MSG_PROCESSING_STATUS_ID,
  MSG_SENT_ACKNOWLEDGE_STATUS_ID,
  MSG_DELIVERED_STATUS_ID,
  MSG_SEEN_STATUS_ID,
];

export const getMsgStatusInOrder = (currentStatus, newStatus) => {
  const currentStatusIndex = msgStatusOrder.indexOf(currentStatus);
  const newStatusIndex = msgStatusOrder.indexOf(newStatus);
  if (newStatusIndex > currentStatusIndex) {
    return newStatus;
  }
  return currentStatus;
};

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
  const state =
    Object.keys(stateData).length > 0 ? stateData[chatId]?.messages || {} : {};
  const sortedData = concatMessageArray(
    data.data,
    Object.values(state),
    'msgId',
    'timestamp',
  );
  const lastMessage = sortedData[sortedData.length - 1];
  let newSortedData;
  const localUserJid = data.userJid;
  const userId = localUserJid ? getUserIdFromJid(localUserJid) : '';
  if (userId === lastMessage?.publisherId) {
    newSortedData = sortedData.map(msg => {
      msg.msgStatus = getMsgStatusInOrder(
        msg.msgStatus,
        lastMessage?.msgStatus,
      );
      return msg;
    });
  } else {
    newSortedData = sortedData;
  }

  const finalData = { messages: arrayToObject(newSortedData, 'msgId') };

  return {
    ...stateData,
    [chatId]: finalData,
  };
};

export const getUpdatedHistoryData = (data, stateData) => {
  // Here Get the Current Active Chat History and Active Message
  const currentChatData = stateData[data.fromUserId];
  const msgIds = currentChatData?.messages
    ? Object.keys(currentChatData?.messages)
    : {};
  if (msgIds.length > 0) {
    const currentMessage = currentChatData.messages[data.msgId];
    if (currentMessage) {
      const msgStatus = getMsgStatusInOrder(
        currentMessage.msgStatus,
        data.msgStatus,
      );
      currentMessage.msgStatus = msgStatus;
      currentMessage.msgType = data.msgType;
      if (currentMessage?.msgBody?.media && data.msgType === 'acknowledge') {
        currentMessage.msgBody.media.is_uploading = 2;
      }

      /* commenting the below code as the status update callback will be triggered for every single message, so no need to update the previous messages statuses
      and also the below code spread the actual data without checking any condition whether the msgStatus is not equal or same, so it causes unwanted rerendering and makes the app perform slow

      // Updating Old Msg Statuses to Current Status
      const currentMessageIndex = msgIds.indexOf(data.msgId);
      for (let i = 0; i < msgIds.length && i <= currentMessageIndex; i++) {
        const message = currentChatData?.messages[msgIds[i]];
        currentChatData.messages[msgIds[i]] = {
          ...message,
          ...(message.msgStatus !== 3 && {
            msgStatus: getMsgStatusInOrder(message.msgStatus, msgStatus),
          }),
        };
      }
      */

      return {
        ...stateData,
        [data.fromUserId]: {
          ...currentChatData,
          [data.msgId]: currentMessage,
        },
      };
    }
  }
  return {
    ...stateData,
  };
};

export const getChatMessageHistoryById = id => {
  const { chatConversationData } = store.getState() || {};
  const { data = {} } = chatConversationData;
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
  const { navigation: { fromUserJid: chatId = '' } = {} } = store.getState();
  return getUserIdFromJid(chatId);
};

/**
 * Check the give USER or GROUP ID is in the active conversation screen
 * @param {string} userOrGroupId
 * @param {string} chatType
 */
export const isActiveConversationUserOrGroup = (
  userOrGroupId,
  chatType = CHAT_TYPE_SINGLE,
) => {
  if (!userOrGroupId) {
    return false;
  }
  const conversationUserOrGroupId = getActiveConversationChatId();
  userOrGroupId = getUserIdFromJid(userOrGroupId);
  return (
    conversationUserOrGroupId === userOrGroupId && isActiveChatScreenRef.current
  );
};

/**
 * Check the given user is local or not
 * @param {*} userId
 */
export const isLocalUser = (userId = '') => {
  if (!userId) {
    return false;
  }
  userId = getUserIdFromJid(userId);
  const vCardData = store.getState()?.auth?.currentUserJID;
  return userId === getUserIdFromJid(vCardData);
};

/**
 * getMessageFromHistoryById
 * @param {*} chatId @example '919876543210'
 * @param {*} msgId  @example 'message-id'
 */
export const getMessageFromHistoryById = (chatId, msgId) => {
  const { chatConversationData: { data } = {} } = store.getState();
  if (
    data[chatId]?.messages &&
    Object.keys(data[getUserIdFromJid(chatId)]?.messages).length > 0
  ) {
    return data[chatId]?.messages[msgId] || {};
  }
  return {};
};

const sendMediaMessage = async (
  messageType,
  files,
  chatType,
  fromUserJid,
  toUserJid,
  userProfile,
) => {
  let jidSendMediaMessage = toUserJid;
  if (messageType === 'media') {
    let mediaData = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i],
        msgId = uuidv4();

      const {
        caption = '',
        fileDetails = {},
        fileDetails: {
          fileSize,
          filename,
          duration,
          uri,
          type,
          replyTo = '',
        } = {},
      } = file;

      const isDocument = DOCUMENT_FORMATS.includes(type);
      const msgType = isDocument ? 'file' : type.split('/')[0];
      let thumbImage = msgType === 'image' ? await getThumbImage(uri) : '';
      thumbImage =
        msgType === 'video' ? await getVideoThumbImage(uri) : thumbImage;
      let fileOptions = {
        fileName: filename,
        fileSize: fileSize,
        caption: caption,
        uri: uri,
        duration: duration,
        msgId: msgId,
        thumbImage: thumbImage,
      };

      const dataObj = {
        jid: jidSendMediaMessage,
        msgType,
        userProfile,
        chatType: chatType,
        msgId,
        file,
        fileOptions,
        fileDetails: fileDetails,
        fromUserJid: fromUserJid,
        replyTo,
      };
      const conversationChatObj = getMessageObjSender(dataObj, i);
      mediaData[msgId] = conversationChatObj;
      const recentChatObj = getRecentChatMsgObj(dataObj);

      const dispatchData = {
        data: [conversationChatObj],
        ...(isSingleChat(chatType)
          ? { userJid: jidSendMediaMessage }
          : { groupJid: jidSendMediaMessage }),
      };
      batch(() => {
        store.dispatch(addChatConversationHistory(dispatchData));
        store.dispatch(updateRecentChat(recentChatObj));
      });
    }
  }
};

const parseAndSendMessage = async (
  message,
  chatType,
  messageType,
  fromUserJid,
  toUserJid,
  userProfile,
) => {
  const { content, replyTo = '' } = message;
  content[0].fileDetails.replyTo = replyTo;
  sendMediaMessage(
    messageType,
    content,
    chatType,
    fromUserJid,
    toUserJid,
    userProfile,
  );
};

export const sendMessageToUserOrGroup = async (
  message,
  fromUserJid,
  userProfile,
  toUserJid,
  chatType = 'chat',
) => {
  let messageType = message.type;

  if (messageType === 'media') {
    parseAndSendMessage(
      message,
      chatType,
      messageType,
      fromUserJid,
      toUserJid,
      userProfile,
    );
    return;
  }

  if (message.content !== '') {
    let jid = toUserJid;
    let msgId = uuidv4();
    const dataObj = {
      jid: jid,
      msgType: 'text',
      message: message.content,
      userProfile,
      chatType: chatType,
      msgId,
      fromUserJid: fromUserJid,
    };
    const conversationChatObj = getMessageObjSender(dataObj);
    const recentChatObj = getRecentChatMsgObj(dataObj);
    const dispatchData = {
      data: [conversationChatObj],
      ...(isSingleChat(chatType) ? { userJid: jid } : { groupJid: jid }), // check this when working for group chat
    };
    batch(() => {
      store.dispatch(addChatConversationHistory(dispatchData));
      store.dispatch(updateRecentChat(recentChatObj));
    });
    await SDK.sendTextMessage(jid, message.content, msgId, message.replyTo);
  }
};

export const getLocalUserDetails = () => {
  const state = store.getState();
  return state.profile?.profileDetails;
};

export const isSingleChatJID = jid => {
  return !jid.includes('mix');
};

export const getRecentChatMsgObjForward = (originalMsg, toJid, newMsgId) => {
  const timestamp = Date.now() * 1000;
  const createdAt = changeTimeFormat(timestamp);
  const vcardData = getLocalUserDetails();
  const senderId = vcardData.fromUser;

  return {
    ...originalMsg,
    timestamp: timestamp,
    createdAt: createdAt,
    msgStatus: 3,
    msgId: newMsgId,
    fromUserJid: toJid,
    fromUserId: getUserIdFromJid(toJid),
    chatType: isSingleChatJID(toJid) ? CHAT_TYPE_SINGLE : CHAT_TYPE_GROUP,
    publisherId: senderId,
    deleteStatus: 0,
    notificationTo: '',
    toUserId: getUserIdFromJid(toJid),
    unreadCount: 0,
    filterBy: getUserIdFromJid(toJid),
    msgType: originalMsg?.msgBody?.message_type,
    favouriteBy: '0',
    favouriteStatus: 0,
    msgBody: {
      ...originalMsg.msgBody,
      media: {
        ...originalMsg.msgBody.media,
        caption: '',
      },
    },
  };
};

export const getMessageObjForward = (originalMsg, toJid, newMsgId) => {
  const timestamp = Date.now() * 1000;
  const createdAt = changeTimeFormat(timestamp);
  const vcardData = getLocalUserDetails();
  const senderId = vcardData.fromUser;

  return {
    ...originalMsg,
    timestamp,
    createdAt: createdAt,
    msgStatus: 3,
    msgType: 'processing',
    msgId: newMsgId,
    fromUserJid: formatUserIdToJid(senderId),
    fromUserId: senderId,
    chatType: isSingleChatJID(toJid) ? CHAT_TYPE_SINGLE : CHAT_TYPE_GROUP,
    publisherId: senderId,
    publisherJid: formatUserIdToJid(senderId),
    deleteStatus: 0,
    favouriteBy: '0',
    favouriteStatus: 0,
    msgBody: {
      ...originalMsg.msgBody,
      replyTo: '',
      translatedMessage: '',
      media: {
        ...originalMsg.msgBody.media,
        is_uploading: 8,
        caption: '',
      },
    },
  };
};

export const updateUserProfileStore = async data => {
  // updating the store with setTimeout to avoid blocking the UI
  setTimeout(() => {
    store.dispatch(updateRosterData(data));
  }, 0);
};
