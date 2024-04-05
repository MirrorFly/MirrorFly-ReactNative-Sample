import AsyncStorage from '@react-native-async-storage/async-storage';
import FileViewer from 'react-native-file-viewer';
import ImagePicker from 'react-native-image-crop-picker';
import { openSettings } from 'react-native-permissions';
import { batch } from 'react-redux';
import { getThumbImage, getVideoThumbImage, showToast } from '..';
import SDK from '../../SDK/SDK';
import { changeTimeFormat } from '../../common/TimeStamp';
import { mediaObjContructor, requestCameraPermission, requestStoragePermission } from '../../common/utils';
import { isActiveChatScreenRef } from '../../components/ChatConversation';
import config from '../../components/chat/common/config';
import { DELETE_MESSAGE_FOR_EVERYONE, DELETE_MESSAGE_FOR_ME } from '../../redux/Actions/Constants';
import { addChatConversationHistory, updateUploadStatus } from '../../redux/Actions/ConversationAction';
import { updateRecentChat } from '../../redux/Actions/RecentChatAction';
import { deleteRecoverMessage } from '../../redux/Actions/RecoverMessageAction';
import { updateRosterData } from '../../redux/Actions/rosterAction';
import { default as Store, default as store } from '../../redux/store';
import {
   CHAT_TYPE_GROUP,
   CHAT_TYPE_SINGLE,
   DOCUMENT_FORMATS,
   MIX_BARE_JID,
   MSG_DELIVERED_STATUS_ID,
   MSG_PROCESSING_STATUS_ID,
   MSG_SEEN_STATUS_ID,
   MSG_SENT_ACKNOWLEDGE_STATUS_ID,
} from './Constant';
import { getMessageObjSender, getRecentChatMsgObj, getUserIdFromJid } from './Utility';
export const isGroupChat = chatType => chatType === CHAT_TYPE_GROUP;
export const isSingleChat = chatType => chatType === CHAT_TYPE_SINGLE;

let chatPage = {},
   hasNextPage = {};

export const setHasNextPage = (userId, val) => {
   hasNextPage[userId] = val;
};

export const getHasNextPage = userId => hasNextPage[userId];

export const setChatPage = (userId, page) => {
   chatPage[userId] = page;
};

export const getChatPage = userId => chatPage[userId] || 1;

export const fetchMessagesFromSDK = async (fromUserJId, forceGetFromSDK = false) => {
   const { data: messages } = Store.getState().chatConversationData;
   const userId = getUserIdFromJid(fromUserJId);
   if (forceGetFromSDK || !messages[userId]) {
      const page = getChatPage(userId);
      let chatMessage = await SDK.getChatMessages(fromUserJId, page, config.chatMessagesSizePerPage);
      if (chatMessage?.statusCode === 200) {
         if (chatMessage.data.length) {
            setChatPage(userId, page + 1);
         }
         setHasNextPage(userId, Boolean(chatMessage.data.length));
         Store.dispatch(addChatConversationHistory(chatMessage));
      }
   }
};

export const formatUserIdToJid = (userId, chatType = CHAT_TYPE_SINGLE) => {
   const currentUserJid = store.getState().auth?.currentUserJID || '';
   if (chatType === CHAT_TYPE_SINGLE) {
      return userId?.includes('@') ? userId : `${userId}@${currentUserJid?.split('@')[1] || ''}`;
   } else {
      return userId?.includes('@') ? userId : `${userId}@mix.${currentUserJid?.split('@')[1] || ''}`;
   }
};

export const getUniqueListBy = (arr, key) => {
   return [...new Map(arr.map(item => [item[key], item])).values()];
};

