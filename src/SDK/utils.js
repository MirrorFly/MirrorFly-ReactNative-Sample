import { Platform } from 'react-native';
import { changeTimeFormat } from '../common/timeStamp';
import config from '../config/config';
import {
   calculateWidthAndHeight,
   convertHeicToJpg,
   getThumbImage,
   getUserIdFromJid,
   getVideoThumbImage,
   isLocalUser,
} from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, DOCUMENT_FORMATS, MIX_BARE_JID } from '../helpers/constants';
import { addChatMessageItem, setChatMessages, updateMediaStatus } from '../redux/chatMessageDataSlice';
import { setReplyMessage } from '../redux/draftSlice';
import { setMemberParticipantsList } from '../redux/groupDataSlice';
import { addRecentChatItem, setRecentChats } from '../redux/recentChatDataSlice';
import { getArchive, getChatMessages, getReplyMessage, getRoasterData } from '../redux/reduxHook';
import { setRoasterData } from '../redux/rosterDataSlice';
import { toggleArchiveSetting } from '../redux/settingDataSlice';
import store from '../redux/store';
import { currentChatUser } from '../screens/ConversationScreen';
import { getCurrentUserJid } from '../uikitMethods';
import SDK from './SDK';

let chatPage = {},
   hasNextChatPage = {},
   hasNextRecentChatPage = true,
   recentChatPage = 1;

export const resetVariable = () => {
   chatPage = {};
   hasNextChatPage = {};
   hasNextRecentChatPage = true;
   recentChatPage = 1;
};

export const resetChatPageVariables = userJid => {
   delete chatPage[userJid];
   delete hasNextChatPage[userJid];
};

export const setRecentChatPage = val => {
   recentChatPage = val;
};

export const getRecentChatPage = () => recentChatPage;

export const getHasNextRecentChatPage = () => hasNextRecentChatPage;

export const getHasNextChatPage = userId => hasNextChatPage[userId];

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
      hasNextRecentChatPage = data.length === config.recentChatsPerPage;
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
      let hasEqualDataFetched = data.length >= config.chatMessagesSizePerPage;

      if (data.length && hasEqualDataFetched) {
         chatPage[userId] = page + 1;
      }
      hasNextChatPage[userId] = hasEqualDataFetched;
      store.dispatch(setChatMessages({ userJid, data }));
   }
   return data;
};

const sendMediaMessage = async (messageType, files, chatType, fromUserJid, toUserJid) => {
   if (messageType === 'media') {
      for (let i = 0; i < files.length; i++) {
         const file = files[i],
            msgId = SDK.randomString(8, 'BA');
         console.log('file ==>', JSON.stringify(file, null, 2));
         const {
            caption = '',
            fileDetails = {},
            fileDetails: { fileSize, filename, duration, uri, type, replyTo = '' } = {},
         } = file;
         let _uri = uri;
         if (Platform.OS === 'ios') {
            _uri = await convertHeicToJpg(uri);
         }
         file.fileDetails = { ...file.fileDetails, uri: _uri };
         const isDocument = DOCUMENT_FORMATS.includes(type);
         const msgType = isDocument ? 'file' : type.split('/')[0];
         let thumbImage = msgType === 'image' ? await getThumbImage(_uri) : '';
         thumbImage = msgType === 'video' ? await getVideoThumbImage(_uri) : thumbImage;
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
         };
         const conversationChatObj = getSenderMessageObj(dataObj, i);
         conversationChatObj.archiveSetting = getArchive();
         store.dispatch(addChatMessageItem(conversationChatObj));
         store.dispatch(addRecentChatItem(conversationChatObj));
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
      timestamp: timestamp,
      publisherId: getUserIdFromJid(publisherJid),
      publisherJid,
      userJid: fromUserJid,
      userId: getUserIdFromJid(fromUserJid),
   };
   return retunVal;
};

export const handleSendMsg = async (obj = {}) => {
   const { messageType, message, location = {} } = obj;
   const chatUser = currentChatUser;
   const userId = getUserIdFromJid(chatUser);
   const replyTo = getReplyMessage(getUserIdFromJid(chatUser)).msgId;
   store.dispatch(setReplyMessage({ userId, message: {} }));
   const msgId = SDK.randomString(8, 'BA');
   switch (messageType) {
      case 'text':
         const dataObj = {
            jid: chatUser,
            msgType: 'text',
            message: message,
            chatType: MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : 'chat',
            msgId,
            fromUserJid: chatUser,
            replyTo,
         };
         const senderObj = getSenderMessageObj(dataObj);
         senderObj.archiveSetting = getArchive();
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

export const uploadFileToSDK = async (file, jid, msgId, media) => {
   try {
      const { caption = '', fileDetails: { replyTo = '', duration = 0, audioType = '', type = '' } = {} } = file;
      console.log('uploadFileToSDK file ==>', JSON.stringify(file, null, 2));
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
      let updateObj = {
         msgId,
         statusCode: response.statusCode,
         fromUserId: getUserIdFromJid(jid),
      };
      if (response?.statusCode !== 200) {
         updateObj.uploadStatus = 3;
         store.dispatch(updateMediaStatus(updateObj));
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
   if (userData) {
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

export const getUserSettings = async () => {
   const {
      data: { archive = 0 },
   } = await SDK.getUserSettings();
   store.dispatch(toggleArchiveSetting(archive));
};
