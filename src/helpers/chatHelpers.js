import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Clipboard from '@react-native-clipboard/clipboard';
import Graphemer from 'graphemer';
import React from 'react';
import { Alert, Dimensions, Linking, Platform, StyleSheet, View } from 'react-native';
import { Image as ImageCompressor } from 'react-native-compressor';
import { createThumbnail } from 'react-native-create-thumbnail';
import DocumentPicker from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import HeicConverter from 'react-native-heic-converter';
import ImagePicker from 'react-native-image-crop-picker';
import { RESULTS, openSettings } from 'react-native-permissions';
import Sound from 'react-native-sound';
import RootNavigation from '../Navigation/rootNavigation';
import SDK, { RealmKeyValueStore } from '../SDK/SDK';
import { CONNECTED } from '../SDK/constants';
import { handleSendMsg, uploadFileToSDK } from '../SDK/utils';
import {
   BlockedIcon,
   CameraIcon,
   ChatsIcon,
   ContactIcon,
   DocumentIcon,
   ExitIcon,
   GalleryIcon,
   HeadSetIcon,
   LocationIcon,
   NotificationSettingsIcon,
   ProfileIcon,
   SandTimer
} from '../common/Icons';
import { getNetworkState } from '../common/hooks';
import {
   requestAudioStoragePermission,
   requestCameraMicPermission,
   requestCameraPermission,
   requestContactPermission,
   requestFileStoragePermission,
   requestLocationPermission,
   requestStoragePermission,
} from '../common/permissions';
import { changeTimeFormat } from '../common/timeStamp';
import { stopAudioRecord } from '../components/ChatInput';
import { conversationFlatListRef } from '../components/ConversationList';
import config from '../config/config';
import {
   ALLOWED_ALL_FILE_FORMATS,
   ALLOWED_AUDIO_FORMATS,
   CHAT_TYPE_GROUP,
   CHAT_TYPE_SINGLE,
   DOCUMENT_FILE_EXT,
   DOCUMENT_FORMATS,
   MAP_THHUMBNAIL_URL,
   MAX_HEIGHT_AND,
   MAX_HEIGHT_WEB,
   MAX_WIDTH_AND,
   MAX_WIDTH_WEB,
   MIN_HEIGHT_AND,
   MIN_HEIGHT_WEB,
   MIN_WIDTH_AND,
   MIN_WIDTH_WEB,
   MIX_BARE_JID,
   audioEmoji,
   contactEmoji,
   fileEmoji,
   imageEmoji,
   locationEmoji,
   messageTypeConstants,
   urlRegx,
   videoEmoji,
} from '../helpers/constants';
import { getStringSet, replacePlaceholders } from '../localization/stringSet';
import {
   clearChatMessageData,
   deleteMessagesForEveryone,
   deleteMessagesForMe,
   highlightMessage,
   resetMessageSelections,
   setChatSearchText,
   setIsSearchChatLoading,
   toggleEditMessage,
   toggleIsChatSearching,
   updateMediaStatus,
} from '../redux/chatMessageDataSlice';
import {
   clearRecentChatData,
   deleteMessagesForEveryoneInRecentChat,
   resetChatSelections,
   toggleArchiveChats,
} from '../redux/recentChatDataSlice';
import {
   getArchive,
   getArchiveSelectedChats,
   getChatMessages,
   getSelectedChatMessages,
   getSelectedChats,
   getUserNameFromStore,
   getXmppConnectionStatus,
} from '../redux/reduxHook';
import { toggleMute, updateBlockUser } from '../redux/rosterDataSlice';
import store from '../redux/store';
import { showToastMessage } from '../redux/toastMessageSlice';
import {
   BLOCKED_CONTACT_LIST_STACK,
   CAMERA_SCREEN,
   CHATS_CREEN,
   GALLERY_FOLDER_SCREEN,
   LOCATION_SCREEN,
   MOBILE_CONTACT_LIST_SCREEN,
   NOTIFICATION_ALERT_STACK,
   NOTIFICATION_STACK,
   PROFILE_STACK,
} from '../screens/constants';
import { getCurrentUserJid, mflog } from '../uikitMethods';

const { fileSize, imageFileSize, videoFileSize, audioFileSize, documentFileSize } = config;

const memoizedUsernameGraphemes = {};
const splitter = new Graphemer();
let currentChatUser = '';
const stringSet = getStringSet();
let isConversationScreenActive = false;

const documentAttachmentTypes = [
   DocumentPicker.types.allFiles,
   // DocumentPicker.types.pdf
   // DocumentPicker.types.ppt
   // DocumentPicker.types.pptx
   // DocumentPicker.types.doc
   // DocumentPicker.types.docx
   // DocumentPicker.types.xls
   // DocumentPicker.types.xlsx
   // DocumentPicker.types.plainText
   // DocumentPicker.types.zip
   // DocumentPicker.types.csv
   // /** need to add rar file type and verify that */
   // '.rar'
];

export const setIsConversationScreenActive = val => {
   isConversationScreenActive = val;
};

export const getIsConversationScreenActive = () => isConversationScreenActive;

export const showToast = (message, duration) => {
   store.dispatch(
      showToastMessage({
         message: message,
         duration: duration,
      }),
   );
};

export const showNetWorkToast = () => {
   store.dispatch(
      showToastMessage({
         message: config.internetErrorMessage,
      }),
   );
};

export const getUserIdFromJid = userJid => {
   return userJid && userJid.includes('@') ? userJid.split('@')[0] : userJid;
};

export const getUserType = userJid => {
   return MIX_BARE_JID.test(userJid) ? CHAT_TYPE_GROUP : CHAT_TYPE_SINGLE;
};

export function getType(type = '') {
   return type && type.includes('/') ? type.split('/')[0] : type;
}

export const handleRoute = (name, params) => () => {
   RootNavigation.navigate(name, params);
};