export const uploadFileToSDK = async (file, jid, msgId, media) => {
   try {
      const { caption = '', fileDetails: { replyTo = '', duration = 0, audioType = '', type = '' } = {} } = file;
      const isDocument = DOCUMENT_FORMATS.includes(type);
      const msgType = isDocument ? 'file' : type?.split('/')[0] || media.fileType.split('/')[0];
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
      response = await SDK.sendMediaMessage(jid, msgId, msgType, file.fileDetails, fileOptions, replyTo);
      /**
  // if (msgType === 'file') {
  //   // response = await SDK.sendDocumentMessage(
  //   //   jid,
  //   //   file.fileDetails,
  //   //   fileOptions,
  //   //   replyTo,
  //   // );
  // } else if (msgType === 'image') {
  //   response = await SDK.sendImageMessage(
  //     jid,
  //     file.fileDetails,
  //     fileOptions,
  //     replyTo,
  //   );
  // } else if (msgType === 'video') {
  //   response = await SDK.sendVideoMessage(
  //     jid,
  //     file.fileDetails,
  //     fileOptions,
  //     replyTo,
  //   );
  // } else if (msgType === 'audio') {
  //   response = await SDK.sendAudioMessage(
  //     jid,
  //     file.fileDetails,
  //     fileOptions,
  //     replyTo,
  //   );
  // }
   */
      let updateObj = {
         msgId,
         statusCode: response.statusCode,
         fromUserId: getUserIdFromJid(jid),
      };
      if (response?.statusCode === 200) {
         updateObj.uploadStatus = 2;
         updateObj.is_downloaded = 2;
         updateObj.fileToken = response.fileToken;
         updateObj.thumbImage = response.thumbImage;
      } else {
         updateObj.uploadStatus = 3;
      }
      store.dispatch(updateUploadStatus(updateObj));
   } catch (error) {
      console.log('uploadFileToSDK -->', error);
   }
};

