import RNConvertPhAsset from 'react-native-convert-ph-asset';
import { changeTimeFormat } from '../common/timeStamp';
import config from '../config/config';
import {
   calculateWidthAndHeight,
   convertHeicToJpg,
   getCurrentChatUser,
   getThumbImage,
   getUserIdFromJid,
   getVideoThumbImage,
   handleConversationScollToBottom,
   isLocalUser,
   showToast,
} from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, DOCUMENT_FORMATS, MIX_BARE_JID } from '../helpers/constants';
import {
   addChatMessageItem,
   editChatMessageItem,
   setChatMessages,
   setParentMessage,
   updateMediaStatus,
} from '../redux/chatMessageDataSlice';
import { setReplyMessage } from '../redux/draftSlice';
import { setMemberParticipantsList } from '../redux/groupDataSlice';
import { addRecentChatItem, editRecentChatItem, setRecentChats } from '../redux/recentChatDataSlice';
import { getArchive, getChatMessage, getChatMessages, getReplyMessage, getRoasterData } from '../redux/reduxHook';
import { setRoasterData } from '../redux/rosterDataSlice';
import { toggleArchiveSetting, updateNotificationSetting } from '../redux/settingDataSlice';
import store from '../redux/store';
import { getCurrentUserJid, mflog } from '../uikitMethods';
import SDK from './SDK';

let chatPage = {},
   hasNextChatPage = {},
   hasNextRecentChatPage = true,
   recentChatPage = 1,
   typingStatusSent = false,
   mediaUploadQueue = {};

export const resetVariable = () => {
   chatPage = {};
   hasNextChatPage = {};
   hasNextRecentChatPage = true;
   recentChatPage = 1;
};

export const resetChatPage = userJid => {
   delete chatPage[userJid];
   delete hasNextChatPage[userJid];
};

export const setRecentChatPage = val => {
   recentChatPage = val;
};

export const getRecentChatPage = () => recentChatPage;

export const getHasNextRecentChatPage = () => hasNextRecentChatPage;

export const getHasNextChatPage = userId => hasNextChatPage[userId];

export const randomString = () => SDK.randomString(8, 'BA');

export const updateRosterDataForRecentChats = singleRecentChatList => {
   const userProfileDetails = singleRecentChatList.map(chat => chat.profileDetails);
   store.dispatch(setRoasterData(userProfileDetails));
};

export const updateRosterDataForChats = singleRecentChatList => {
   const userProfileDetails = singleRecentChatList.map(chat => chat?.publisherProfile);
   store.dispatch(setRoasterData(userProfileDetails));
};

export const fetchRecentChats = async () => {
   const page = getRecentChatPage();
   const { statusCode, data = [] } = await SDK.getRecentChats(page, config.recentChatsPerPage);
   if (statusCode === 200) {
      if (data.length) {
         setRecentChatPage(page + 1);
      }
      store.dispatch(setRecentChats(data));
      hasNextRecentChatPage = data.length !== 0;
      updateRosterDataForRecentChats(data);
   }
   return data;
};

export const fetchContactsFromSDK = async (_searchText, _pageNumber, _limit) => {
   let contactsResponse = await SDK.getUsersList(_searchText, _pageNumber, _limit);
   // update the user profile store
   if (contactsResponse.statusCode === 200) {
      store.dispatch(setRoasterData(contactsResponse.users));
   }
   return contactsResponse;
};

export const fetchMessagesFromSDK = async (fromUserJId, forceGetFromSDK = false, pageReset = false) => {
   const userId = getUserIdFromJid(fromUserJId);
   const messsageList = getChatMessages(userId) || [];
   if (messsageList.length && !forceGetFromSDK) {
      return;
   }
   if (pageReset) {
      delete chatPage[userId];
   }
   const page = chatPage[userId] || 1;
   const {
      statusCode,
      userJid,
      data = [],
   } = await SDK.getChatMessages(fromUserJId, page, config.chatMessagesSizePerPage);
   if (statusCode === 200) {
      let hasEqualDataFetched = data.length !== 0;
      if (data.length && hasEqualDataFetched) {
         chatPage[userId] = page + 1;
      }
      hasNextChatPage[userId] = hasEqualDataFetched;
      store.dispatch(setChatMessages({ userJid, data, forceUpdate: page === 1 }));
   }
   return data;
};

const fileFormatConversion = async ({ uri, msgType }) => {
   try {
      switch (true) {
         case uri.includes('ph://') && msgType === 'image':
            return await convertHeicToJpg(uri);
         case uri.includes('ph://') && msgType === 'video':
            const response = await RNConvertPhAsset.convertVideoFromUrl({
               url: uri,
               convertTo: 'mpeg4',
               quality: 'original',
            });
            return response.path; // Return the converted video path
         default:
            return uri;
      }
   } catch (error) {
      mflog('Failed to convert the file:', error);
      return ''; // Return empty string in case of an error
   }
};