export const getImageSource = image => {
   const isBase64 = typeof image === 'string' && image?.includes('data:image/');
   const uriBase = {
      uri: image,
   };
   return isBase64 ? uriBase : image;
};

export const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }, paddingToBottom) => {
   return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

export const escapeRegExpReservedChars = str => {
   return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const countSelectedItems = (arr, key) => {
   return arr.filter(item => item[key] === 1).length;
};

export const selectedItems = (arr, key) => {
   return arr.filter(item => item[key] === 1);
};

export const getUsernameGraphemes = (input = '') => {
   if (memoizedUsernameGraphemes[input]) {
      return memoizedUsernameGraphemes[input];
   }

   if (input) {
      const graphemes = splitter.splitGraphemes(input);
      let result = '';
      if (graphemes.includes(' ')) {
         let preVele;
         graphemes.forEach(element => {
            if (preVele === ' ') {
               preVele = element;
               result = graphemes[0] + element;
            }
            preVele = element;
         });
      }
      if (!result) {
         result = (graphemes[0] || '') + (graphemes[1] || '');
      }
      result = result.toUpperCase();
      memoizedUsernameGraphemes[input] = result;
      return result;
   } else {
      return '';
   }
};

export const handleMessageDelete = userJid => () => {
   const userId = getUserIdFromJid(userJid);
   const selectedMessages = getSelectedChatMessages(userId);
   const msgIds = selectedMessages.map(message => message.msgId);
   SDK.deleteMessagesForMe(userJid, msgIds);
   store.dispatch(deleteMessagesForMe({ userId, msgIds }));
};

export const handleMessageDeleteForEveryOne = userJid => () => {
   const userId = getUserIdFromJid(userJid);
   const selectedMessages = getSelectedChatMessages(userId);
   const msgIds = selectedMessages.map(message => message.msgId);
   SDK.deleteMessagesForEveryone(userJid, msgIds);
   updateDeleteForEveryOne(userId, msgIds, userJid);
};

export const updateDeleteForEveryOne = (userId, msgIds, userJid) => {
   store.dispatch(deleteMessagesForEveryone({ userId, msgIds }));
   store.dispatch(deleteMessagesForEveryoneInRecentChat(userJid));
};

export const handelResetMessageSelection = userId => () => {
   store.dispatch(resetMessageSelections(userId));
};

export const getThumbBase64URL = thumb => `data:image/png;base64,${thumb}`;

const formatDecimal = value => {
   return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
   }).format(value);
};

export const convertBytesToKB = bytes => {
   if (!Number.isFinite(bytes) || bytes < 0) {
      return 'Invalid size';
   }

   const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
   let i = 0;
   while (bytes >= 1024 && i < sizes.length - 1) {
      bytes /= 1024;
      i++;
   }
   return `${formatDecimal(bytes)} ${sizes[i]}`;
};

export const millisToHoursMinutesAndSeconds = millis => {
   let hours = Math.floor(millis / 3600000);
   let minutes = Math.floor((millis % 3600000) / 60000);
   let seconds = parseInt((millis % 60000) / 1000, 10);

   let hoursString = '';
   if (hours > 0) {
      hoursString = (hours < 10 ? '0' : '') + hours + ':';
   }
   return hoursString + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

export const formatUserIdToJid = (userId, chatType = CHAT_TYPE_SINGLE) => {
   const currentUserJid = getCurrentUserJid();
   if (chatType === CHAT_TYPE_SINGLE) {
      return userId?.includes(currentUserJid?.split('@')[1])
         ? userId
         : `${userId}@${currentUserJid?.split('@')[1] || ''}`;
   } else {
      return userId?.includes(currentUserJid?.split('@')[1])
         ? userId
         : `${userId}@mix.${currentUserJid?.split('@')[1] || ''}`;
   }
};

export const getStatusVisible = currentStatus => {
   let statusVisible;
   switch (currentStatus) {
      case 3:
         statusVisible = styles.bgClr;
         break;
      case 0:
         statusVisible = styles.notDelivered;
         break;
      case 1:
         statusVisible = styles.delivered;
         break;
      case 2:
         statusVisible = styles.seen;
         break;
   }
   return statusVisible;
};

export const getMessageStatus = (currentStatus, size = 6) => {
   const statusVisible = getStatusVisible(currentStatus);
   if (currentStatus === 3) {
      return <SandTimer />;
   }
   return <View style={[styles?.currentStatus(size), statusVisible]} />;
};

const styles = StyleSheet.create({
   currentStatus: size => ({
      width: size,
      height: size,
      borderRadius: size / 2,
   }),
   bgClr: {
      backgroundColor: 'red',
   },
   notDelivered: {
      backgroundColor: '#818181',
   },
   delivered: {
      backgroundColor: '#FFA500',
   },
   seen: {
      backgroundColor: '#66E824',
   },
});

/**
 * @param  {string} name=""
 * find last "DOT" and get file Type
 */
export function getExtension(name = '', isDotrequired = true) {
   if (!name) {
      return '';
   }
   const lastDot = name.substring(name.lastIndexOf('.') + 1, name.length);
   return isDotrequired ? '.' + lastDot : lastDot;
}

export const getLocationImageURL = ({ latitude, longitude }) => {
   return `${MAP_THHUMBNAIL_URL}?center=${latitude},${longitude}&zoom=13&size=300x200&markers=color:red|${latitude},${longitude}&key=${config.GOOGLE_LOCATION_API_KEY}`;
};

export const showCheckYourInternetToast = () => {
   showToast('Please check your internet connection');
};

export const openLocationExternally = (latitude, longitude) => {
   const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q=',
   });
   const latLng = `${latitude},${longitude}`;
   const locationUrl = Platform.select({
      ios: `${scheme}${latLng}`,
      android: `${scheme}${latLng}`,
   });
   if (Linking.canOpenURL(locationUrl)) {
      Linking.openURL(locationUrl).catch(() => {
         showToast(stringSet.TOAST_MESSAGES.UNABLE_TO_OPEN_THE_LOCATION);
      });
   } else {
      showToast(stringSet.TOAST_MESSAGES.NO_APPS_AVAILABLE_FOR_LOCATION);
   }
};