export const updateMediaUploadStatusHistory = (data, stateData) => {
   // Here Get the Current Active Chat History and Active Message
   const currentChatData = stateData[getUserIdFromJid(data.fromUserId)];
   if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
      const currentMessage = currentChatData.messages[data.msgId];
      if (currentMessage) {
         currentMessage.msgBody.media.is_uploading = data.uploadStatus;
         currentMessage.msgBody.media.is_downloaded = data.downloadStatus;
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

export const updateMediaDownloadStatusHistory = (data, stateData) => {
   // Here Get the Current Active Chat History and Active Message
   const currentChatData = stateData(data.msgId);
   if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
      const currentMessage = currentChatData.messages[data.msgId];
      if (currentMessage) {
         currentMessage.msgBody.media.is_downloaded = data.is_downloaded;
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
               currentChatData.messages[msgId].deleteStatus = 1;
            }
         }
      } else if (actionType === DELETE_MESSAGE_FOR_EVERYONE) {
         const messageIds = data.msgId.split(',');
         for (const msgId of messageIds) {
            if (currentChatData.messages[msgId]) {
               currentChatData.messages[msgId].recallStatus = 1;
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
   if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
      const currentMessage = currentChatData.messages[data.msgId];

      if (currentMessage) {
         if (data.uploadStatus) {
            currentMessage.msgBody.media.is_uploading = data.uploadStatus;
         }
         if (data.statusCode === 200) {
            currentMessage.msgBody.media.file_url = data.fileToken || currentMessage.msgBody.media.file_url;
            currentMessage.msgBody.media.thumb_image = data.thumbImage || currentMessage.msgBody.media.thumb_image;
            currentMessage.msgBody.media.file_key = data.fileKey || currentMessage.msgBody.media.file_key;
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
   const state = Object.keys(stateData).length > 0 ? stateData[chatId]?.messages || {} : {};
   const sortedData = concatMessageArray(data.data, Object.values(state), 'msgId', 'timestamp');
   const lastMessage = sortedData[sortedData.length - 1];
   let newSortedData;
   const localUserJid = data.userJid;
   const userId = localUserJid ? getUserIdFromJid(localUserJid) : '';
   if (userId === lastMessage?.publisherId) {
      newSortedData = sortedData.map(msg => {
         if (msg.msgStatus !== 3) {
            msg.msgStatus = getMsgStatusInOrder(msg.msgStatus, lastMessage?.msgStatus);
         }
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
   const msgIds = currentChatData?.messages ? Object.keys(currentChatData?.messages) : {};
   if (msgIds.length > 0) {
      const currentMessage = currentChatData.messages[data.msgId];
      if (currentMessage) {
         const msgStatus = getMsgStatusInOrder(currentMessage.msgStatus, data.msgStatus);
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
export const isActiveConversationUserOrGroup = (userOrGroupId, chatType = CHAT_TYPE_SINGLE) => {
   if (!userOrGroupId) {
      return false;
   }
   const conversationUserOrGroupId = getActiveConversationChatId();
   userOrGroupId = getUserIdFromJid(userOrGroupId);
   return conversationUserOrGroupId === userOrGroupId && isActiveChatScreenRef.current;
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
   if (data[chatId]?.messages && Object.keys(data[getUserIdFromJid(chatId)]?.messages).length > 0) {
      return data[chatId]?.messages[msgId] || {};
   }
   return {};
};

const sendMediaMessage = async (messageType, files, chatType, fromUserJid, toUserJid, userProfile) => {
   let jidSendMediaMessage = toUserJid;
   if (messageType === 'media') {
      let mediaData = {};
      for (let i = 0; i < files.length; i++) {
         const file = files[i],
            msgId = SDK.randomString(8, 'BA');

         const {
            caption = '',
            fileDetails = {},
            fileDetails: { fileSize, filename, duration, uri, type, replyTo = '' } = {},
         } = file;

         const isDocument = DOCUMENT_FORMATS.includes(type);
         const msgType = isDocument ? 'file' : type.split('/')[0];
         let thumbImage = msgType === 'image' ? await getThumbImage(uri) : '';
         thumbImage = msgType === 'video' ? await getVideoThumbImage(uri) : thumbImage;
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
            ...(isSingleChat(chatType) ? { userJid: jidSendMediaMessage } : { groupJid: jidSendMediaMessage }),
         };
         batch(() => {
            store.dispatch(addChatConversationHistory(dispatchData));
            store.dispatch(updateRecentChat(recentChatObj));
         });
      }
   }
};

const parseAndSendMessage = async (message, chatType, messageType, fromUserJid, toUserJid, userProfile) => {
   const { content, replyTo = '' } = message;
   content[0].fileDetails.replyTo = replyTo;
   sendMediaMessage(messageType, content, chatType, fromUserJid, toUserJid, userProfile);
};

export const sendMessageToUserOrGroup = async (message, fromUserJid, userProfile, toUserJid, chatType = 'chat') => {
   let messageType = message.type;

   if (messageType === 'media') {
      parseAndSendMessage(message, chatType, messageType, fromUserJid, toUserJid, userProfile);
      return;
   }

   if (message.content !== '') {
      let jid = toUserJid;
      let msgId = SDK.randomString(8, 'BA');
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

export const updateRosterDataForRecentChats = singleRecentChatList => {
   const userProfileDetails = singleRecentChatList.map(chat => chat.profileDetails);
   store.dispatch(updateRosterData(userProfileDetails));
};

export const handleImagePickerOpenCamera = async () => {
   let cameraPermission = await requestCameraPermission();
   let imageReadPermission = await requestStoragePermission();
   const camera_permission = await AsyncStorage.getItem('camera_permission');
   AsyncStorage.setItem('camera_permission', 'true');
   if (
      (cameraPermission === 'granted' || cameraPermission === 'limited') &&
      (imageReadPermission === 'granted' || imageReadPermission === 'limited')
   ) {
      return ImagePicker.openCamera({
         mediaType: 'photo',
         width: 450,
         height: 450,
         cropping: true,
         cropperCircleOverlay: true,
         compressImageQuality: 0.8,
      })
         .then(async image => {
            const converted = mediaObjContructor('IMAGE_PICKER', image);
            return converted;
         })
         .catch(error => {
            console.log('user cancel', error.message);
            return {};
         });
   } else if (camera_permission) {
      openSettings();
   }
};

export const handleImagePickerOpenGallery = async () => {
   const storage_permission = await AsyncStorage.getItem('storage_permission');
   AsyncStorage.setItem('storage_permission', 'true');
   const imageReadPermission = await requestStoragePermission();
   if (imageReadPermission === 'granted' || imageReadPermission === 'limited') {
      return ImagePicker.openPicker({
         mediaType: 'photo',
         width: 450,
         height: 450,
         cropping: true,
         cropperCircleOverlay: true,
         compressImageQuality: 0.8,
      })
         .then(async image => {
            const converted = mediaObjContructor('IMAGE_PICKER', image);
            if (converted.fileSize > '10485760') {
               showToast('Image size too large', { id: 'Image size too large' });
               return {};
            }
            return converted;
         })
         .catch(error => {
            console.log('User cancel', error.message);
            return {};
         });
   } else if (storage_permission) {
      openSettings();
   }
};

export const showInternetconnectionToast = () => {
   showToast('Please check your internet connection', {
      id: 'internet-connection-toast',
   });
};

export const handleFileOpen = message => {
   FileViewer.open(message?.msgBody?.media?.local_path || message?.msgBody?.media?.file?.fileDetails?.uri, {
      showOpenWithDialog: true,
   })
      .then(res => {
         console.log('Document opened externally', res);
      })
      .catch(err => {
         console.log('Error while opening Document', err);
         showToast('No apps available to open this file', {
            id: 'no-supported-app-to-open-file',
         });
      });
};

export const getRecentChatDataList = () => {
   const { recentChatData } = Store.getState();
   return recentChatData.data;
};

export const getChatConversationData = () => Store.getState().chatConversationData;

export const getToUserId = () => Store.getState().navigation.fromUserJid;

const constructAndDispatchConversationAndRecentChatData = dataObj => {
   const conversationChatObj = getMessageObjSender(dataObj);
   const recentChatObj = getRecentChatMsgObj(dataObj);
   const dispatchData = {
      data: [conversationChatObj],
      ...(isSingleChat(dataObj.chatType) ? { userJid: dataObj.jid } : { groupJid: dataObj.jid }), // check this when group works
   };
   batch(() => {
      store.dispatch(addChatConversationHistory(dispatchData));
      store.dispatch(updateRecentChat(recentChatObj));
   });
};

export const handleSendMsg = async message => {
   const toUserJid = getToUserId();
   const messageType = message.type;
   const { data = {} } = Store.getState().recoverMessage;
   const vCardData = Store.getState()?.profile?.profileDetails;
   const currentUserJID = Store.getState()?.auth?.currentUserJID;
   if (toUserJid in data) {
      Store.dispatch(deleteRecoverMessage(toUserJid));
   }

   const msgId = SDK.randomString(8, 'BA');
   const replyTo = '';
   switch (messageType) {
      case 'media':
         parseAndSendMessage(message, MIX_BARE_JID.test(toUserJid) ? CHAT_TYPE_GROUP : 'chat', messageType);
         break;
      case 'location':
         const { latitude, longitude } = message.location || {};
         if (latitude && longitude) {
            const dataObj = {
               jid: toUserJid,
               msgType: messageType,
               userProfile: vCardData,
               chatType: MIX_BARE_JID.test(toUserJid) ? CHAT_TYPE_GROUP : 'chat',
               msgId,
               location: { latitude, longitude },
               fromUserJid: currentUserJID,
               publisherJid: currentUserJID,
               replyTo: replyTo,
            };
            constructAndDispatchConversationAndRecentChatData(dataObj);
            SDK.sendLocationMessage(toUserJid, latitude, longitude, msgId, replyTo);
         }
         break;
      case 'contact':
         const updatedContacts = message.contacts.map(c => ({
            ...c,
            msgId: SDK.randomString(8, 'BA'),
         }));
         for (const contact of updatedContacts) {
            const dataObj = {
               jid: toUserJid,
               msgType: messageType,
               userProfile: vCardData,
               chatType: MIX_BARE_JID.test(toUserJid) ? CHAT_TYPE_GROUP : 'chat',
               msgId: contact.msgId,
               contact: { ...contact },
               fromUserJid: currentUserJID,
               publisherJid: currentUserJID,
               replyTo: replyTo,
            };
            constructAndDispatchConversationAndRecentChatData(dataObj);
         }
         SDK.sendContactMessage(toUserJid, updatedContacts, replyTo);
         break;
      default: // default to text message
         if (message.content !== '') {
            const dataObj = {
               jid: toUserJid,
               msgType: 'text',
               message: message.content,
               userProfile: vCardData,
               chatType: MIX_BARE_JID.test(toUserJid) ? CHAT_TYPE_GROUP : 'chat',
               msgId,
               fromUserJid: currentUserJID,
               publisherJid: currentUserJID,
               replyTo: message.replyTo,
            };
            constructAndDispatchConversationAndRecentChatData(dataObj);
            SDK.sendTextMessage(toUserJid, message.content, msgId, message.replyTo);
         }
         break;
   }
   // setReplyMsg('');
};