const sendMediaMessage = async (messageType, files, chatType, fromUserJid, toUserJid) => {
   if (messageType === 'media') {
      const isMuted = await getMuteStatus(toUserJid);
      for (let i = 0; i < files.length; i++) {
         const file = files[i],
            msgId = SDK.randomString(8, 'BA');
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
               thumbImage: fileDetailsThumbImage,
            } = {},
         } = file;
         const isDocument = DOCUMENT_FORMATS.includes(type);
         const msgType = isDocument ? 'file' : type.split('/')[0];
         let _uri = uri;
         console.log('_uri ==>', _uri);
         file.fileDetails = { ...file.fileDetails, uri: _uri };
         let thumbImage = msgType === 'image' ? await getThumbImage(_uri) : '';
         thumbImage = msgType === 'video' ? fileDetailsThumbImage || (await getVideoThumbImage(_uri)) : thumbImage;
         let fileOptions = {
            fileName: filename,
            fileSize: fileSize,
            caption: caption,
            uri: _uri,
            duration: duration,
            msgId: msgId,
            thumbImage: thumbImage,
         };

         const dataObj = {
            jid: toUserJid,
            msgType,
            chatType: chatType,
            msgId,
            file,
            fileOptions,
            fileDetails: fileDetails,
            fromUserJid: toUserJid,
            replyTo,
            isMuted,
         };
         const conversationChatObj = getSenderMessageObj(dataObj, i);
         conversationChatObj.archiveSetting = getArchive();
         const userId = getUserIdFromJid(toUserJid);
         store.dispatch(addChatMessageItem(conversationChatObj));
         store.dispatch(addRecentChatItem(conversationChatObj));
         if (!mediaUploadQueue[userId]) {
            mediaUploadQueue[userId] = []; // Initialize the array if it doesn't exist
         }

         mediaUploadQueue[userId].push(conversationChatObj);
         if (i === 0) {
            const { msgId, userJid, msgBody: { media = {}, media: { file = {} } = {} } = {} } = conversationChatObj;
            uploadFileToSDK(file, userJid, msgId, media);
         }
      }
   }
};

const parseAndSendMessage = async (message, chatType, messageType, fromUserJid, toUserJid, replyTo) => {
   const { content } = message;
   content[0].fileDetails.replyTo = replyTo;
   sendMediaMessage(messageType, content, chatType, fromUserJid, toUserJid);
};

export const getSenderMessageObj = (dataObj, idx) => {
   const {
      msgType,
      msgId,
      chatType,
      message = '',
      file,
      fileOptions = {},
      fileDetails,
      replyTo,
      fromUserJid,
      location = {},
      contact = {},
      isMuted = 0,
   } = dataObj;
   const publisherJid = getCurrentUserJid();
   const timestamp = Date.now();
   const msgBody = {
      message_type: msgType,
      ...(replyTo && { replyTo }),
   };

   switch (msgType) {
      case 'text':
         msgBody.message = message;
         break;
      case 'location':
         const { latitude, longitude } = location;
         msgBody.location = {
            latitude,
            longitude,
         };
         break;
      case 'contact':
         const { name, phone_number, active_status } = contact;
         msgBody.contact = {
            name: name,
            phone_number: phone_number,
            active_status: active_status,
         };
         break;
      default:
         let webWidth = 0,
            webHeight = 0,
            androidWidth = 0,
            androidHeight = 0,
            originalWidth = 0,
            originalHeight = 0;
         if (msgType === 'image') {
            const mediaDimension = calculateWidthAndHeight(fileDetails?.width, fileDetails?.height);
            ({ webWidth, webHeight, androidWidth, androidHeight } = mediaDimension);
         } else if (msgType === 'video') {
            ({ originalWidth, originalHeight } = fileDetails);
            const mediaDimension = calculateWidthAndHeight(fileDetails?.width, fileDetails?.height);
            ({ webWidth, webHeight, androidWidth, androidHeight } = mediaDimension);
         }
         msgBody.message = '';
         msgBody.media = {
            file,
            caption: fileOptions.caption || '',
            fileName: fileOptions.fileName,
            file_size: fileOptions.fileSize,
            is_downloaded: 2,
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
            audioType: fileDetails?.audioType || '',
         };
         break;
   }

   const retunVal = {
      chatType: chatType,
      createdAt: changeTimeFormat(timestamp),
      deleteStatus: 0,
      recallStatus: 0,
      favouriteStatus: 0,
      fromUserId: getUserIdFromJid(fromUserJid),
      fromUserJid,
      msgBody: msgBody,
      msgId: msgId,
      msgStatus: 3,
      muteStatus: isMuted,
      timestamp: timestamp,
      publisherId: getUserIdFromJid(publisherJid),
      publisherJid,
      userJid: fromUserJid,
      userId: getUserIdFromJid(fromUserJid),
   };
   return retunVal;
};