// Recalculates Image/Video Width and Height for Multiple Platforms
export const calculateWidthAndHeight = (width, height) => {
   let response = {};

   switch (true) {
      // Horizontal Video
      case width > height:
         let resultHeight = Math.round((height / width) * MAX_WIDTH_WEB);
         let resultHeightAnd = Math.round((height / width) * MAX_WIDTH_AND);

         response = {
            webWidth: MAX_WIDTH_WEB,
            webHeight: resultHeight > MIN_HEIGHT_WEB ? resultHeight : MIN_HEIGHT_WEB,
            androidWidth: MAX_WIDTH_AND,
            androidHeight: resultHeightAnd > MIN_HEIGHT_AND ? resultHeightAnd : MIN_HEIGHT_AND,
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

export const handleConversationClear = async jid => {
   const userId = getUserIdFromJid(jid);
   const messageList = getChatMessages(userId) || [];
   if (messageList.length) {
      await SDK.clearChat(jid);
      store.dispatch(clearChatMessageData(userId));
      store.dispatch(clearRecentChatData(jid));
   } else {
      showToast(stringSet.TOAST_MESSAGES.THERE_IS_NO_CONVERSATION);
   }
};

export const isAnyMessageWithinLast30Seconds = (messages = []) => {
   const now = Date.now();
   return messages.every(
      message =>
         now - message.timestamp <= 30000 &&
         isLocalUser(message.publisherJid) &&
         message?.msgStatus !== 3 &&
         message?.recallStatus === 0,
   );
};

export const getExtention = filename => {
   // To get the file extension
   const dotIndex = filename.lastIndexOf('.');
   return dotIndex !== -1 ? filename.substring(dotIndex + 1) : undefined;
};

export const mediaObjContructor = (_package, file) => {
   let mediaObj = {
      extension: '',
      type: '',
      modificationTimestamp: Date.now(),
      uri: '',
      fileSize: 0,
      width: 0,
      height: 0,
      filename: '',
      duration: 0,
   };

   switch (_package) {
      case 'CAMERA_ROLL': {
         const { image, type } = file;
         mediaObj.extension = getExtention(image.filename) || image.extension;
         mediaObj.uri = image.uri;
         mediaObj.fileSize = image.fileSize;
         mediaObj.type = type;
         mediaObj.width = image.width;
         mediaObj.height = image.height;
         mediaObj.duration = image.playableDuration * 1000;
         mediaObj.filename = image.filename;
         mediaObj.thumbImage = image.thumbImage || '';
         return mediaObj;
      }
      case 'DOCUMENT_PICKER':
         mediaObj.extension = getExtention(file.name);
         mediaObj.uri = `${file.fileCopyUri}`;
         mediaObj.fileSize = file.size;
         mediaObj.type = file.type;
         mediaObj.filename = file.name;
         mediaObj.duration = file.duration * 1000 || 0;
         return mediaObj;
      case 'IMAGE_PICKER':
         mediaObj.extension = getExtention(file.path);
         mediaObj.uri = file.path;
         mediaObj.type = file.mime;
         mediaObj.fileSize = file.size;
         mediaObj.filename = file.path.split('/').pop();
         mediaObj.width = file.width;
         mediaObj.height = file.height;
         mediaObj.modificationTimestamp = file.modificationDate;
         return mediaObj;
      case 'RN_CAMERA':
         mediaObj.extension = getExtention(file.uri);
         mediaObj.uri = file.uri;
         mediaObj.fileSize = file.size;
         mediaObj.width = file.width;
         mediaObj.height = file.height;
         mediaObj.filename = file.uri.split('/').pop();
         mediaObj.duration = file.duration * 1000 || 0;
         mediaObj.type = file.type + '/' + mediaObj.extension;
         return mediaObj;
      case 'AUDIO_RECORD':
         mediaObj.extension = getExtension(file.fileCopyUri, false);
         mediaObj.uri = `${file.fileCopyUri}`;
         mediaObj.fileSize = file.size;
         mediaObj.type = file.type;
         mediaObj.filename = file.name;
         mediaObj.duration = file.duration || 0;
         return mediaObj;
      case 'REDUX':
         mediaObj.extension = getExtension(file.local_path, false);
         mediaObj.uri = file.local_path;
         mediaObj.fileSize = file.file_size;
         mediaObj.duration = file.duration;
         mediaObj.filename = file.fileName;
         mediaObj.type = file.fileType;
         mediaObj.audioType = file?.audioType;
         return mediaObj;
      default:
         break;
   }
};

const getMaxAllowedFileSize = mediaType => {
   if (mediaType === 'image') {
      return imageFileSize;
   } else if (mediaType === 'video') {
      return videoFileSize;
   } else if (mediaType === 'audio') {
      return audioFileSize;
   } else if (mediaType === 'file') {
      return documentFileSize;
   }
   return fileSize;
};

export const isValidFileToUpload = item => {
   const {
      type,
      image: { fileSize: size, extension, width, height, playableDuration },
   } = item;
   const mediaTypeFile = getType(type);
   const maxAllowedSize = getMaxAllowedFileSize(mediaTypeFile);
   if (size >= maxAllowedSize) {
      const message = `File size is too large. Try uploading file size below ${convertBytesToKB(maxAllowedSize)}`;
      return message;
   }
   if (
      !ALLOWED_ALL_FILE_FORMATS.includes(extension?.toLowerCase()) ||
      !size ||
      width <= 0 ||
      height <= 0 ||
      (mediaTypeFile === 'video' && playableDuration <= 1)
   ) {
      return 'The file format is not supported';
   }
   return '';
};

export const isValidFileType = type => {
   return DOCUMENT_FORMATS.includes(type);
};

export const validateFileSize = (size, mediaTypeFile) => {
   const maxAllowedSize = getMaxAllowedFileSize(mediaTypeFile);
   if (size >= maxAllowedSize) {
      const message = `File size is too large. Try uploading file size below ${convertBytesToKB(maxAllowedSize)}`;
      if (mediaTypeFile) {
         return message;
      }
   }
   return '';
};

export const getAudioDuration = async path => {
   return new Promise((resolve, reject) => {
      const sound = new Sound(path, Platform.OS === 'ios' ? '' : Sound.MAIN_BUNDLE, error => {
         if (error) {
            return reject(error);
         } else {
            const duration = sound.getDuration();
            return resolve(duration);
         }
      });
   });
};

export const validation = extension => {
   if (!ALLOWED_AUDIO_FORMATS.includes(extension)) {
      let message = 'You can upload only ';
      message = message + `${ALLOWED_AUDIO_FORMATS.join(', ')} files`;
      return message;
   }
   return '';
};

export const handleDocumentPickSingle = async () => {
   try {
      const result = await DocumentPicker.pickSingle({
         allowMultiSelection: false,
         type: documentAttachmentTypes,
         presentationStyle: 'fullScreen',
         copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
      });
      return result;
   } catch (error) {
      // updating the SDK flag back to false to behave as usual
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      mflog('Error in document picker pick single ', error);
   }
};

export const handleAudioPickerSingle = async () => {
   try {
      let res = await DocumentPicker.pickSingle({
         type: [DocumentPicker.types.audio],
         presentationStyle: 'fullScreen',
         copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
      });
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      if (res) {
         res.extension = getExtention(res.uri || res.name);
         res.fileCopyUri = getValidUri(res);
         return res;
      }
   } catch (error) {
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      mflog('Failed to pick single audio using document picker', error);
   }
};

export const openDocumentPicker = async () => {
   const storage_permission = await RealmKeyValueStore.getItem('storage_permission');
   const permissionResult = await requestFileStoragePermission();
   if (permissionResult === 'granted' || permissionResult === 'limited') {
      // updating the SDK flag to keep the connection Alive when app goes background because of document picker
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
      setTimeout(async () => {
         const file = await handleDocumentPickSingle();
         if (!file) {
            return;
         }
         // Extract directory path
         const uriParts = file.fileCopyUri.split('/');
         uriParts.pop(); // Remove last part (file name)
         const correctedUri = uriParts.join('/') + '/' + file.name;
         // Create a new object to avoid modifying the original reference (good practice)
         const extension = getExtension(file.name, false);
         const _updatedFile = {
            ...file,
            fileCopyUri: correctedUri,
            uri: correctedUri,
            type: file.type || `application/${extension}`,
         };
         // updating the SDK flag back to false to behave as usual
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         // Validating the file type and size
         if (!DOCUMENT_FILE_EXT.includes(extension)) {
            Alert.alert(
               'Mirrorfly',
               'You can upload only .pdf, .xls, .xlsx, .doc, .docx, .txt, .ppt, .zip, .rar, .pptx, .csv  files',
            );
            return;
         }
         const error = validateFileSize(file.size, 'file');
         if (error) {
            showToast(error);
            return;
         }
         // preparing the object and passing it to the sendMessage function
         const updatedFile = {
            fileDetails: mediaObjContructor('DOCUMENT_PICKER', _updatedFile),
         };
         const messageData = {
            messageType: 'media',
            content: [updatedFile],
            chatUser: currentChatUser,
         };
         handleSendMsg(messageData);
      }, 200);
   } else if (storage_permission) {
      openSettings();
   } else if (permissionResult === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('storage_permission', 'true');
   }
};

export const openCamera = async () => {
   let cameraPermission = await requestCameraMicPermission();
   let imageReadPermission = await requestStoragePermission();
   const camera_permission = await RealmKeyValueStore.getItem('camera_permission');
   if (cameraPermission === 'granted' && imageReadPermission === 'granted') {
      RootNavigation.navigate(CAMERA_SCREEN);
   } else if (camera_permission) {
      openSettings();
   } else if (cameraPermission === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('camera_permission', 'true');
   } else if (imageReadPermission === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('storage_permission', 'true');
   }
};

export const openGallery = async () => {
   const storage_permission = await RealmKeyValueStore.getItem('storage_permission');
   let imageReadPermission = await requestStoragePermission();
   if (imageReadPermission === 'granted' || imageReadPermission === 'limited') {
      RootNavigation.navigate(GALLERY_FOLDER_SCREEN);
   } else if (storage_permission) {
      openSettings();
   } else if (imageReadPermission === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('storage_permission', 'true');
   }
};

export const openMobileContact = async () => {
   try {
      const isNotFirstTimeContactPermissionCheck = await RealmKeyValueStore.getItem('contact_permission');
      const result = await requestContactPermission();
      if (result === 'granted') {
         RootNavigation.navigate(MOBILE_CONTACT_LIST_SCREEN);
      } else if (isNotFirstTimeContactPermissionCheck) {
         openSettings();
      } else if (result === RESULTS.BLOCKED) {
         RealmKeyValueStore.setItem('contact_permission', 'true');
      }
   } catch (error) {
      console.error('Error requesting contacts permission:', error);
   }
};

export const openLocation = async () => {
   try {
      const isNotFirstTimeLocationPermissionCheck = await RealmKeyValueStore.getItem('location_permission');
      const result = await requestLocationPermission();
      if (result === 'granted' || result === 'limited') {
         if (getNetworkState()) {
            RootNavigation.navigate(LOCATION_SCREEN);
         } else {
            showCheckYourInternetToast();
         }
      } else if (isNotFirstTimeLocationPermissionCheck) {
         openSettings();
      } else if (result === RESULTS.BLOCKED) {
         RealmKeyValueStore.setItem('location_permission', 'true');
      }
   } catch (error) {
      console.error('Failed to request location permission:', error);
   }
};

const getValidUri = response => {
   let validUri = response.fileCopyUri;
   try {
      validUri = decodeURI(validUri);
   } catch (error) {
      console.warn('Error decoding URI:', error);
   }
   return validUri || response.fileCopyUri;
};

export const handleAudioSelect = async () => {
   const audio_permission = await RealmKeyValueStore.getItem('audio_permission');
   SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
   const audioPermission = await requestAudioStoragePermission();
   SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
   if (audioPermission === 'granted' || audioPermission === 'limited') {
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
      let response = await handleAudioPickerSingle();
      if (!response) {
         return;
      }
      const replyTo = '';
      const extension = getExtension(response.name);
      let _validate = validation(extension);
      const sizeError = validateFileSize(response.size, getType(response.type));
      if (_validate && !sizeError) {
         Alert.alert('Mirrorfly', _validate);
         return;
      }
      const audioDuration = await getAudioDuration(response.fileCopyUri);
      response.duration = audioDuration;
      if (sizeError) {
         return showToast(sizeError);
      }
      if (!_validate && !sizeError) {
         const transformedArray = {
            caption: '',
            fileDetails: mediaObjContructor('DOCUMENT_PICKER', response),
         };
         let message = {
            messageType: 'media',
            content: [transformedArray],
            replyTo,
         };

         handleSendMsg(message);
      }
   } else if (audio_permission) {
      openSettings();
   } else if (audioPermission === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('audio_permission', 'true');
   }
};

// Function to calculate keyboard vertical offset dynamically
export const calculateKeyboardVerticalOffset = () => {
   const { height } = Dimensions.get('window');
   const isIOS = Platform.OS === 'ios';

   // Define known offsets and heights for base and target devices
   const baseOffset = 20; // Offset for the base device (e.g., iPhone 6s)
   const baseHeight = 667; // Height of the base device (e.g., iPhone 6s)
   const targetOffset = 50; // Offset for the target device (e.g., iPhone 12)

   // Calculate the proportional adjustment using linear interpolation
   const keyboardOffset = Math.round(
      baseOffset + ((height - baseHeight) / (844 - baseHeight)) * (targetOffset - baseOffset),
   );

   return isIOS ? keyboardOffset : 0; // Return calculated offset for iOS, 0 for other platforms
};

export const isEqualObjet = (obj1, obj2) => {
   if (obj1 === obj2) {
      return true;
   }
   if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
      return false;
   }
   const keys1 = Object.keys(obj1);
   const keys2 = Object.keys(obj2);
   if (keys1.length !== keys2.length) {
      return false;
   }
   for (let key of keys1) {
      if (!keys2.includes(key) || !isEqualObjet(obj1[key], obj2[key])) {
         return false;
      }
   }
   return true;
};

export const handleConversationScollToBottom = () => {
   conversationFlatListRef.current.scrollToOffset({
      indexoffset: 0,
      animated: true,
   });
};

export const handleSendMedia = selectedImages => {
   let message = {
      messageType: 'media',
      content: selectedImages || [],
   };
   handleSendMsg(message);
   RootNavigation.popToTop();
};

/**
 * Helpler function to generate thumbnail for video
 * @param {string} uri local file path of the video
 * @returns {Promise<string>} returns the base64 data of the Thumbnail Image
 */
export const getVideoThumbImage = async (uri, duration, width, height) => {
   const frame = await createThumbnail({
      url: uri,
      timeStamp: duration / 2,
      width,
      height,
   });
   const base64 = await RNFS.readFile(frame.path, 'base64');
   return base64;
};

export const convertHeicToJpg = async heicFilePath => {
   try {
      const result = await HeicConverter.convert({ path: heicFilePath });
      if (result.success) {
         return result.path; // Path to the converted JPG file
      }
   } catch (error) {
      console.error('HEIC Conversion Error:', error);
   }
};

export const getAbsolutePath = async uri => {
   try {
      if (Platform.OS !== 'ios') {
         return { uri };
      }
      const options = {
         allowNetworkAccess: true,
         targetSize: {
            height: 300,
            width: 300,
         },
         quality: 0.5,
      };
      const thumbnailResponse = await CameraRoll.getPhotoThumbnail(uri, options);
      return { uri, thumbnailBase64: thumbnailResponse.thumbnailBase64 };
   } catch (error) {
      mflog('Get Absolute Path Error:', uri, error);
      return { uri, thumbnailBase64: '' };
   }
};

/**
 * Helper function to generate thumbnail for image
 * @param {string} uri - local path if the image
 * @returns {Promise<string>} returns the base64 data of the Thumbnail Image
 */
export const getThumbImage = async uri => {
   const result = await ImageCompressor.compress(uri, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.5,
   });
   const response = await RNFS.readFile(result, 'base64');
   return response;
};

/** export const handleUploadNextImage = res => {
   const { userId, msgId } = res;
   // Find the next message in the state object
   const conversationData = getChatMessages(userId);
   const nextMessageIndex = conversationData?.findIndex(item => item.msgId === msgId) - 1;

   if (nextMessageIndex > -1) {
      const {
         msgId: _msgId,
         userJid,
         msgBody: { media = {}, media: { file = {}, is_uploading } = {} } = {},
      } = conversationData[nextMessageIndex];
      if (is_uploading === 0) {
         const retryObj = {
            _msgId,
            userId,
            is_uploading: 1,
         };
         store.dispatch(updateMediaStatus(retryObj));
         uploadFileToSDK(file, userJid, _msgId, media);
      }
   }
}; */

export const handleUploadNextImage = res => {
   const { userId, msgId } = res;
   // Find the next message in the state object
   const conversationData = getChatMessages(userId);
   const nextMessageIndex = conversationData.findIndex(item => item.msgId === msgId);
   if (nextMessageIndex > -1) {
      for (let i = nextMessageIndex - 1; i >= 0; i--) {
         const {
            msgId: _msgId,
            userJid,
            msgBody: { media = {}, media: { file = {}, is_uploading } = {} } = {},
         } = conversationData[i];
         if (is_uploading === 1 || is_uploading === 3) {
            continue;
         }
         if (is_uploading === 0) {
            const retryObj = {
               _msgId,
               userId,
               is_uploading: 1, // Mark as uploading
            };
            store.dispatch(updateMediaStatus(retryObj)); // Update media status
            // Start uploading the file
            uploadFileToSDK(file, userJid, _msgId, media);
            break; // Exit loop after uploading one image
         }
      }
   }
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
   const currentUserJID = getCurrentUserJid();
   return userId === getUserIdFromJid(currentUserJID);
};

export const handleImagePickerOpenCamera = async () => {
   let cameraPermission = await requestCameraPermission();
   let imageReadPermission = await requestStoragePermission();
   const camera_permission = await RealmKeyValueStore.getItem('camera_permission');
   const storage_permission = await RealmKeyValueStore.getItem('storage_permission');
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
   } else if (camera_permission || storage_permission) {
      openSettings();
   }
   if (cameraPermission === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('camera_permission', 'true');
   }
   if (imageReadPermission === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('storage_permission', 'true');
   }
};

export const handleImagePickerOpenGallery = async () => {
   const storage_permission = await RealmKeyValueStore.getItem('storage_permission');
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
               showToast(stringSet.TOAST_MESSAGES.IMAGE_SIZE_TOO_LARGE);
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
   if (imageReadPermission === RESULTS.BLOCKED) {
      RealmKeyValueStore.setItem('storage_permission', 'true');
   }
};

export const getNotifyNickName = res => {
   if (res.chatType === CHAT_TYPE_GROUP) {
      const userNickName = res?.msgBody?.nickName ?? getUserIdFromJid(res?.publisherJid);
      return res.msgBody.message_type !== 'notification'
         ? `${userNickName} @ ${res.profileDetails.nickName}`
         : res.profileDetails.nickName;
   } else {
      return (
         res?.msgBody?.nickName ||
         res?.profileDetails?.nickName ||
         res?.profileDetails?.userId ||
         getUserIdFromJid(res?.publisherJid)
      );
   }
};

export const getNotifyMessage = res => {
   switch (true) {
      case res.recallStatus === 1:
         return getStringSet().COMMON_TEXT.THIS_MESSAGE_WAS_DELETED;
      case res.msgBody.message_type === 'text':
         return res?.msgBody?.message;
      case res.msgBody.message_type === 'image':
         return imageEmoji + ' Image';
      case res.msgBody.message_type === 'video':
         return videoEmoji + ' Video';
      case res.msgBody.message_type === 'audio':
         return audioEmoji + ' Audio';
      case res.msgBody.message_type === 'file':
         return fileEmoji + ' File';
      case res.msgBody.message_type === 'location':
         return locationEmoji + ' Location';
      case res.msgBody.message_type === 'contact':
         return contactEmoji + ' Contact';
      case res.msgBody.message_type === 'notification':
         return res.msgBody.notificationContent;
   }
};