export const handleSendMsg = async (obj = {}) => {
   const { messageType, message, location = {}, editMessageId: originalMsgId } = obj;
   const chatUser = getCurrentChatUser();
   const userId = getUserIdFromJid(chatUser);
   const replyTo = getReplyMessage(getUserIdFromJid(chatUser)).msgId || '';
   const parentMessage = getChatMessage(userId, replyTo);
   if (replyTo) {
      store.dispatch(setParentMessage(parentMessage));
   }
   store.dispatch(setReplyMessage({ userId, message: {} }));
   const msgId = SDK.randomString(8, 'BA');
   const isMuted = await getMuteStatus(chatUser);
   handleConversationScollToBottom();
   switch (messageType) {
      case 'messageEdit':
         const { msgBody: { media: { caption = '' } = {} } = {} } = getChatMessage(userId, originalMsgId);
         const editMessageId = SDK.randomString(8, 'BA');
         const editObj = caption
            ? { userJid: chatUser, msgId: originalMsgId, caption: message, editMessageId }
            : { userJid: chatUser, msgId: originalMsgId, message, editMessageId };

         store.dispatch(editChatMessageItem(editObj));
         store.dispatch(editRecentChatItem(editObj));
         SDK.editTextOrCaptionMessage({ ...editObj, originalMessageId: originalMsgId, toJid: chatUser });
         break;
      case 'text':
         const dataObj = {
            jid: chatUser,
            msgType: 'text',
            message: message,
            chatType: MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : 'chat',
            msgId,
            fromUserJid: chatUser,
            replyTo,
            isMuted,
         };
         const senderObj = getSenderMessageObj(dataObj);
         store.dispatch(addChatMessageItem(senderObj));
         store.dispatch(addRecentChatItem(senderObj));
         SDK.sendTextMessage(chatUser, message, msgId, replyTo, { broadCastId1: SDK.randomString(8, 'BA') });
         break;
      case 'media':
         await parseAndSendMessage(
            obj,
            MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : 'chat',
            messageType,
            getCurrentUserJid(),
            chatUser,
            replyTo,
         );
         break;
      case 'contact':
         const updatedContacts = obj.contacts.map(c => ({
            ...c,
            msgId: SDK.randomString(8, 'BA'),
         }));
         for (const contact of updatedContacts) {
            const dataObj = {
               jid: chatUser,
               msgType: messageType,
               chatType: MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : 'chat',
               msgId: contact.msgId,
               contact: { ...contact },
               fromUserJid: chatUser,
               replyTo: replyTo,
               isMuted,
            };
            const senderObj = getSenderMessageObj(dataObj);
            senderObj.archiveSetting = getArchive();
            store.dispatch(addChatMessageItem(senderObj));
            store.dispatch(addRecentChatItem(senderObj));
         }
         SDK.sendContactMessage(chatUser, updatedContacts, replyTo, { broadCastIdContact: SDK.randomString(8, 'BA') });
         break;
      case 'location':
         const { latitude, longitude } = location;
         if (latitude && longitude) {
            const dataObj = {
               jid: chatUser,
               msgType: messageType,
               chatType: MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : 'chat',
               msgId,
               location: { latitude, longitude },
               fromUserJid: chatUser,
               publisherJid: getCurrentUserJid(),
               replyTo: replyTo,
               isMuted,
            };
            const senderObj = getSenderMessageObj(dataObj);
            senderObj.archiveSetting = getArchive();
            store.dispatch(addChatMessageItem(senderObj));
            store.dispatch(addRecentChatItem(senderObj));
            SDK.sendLocationMessage(chatUser, latitude, longitude, msgId, replyTo, {
               broadCastIdLocation: SDK.randomString(8, 'BA'),
            });
         }
         break;
   }
};

export const sendSeenStatus = (publisherJid, msgId, groupJid) => {
   SDK.sendSeenStatus(publisherJid, msgId, groupJid);
};