export const attachmentMenuIcons = [
   {
      name: stringSet.CHAT_SCREEN_ATTACHMENTS.DOCUMENT_LABEL,
      icon: DocumentIcon,
      formatter: openDocumentPicker,
   },
   {
      name: stringSet.CHAT_SCREEN_ATTACHMENTS.CAMERA_LABEL,
      icon: CameraIcon,
      formatter: openCamera,
   },
   {
      name: stringSet.CHAT_SCREEN_ATTACHMENTS.GALLERY_LABEL,
      icon: GalleryIcon,
      formatter: openGallery,
   },
   {
      name: stringSet.CHAT_SCREEN_ATTACHMENTS.AUDIO_LABEL,
      icon: HeadSetIcon,
      formatter: handleAudioSelect,
   },
   {
      name: stringSet.CHAT_SCREEN_ATTACHMENTS.CONTACT_LABEL,
      icon: ContactIcon,
      formatter: openMobileContact,
   },
   {
      name: stringSet.CHAT_SCREEN_ATTACHMENTS.LOCATION_LABEL,
      icon: LocationIcon,
      formatter: openLocation,
   },
];

export const settingsMenu = [
   {
      name: 'Profile',
      icon: ProfileIcon,
      rounteName: PROFILE_STACK,
   },
   {
      name: getStringSet().SETTINGS_SCREEN.CHATS_LABEL,
      icon: ChatsIcon,
      rounteName: CHATS_CREEN,
   },
   /**
    *
   {
      name: 'Notifications',
      icon: NotificationSettingsIcon,
      rounteName: NOTIFICATION_STACK,
   },
   */
   {
      name: 'Notifications',
      icon: NotificationSettingsIcon,
      rounteName: NOTIFICATION_STACK,
   },
   {
      name: 'Blocked Contact',
      icon: BlockedIcon,
      rounteName: BLOCKED_CONTACT_LIST_STACK,
   },
   {
      name: getStringSet().SETTINGS_SCREEN.LOG_OUT_LABEL,
      icon: ExitIcon,
   },
];