export const handleUploadNextImage = res => {
   const { userId } = res;
   mediaUploadQueue[userId].shift();
   if (!mediaUploadQueue[userId][0]) return;
   const { msgId, userJid, msgBody: { media = {}, media: { file = {} } = {} } = {} } = mediaUploadQueue[userId][0];

   const retryObj = {
      msgId,
      userId: getUserIdFromJid(userJid),
      is_uploading: 1,
   };
   store.dispatch(updateMediaStatus(retryObj));
   uploadFileToSDK(file, userJid, msgId, media);
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
      response = await SDK.sendMediaMessage(jid, msgId, msgType, file.fileDetails, fileOptions, replyTo, {
         broadCastIdMedia: SDK.randomString(8, 'BA'),
      });
      console.log('response ==>', JSON.stringify(response, null, 2));
      let updateObj = {
         msgId,
         statusCode: response.statusCode,
         userId: getUserIdFromJid(jid),
      };
      if (response?.statusCode !== 200) {
         updateObj.is_uploading = 3;
         store.dispatch(updateMediaStatus(updateObj));
         showToast(response.message);
      }
   } catch (error) {
      console.log('uploadFileToSDK -->', error);
   }
};

export const fetchGroupParticipants = async (groupId, iq = false) => {
   try {
      if (MIX_BARE_JID.test(groupId)) {
         const grpList = await SDK.getGroupParticipants(groupId, iq);
         const sortedParticipants =
            grpList.participants?.sort((a, b) => {
               const isAUserLocal = isLocalUser(getUserIdFromJid(a.userJid));
               const isBUserLocal = isLocalUser(getUserIdFromJid(b.userJid));

               if (isAUserLocal) {
                  return 1;
               } else if (isBUserLocal) {
                  return -1;
               } else {
                  return 0;
               }
            }) || [];
         setGroupParticipantsByGroupId(groupId, sortedParticipants);
         grpList.participants?.forEach(element => {
            const { userId, userJid, userProfile } = element;
            store.dispatch(setRoasterData({ userId, userJid, ...userProfile }));
         });
      }
   } catch (error) {
      mflog('Failed to fetch group participants from SDK', error);
   }
};

export const setGroupParticipantsByGroupId = (groupId, participantsList) => {
   const uniqueUserJids = {};
   const uniqueParticipantsList = participantsList.filter(item => {
      if (item.userType !== '' && !uniqueUserJids[item.userJid]) {
         uniqueUserJids[item.userJid] = true;
         return true;
      }
      return false;
   });
   store.dispatch(
      setMemberParticipantsList({
         groupId: getUserIdFromJid(groupId),
         participantsList: uniqueParticipantsList,
      }),
   );
};

export const getUserProfileFromSDK = userId => {
   const userData = getRoasterData(userId);
   if (Object.keys(userData).length > 0 && userData?.status) {
      return userData || {};
   }
   return SDK.getUserProfile(userId, false, true).then(res => {
      if (res?.statusCode === 200) {
         if (res.data !== userData) {
            store.dispatch(setRoasterData(res.data));
         }
      }
      return res?.data || {};
   });
};

export const getUserSettings = async (iq = false) => {
   const { data: { archive = 0 } = {} } = await SDK.getUserSettings?.(iq);
   store.dispatch(toggleArchiveSetting(Number(archive)));
};

export const updateNotificationSettings = async () => {
   let {
      data: { archive = 0, muteNotification = false, notificationSound = true, notificationVibrate = false },
   } = await SDK.getUserSettings();
   store.dispatch(toggleArchiveSetting(Number(archive)));
   store.dispatch(updateNotificationSetting({ muteNotification, notificationSound, notificationVibrate }));
};

export const sendNotificationData = async () => {
   const {
      notificationSound = false,
      notificationVibrate = false,
      muteNotification = false,
   } = store.getState().settingsData;
   SDK.updateSettings({
      muteNotification,
      notificationSound,
      notificationVibrate,
   });
};

export const getMuteStatus = async userJid => {
   return await SDK.getMuteStatus(userJid);
};

export const getUserProfileFromApi = async userId => {
   try {
      const userData = getRoasterData(userId);
      let successData = successResponse();
      if (Object.keys(userData).length > 0 && userData?.status) {
         successData.data = userData;
         return successData || {};
      }
      const response = await SDK.getUserProfile(userId, false, true);
      if (response?.statusCode === 200) {
         if (response.data !== userData) {
            store.dispatch(setRoasterData(response.data));
         }
      }
      return response || {};
   } catch (error) {
      console.log('getUserProfileFromApi', error);
      return error;
   }
};

export const successResponse = message => ({
   statusCode: 200,
   message: message || 'SUCCESS',
});

export const updateTypingStatus = jid => {
   if (!typingStatusSent) {
      SDK.sendTypingStatus(jid);
      typingStatusSent = true;
   }
};

export const updateTypingGoneStatus = jid => {
   if (typingStatusSent) {
      SDK.sendTypingGoneStatus(jid);
      typingStatusSent = false;
   }
};