export const notificationMenu = [
   {
      title: 'Notification Alert',
      subtitle: 'Choose alert type for incoming messages',
      rounteName: NOTIFICATION_ALERT_STACK,
   },
];

export function capitalizeFirstLetter(string) {
   if (!string) {
      return null;
   }
   return string.charAt(0).toUpperCase() + string.slice(1);
}

export const toggleArchive = val => () => {
   try {
      const netWorkState = getNetworkState();
      if (!netWorkState) {
         return showNetWorkToast();
      }
      const unArchivedUserJids = getSelectedChats().map(item => item.userJid);
      const archivedUserJids = getArchiveSelectedChats().map(item => item.userJid);

      store.dispatch(toggleArchiveChats(val));
      if (val) {
         unArchivedUserJids.forEach(item => {
            SDK.updateArchiveChat(item, val);
         });
         showToast(`${unArchivedUserJids.length} chat has been archived`);
      } else {
         archivedUserJids.forEach(item => {
            SDK.updateArchiveChat(item, val);
         });
         showToast(`${archivedUserJids.length} chat has been unarchived`);
      }
   } catch (error) {
      return error;
   }
};

export const toggleMuteChat = async () => {
   try {
      let seletedChat = getSelectedChats();
      const userJids = seletedChat.map(item => item.userJid);
      const rosterData = store.getState().rosterData.data;
      const muteStatuses = userJids.map(jid => {
         const userId = getUserIdFromJid(jid);
         return rosterData[userId]?.muteStatus === 1;
      });
      const areAllMuted = muteStatuses.every(status => status === true);
      const muteStatus = !areAllMuted;
      store.dispatch(resetChatSelections());
      store.dispatch(toggleMute({ userJids, muteStatus }));
      const res = await SDK.updateMuteNotification(userJids, muteStatus);
      if (res.statusCode !== 200) {
         showToast(res.message);
         store.dispatch(toggleMute({ userJids, muteStatus: !muteStatus }));
      }
   } catch (error) {
      mflog('Error in toggleMuteChat', error);
      return error;
   }
};

export const isActiveChat = jid => {
   return currentChatUser !== jid || !isConversationScreenActive;
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
         showToast(stringSet.TOAST_MESSAGES.NO_APPS_AVAILABLE);
      });
};

export const copyToClipboard = (selectedMsgs, userId) => () => {
   handelResetMessageSelection(userId)();
   Clipboard.setString(selectedMsgs[0]?.msgBody.message || selectedMsgs[0]?.msgBody?.media?.caption);
   showToast(stringSet.TOAST_MESSAGES.TEXT_COPIED_SUCCESSFULLY);
};

export const getMessageObjForward = (originalMsg, toJid, newMsgId) => {
   const timestamp = Date.now();
   const createdAt = changeTimeFormat(timestamp);
   const senderId = getUserIdFromJid(getCurrentUserJid());

   return {
      ...originalMsg,
      timestamp,
      createdAt: createdAt,
      msgStatus: 3,
      msgType: 'processing',
      msgId: newMsgId,
      fromUserJid: formatUserIdToJid(senderId),
      fromUserId: senderId,
      chatType: MIX_BARE_JID.test(toJid) ? CHAT_TYPE_GROUP : CHAT_TYPE_SINGLE,
      publisherId: senderId,
      publisherJid: formatUserIdToJid(senderId),
      deleteStatus: 0,
      favouriteBy: '0',
      favouriteStatus: 0,
      isSelected: 0,
      msgBody: {
         ...originalMsg.msgBody,
         replyTo: '',
         translatedMessage: '',
         media: {
            ...originalMsg.msgBody.media,
            is_uploading: 2,
            caption: '',
            is_downloaded: 2,
         },
      },
      editMessageId: '',
   };
};

export const getRecentChatMsgObjForward = (originalMsg, toJid, newMsgId) => {
   const timestamp = Date.now();
   const createdAt = changeTimeFormat(timestamp);
   const senderId = getUserIdFromJid(getCurrentUserJid());
   const archiveSetting = getArchive();

   return {
      ...originalMsg,
      timestamp: timestamp,
      createdAt: createdAt,
      msgStatus: 3,
      msgId: newMsgId,
      fromUserJid: toJid,
      fromUserId: getUserIdFromJid(toJid),
      chatType: MIX_BARE_JID.test(toJid) ? CHAT_TYPE_GROUP : CHAT_TYPE_SINGLE,
      publisherId: senderId,
      deleteStatus: 0,
      notificationTo: '',
      toUserId: getUserIdFromJid(toJid),
      unreadCount: 0,
      filterBy: getUserIdFromJid(toJid),
      msgType: originalMsg?.msgBody?.message_type,
      favouriteBy: '0',
      favouriteStatus: 0,
      isSelected: 0,
      archiveSetting,
      msgBody: {
         ...originalMsg.msgBody,
         media: {
            ...originalMsg.msgBody.media,
            caption: '',
         },
      },
      editMessageId: '',
   };
};

export const handleReplyPress = (userId, msgId, message) => {
   const scrollIndex = findConversationMessageIndex(msgId, message);
   if (scrollIndex < 0) {
      return;
   }

   store.dispatch(highlightMessage({ userId, msgId, shouldHighlight: 1 }));

   // Compute the exact offset from stored heights
   let offset = 0;
   for (let i = 0; i < scrollIndex; i++) {
      offset += conversationFlatListRef.current.itemLayout[i] || 0; // Use stored height
   }

   // Adjust for centering
   const itemHeight = conversationFlatListRef.current.itemLayout[scrollIndex] || 50; // Default height fallback
   const screenHeight = Dimensions.get('window').height;
   const adjustedOffset = Math.max(0, offset - screenHeight / 2 + itemHeight / 2);

   conversationFlatListRef.current.scrollToOffset({
      offset: adjustedOffset,
      animated: true,
   });
   setTimeout(() => {
      store.dispatch(highlightMessage({ userId, msgId, shouldHighlight: 0 }));
   }, 1000);
};

export const findConversationMessageIndex = (msgId, message) => {
   try {
      const data = conversationFlatListRef.current.props.data;
      const index = data.findIndex(item => item.msgId === msgId);
      const { deleteStatus, recallStatus } = message;
      if (deleteStatus !== 0 || recallStatus !== 0) {
         showToast(stringSet.TOAST_MESSAGES.THIS_MESSAGE_NO_LONGER_AVAILABLE);
         return -1;
      } else if (index < 0) {
         return -1;
      } else {
         return index;
      }
   } catch (error) {
      showToast('Something went wrong');
   }
};

export const setCurrentChatUser = currentChatUserId => {
   currentChatUser = currentChatUserId;
};

export const getCurrentChatUser = () => currentChatUser;

export const groupNotifyStatus = (publisherId, toUserId, status, publisher = '', toUser = '') => {
   try {
      const publisherName = publisher || publisherId;
      const toUserName = toUser || toUserId;
      const isPublisherLocalUser = isLocalUser(publisherId);
      const isToUserLocalUser = isLocalUser(toUserId);
      switch (status) {
         case messageTypeConstants.GROUP_CREATED:
            return isPublisherLocalUser
               ? stringSet.GROUP_LABELS.GROUP_CREATED_BY_YOU
               : replacePlaceholders(stringSet.GROUP_LABELS.GROUP_CREATED_BY_PUBLISHER, {
                    publisherName,
                 });
         case messageTypeConstants.GROUP_USER_ADDED:
            const placeholderData = { publisherName, toUser: toUserName };
            if (isPublisherLocalUser && isToUserLocalUser) {
               return '';
            }
            if (isPublisherLocalUser) {
               return replacePlaceholders(stringSet.GROUP_LABELS.GROUP_YOU_ADDED, {
                  toUser: toUserName,
               });
            }
            return isToUserLocalUser
               ? replacePlaceholders(stringSet.GROUP_LABELS.GROUP_PUBLISHER_ADDED_YOU, { publisherName })
               : replacePlaceholders(stringSet.GROUP_LABELS.GROUP_ADDED_BY_PUBLISHER, placeholderData);
         case messageTypeConstants.GROUP_USER_REMOVED:
         case messageTypeConstants.GROUP_USER_LEFT:
            if (isPublisherLocalUser && isToUserLocalUser) {
               return stringSet.GROUP_LABELS.GROUP_YOU_LEFT;
            }
            if (isPublisherLocalUser) {
               return replacePlaceholders(stringSet.GROUP_LABELS.GROUP_USER_REMOVED, { userName: toUserName });
            }
            if (isToUserLocalUser) {
               return replacePlaceholders(stringSet.GROUP_LABELS.GROUP_PUBLISHER_REMOVED_YOU, {
                  userName: publisherName,
               });
            }
            return toUserId === publisherId
               ? replacePlaceholders(stringSet.GROUP_LABELS.GROUP_PUBLISHER_LEFT, { userName: publisherName })
               : replacePlaceholders(stringSet.GROUP_LABELS.GROUP_MEMBERS_REMOVED, {
                    publisherName,
                    toUser: toUserName,
                 });
         case messageTypeConstants.GROUP_PROFILE_INFO_UPDATED:
            return isPublisherLocalUser
               ? stringSet.GROUP_LABELS.YOU_UPDATED_GROUP_PROFILE
               : replacePlaceholders(stringSet.GROUP_LABELS.PUBLISHER_UPDATED_GROUP_PROFILE, { publisherName });
         case messageTypeConstants.GROUP_USER_MADE_ADMIN:
            return isToUserLocalUser
               ? stringSet.GROUP_LABELS.YOU_ARE_NOW_AN_ADMIN
               : replacePlaceholders(stringSet.GROUP_LABELS.USER_IS_NOW_AN_ADMIN, { userName: toUserName });
         default:
            return '';
      }
   } catch (error) {
      console.log('Failed to construct notification', error);
      return '';
   }
};

export const handleUpdateBlockUser = (userId, isBlocked, chatUser) => async () => {
   if (!connectionCheck()) {
      return;
   }

   const res = isBlocked ? await SDK.blockUser(chatUser) : await SDK.unblockUser(chatUser);
   if (res.statusCode === 200) {
      store.dispatch(updateBlockUser({ userId, isBlocked }));
      showToast(
         isBlocked
            ? `You have blocked ${getUserNameFromStore(userId)}`
            : `${getUserNameFromStore(userId)} has been unblocked`,
      );
      if (isBlocked) {
         stopAudioRecord();
      }
   } else {
      showToast(res?.message);
   }
   return res;
};

export const connectionCheck = () => {
   const xmppConnection = getXmppConnectionStatus();
   const isNetworkConnected = getNetworkState();
   if (!isNetworkConnected) {
      showCheckYourInternetToast();
      return false;
   }
   if (xmppConnection !== CONNECTED) {
      showToast('Connection Error');
      return false;
   }
   return true;
};

// Calculate total offset for the FlatList to scroll to
export const calculateOffset = (itemHeights, index) => {
   return Array.from({ length: index }, (_, i) => itemHeights[i] || 60).reduce((total, height) => total + height, 0);
};

export const isValidUrl = str => {
   return urlRegx.test(str);
};

export const findUrls = text => {
   const urlRegex = /https?:\/\/[^\s]+/g;
   let segments = [];
   let lastIndex = 0;

   text.replace(urlRegex, (match, offset) => {
      // Push the text before the URL (if any)
      if (offset > lastIndex) {
         segments.push({ isUrl: false, content: text.slice(lastIndex, offset) });
      }
      // Push the URL itself
      segments.push({ isUrl: true, content: match });
      lastIndex = offset + match.length;
   });

   // If there's any remaining text after the last URL, add it
   if (lastIndex < text.length) {
      segments.push({ isUrl: false, content: text.slice(lastIndex) });
   }

   return segments;
};

export const resetConversationScreen = userId => {
   dispatchSearchLoading(userId);
   handelResetMessageSelection(userId)();
   SDK.updateRecentChatUnreadCount('');
   store.dispatch(toggleEditMessage(''));
   store.dispatch(setChatSearchText(''));
   store.dispatch(toggleIsChatSearching(false));
   setCurrentChatUser('');
   SDK.activeChatUser('');
};

// Dispatch loading state helper
export const dispatchSearchLoading = (userId, loadingState = '') => {
   store.dispatch(setIsSearchChatLoading({ [userId]: loadingState }));
   /** hasDispatchedSearchLoading = loadingState !== '';*/
};
