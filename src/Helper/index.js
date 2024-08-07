/**
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Graphemer from 'graphemer';
// import { Toast } from 'native-base';
// import React from 'react';
// import { Alert, AppState, Keyboard, Linking, Platform, Text, View } from 'react-native';
// import { Image as ImageCompressor } from 'react-native-compressor';
// import { createThumbnail } from 'react-native-create-thumbnail';
// import RNFS from 'react-native-fs';
// import SDK from '../SDK/SDK';
// import { getIsUserOnCall } from '../SDKActions/callbacks';
// import { toastStyles } from '../common/commonStyles';
// import config from '../config';
// import { updateConversationMessage, updateRecentChatMessage } from '../components/chat/common/createMessage';
// import { MAP_THHUMBNAIL_URL } from '../constant';
// import PipHandler from '../customModules/PipModule';
// import { profileDetail } from '../redux/Actions/ProfileAction';
// import { addchatSeenPendingMsg } from '../redux/Actions/chatSeenPendingMsgAction';
// import { updateRosterData } from '../redux/Actions/rosterAction';
// import Store from '../redux/store';
// import { updateUserProfileStore } from './Chat/ChatHelper';
// import { getUserIdFromJid } from './Chat/Utility';

import { Keyboard, Platform } from 'react-native';
import { getIsUserOnCall } from '../SDK/sdkCallBacks';
import PipHandler from '../customModules/PipModule';
*/
/**
// const toastLocalRef = React.createRef({});
// toastLocalRef.current = {};

// const toastConfig = {
//    duration: 2500,
//    avoidKeyboard: true,
// };
*/
// /**
//  * showToast
//  * @param {String} message
//  * @param {Object} options
//  * @example ('Toast Message', {id:'toast-id'})
//  */
/**
// export const showToast = (message, options, ignoreDuplicateToast = true) => {
//    const id = options?.id || Date.now();
//    if (options.id && ignoreDuplicateToast && toastLocalRef.current[options.id]) {
//       return;
//    }

//    toastLocalRef.current[id] = true;

//    options.onCloseComplete = () => {
//       delete toastLocalRef.current[id];
//    };

//    Toast.show({
//       ...toastConfig,
//       ...options,
//       render: () => {
//          return (
//             <View style={toastStyles.toastContainer}>
//                <Text style={toastStyles.toastContent}>{message}</Text>
//             </View>
//          );
//       },
//    });
// };

// export const showAlert = (message, title) => {
//    Alert.alert(title, message);
// };

// export const convertBytesToKB = bytes => {
//    if (bytes < 1024) {
//       // If the size is less than 1KB, return bytes only
//       return bytes + ' bytes';
//    } else if (bytes < 1024 * 1024) {
//       // If the size is less than 1MB, return in KB
//       const KB = bytes / 1024;
//       return KB.toFixed(2) + ' KB';
//    } else {
//       // If the size is 1MB or more, return in MB
//       const MB = bytes / (1024 * 1024);
//       return MB.toFixed(2) + ' MB';
//    }
// };
*/

import { Keyboard } from 'react-native';
import { getIsUserOnCall } from '../SDK/sdkCallBacks';
import PipHandler from '../customModules/PipModule';

// /**
//  * Helper function to generate thumbnail for image
//  * @param {string} uri - local path if the image
//  * @returns {Promise<string>} returns the base64 data of the Thumbnail Image
//  */
/**
// export const getThumbImage = async uri => {
//    const result = await ImageCompressor.compress(uri, {
//       maxWidth: 200,
//       maxHeight: 200,
//       quality: 0.8,
//    });
//    const response = await RNFS.readFile(result, 'base64');
//    return response;
// };
 */
// /**
//  * Helpler function to generate thumbnail for video
//  * @param {string} uri local file path of the video
//  * @returns {Promise<string>} returns the base64 data of the Thumbnail Image
//  */
/**
// export const getVideoThumbImage = async uri => {
//    let response;
//    if (Platform.OS === 'ios') {
//       if (uri.includes('ph://')) {
//          let result = await ImageCompressor.compress(uri, {
//             maxWidth: 600,
//             maxHeight: 600,
//             quality: 0.8,
//          });
//          response = await RNFS.readFile(result, 'base64');
//       } else {
//          const frame = await createThumbnail({
//             url: uri,
//             timeStamp: 10000,
//          });
//          response = await RNFS.readFile(frame.path, 'base64');
//       }
//    } else {
//       const frame = await createThumbnail({
//          url: uri,
//          timeStamp: 10000,
//       });
//       response = await RNFS.readFile(frame.path, 'base64');
//    }
//    return response;
// };

export const debounce = (func, delay) => {
   let timeout;
   return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
         func(...args);
      }, delay);
   };
};
 */
// /**
//  * Helper function to update the User profile details
//  *
//  * If It is current User It is update in Async Storage as well
//  */
/**
// export const updateUserProfileDetails = async data => {
//    const userIdentifier = JSON.parse((await AsyncStorage.getItem('userIdentifier')) || '""');
//    if (data?.userId === userIdentifier) {
//       AsyncStorage.setItem('vCardProfile', JSON.stringify(data));
//       Store.dispatch(profileDetail(data));
//    }
//    Store.dispatch(updateRosterData(data));
// };

// const memoizedUsernameGraphemes = {};
// const splitter = new Graphemer();

// export const getUsernameGraphemes = (input = '') => {
//    if (memoizedUsernameGraphemes[input]) {
//       return memoizedUsernameGraphemes[input];
//    }

//    if (input) {
//       const graphemes = splitter.splitGraphemes(input);
//       let result = '';
//       if (graphemes.includes(' ')) {
//          let preVele;
//          graphemes.forEach(element => {
//             if (preVele === ' ') {
//                preVele = element;
//                result = graphemes[0] + element;
//             }
//             preVele = element;
//          });
//       }
//       if (!result) {
//          result = (graphemes[0] || '') + (graphemes[1] || '');
//       }
//       result = result.toUpperCase();
//       memoizedUsernameGraphemes[input] = result;
//       return result;
//    } else {
//       return '';
//    }
// };

// export const fetchContactsFromSDK = async (_searchText, _pageNumber, _limit) => {
//    let contactsResponse = await SDK.getUsersList(_searchText, _pageNumber, _limit);
//    // update the user profile store
//    if (contactsResponse.statusCode === 200) {
//       updateUserProfileStore(contactsResponse.users);
//    }
//    return contactsResponse;
// };

// export const showCheckYourInternetToast = () => {
//    showToast('Please check your internet connection', {
//       id: 'no-internet-toast',
//    });
// };

// export const openLocationExternally = (latitude, longitude) => {
//    const scheme = Platform.select({
//       ios: 'maps://0,0?q=',
//       android: 'geo:0,0?q=',
//    });
//    const latLng = `${latitude},${longitude}`;
//    const locationUrl = Platform.select({
//       ios: `${scheme}${latLng}`,
//       android: `${scheme}${latLng}`,
//    });
//    if (Linking.canOpenURL(locationUrl)) {
//       Linking.openURL(locationUrl).catch(() => {
//          showToast('Unable to open the location', {
//             id: 'location-open-error-toast',
//          });
//       });
//    } else {
//       showToast('No app found to open location', {
//          id: 'location-open-error-toast',
//       });
//    }
// };

// export const getLocationImageURL = ({ latitude, longitude }) => {
//    return `${MAP_THHUMBNAIL_URL}?center=${latitude},${longitude}&zoom=13&size=300x200&markers=color:red|${latitude},${longitude}&key=${config.GOOGLE_LOCATION_API_KEY}`;
// };

// export const addPendingSeenStatusMsg = obj => {
//    Store.dispatch(addchatSeenPendingMsg(obj));
// };

// export const getPendingSeenStatusMsg = async () => {
//    const storedVal = await AsyncStorage.getItem('pendingSeenStatus');
//    return JSON.parse(storedVal);
// };

// export const handleSetPendingSeenStatus = async obj => {
//    if (AppState.currentState === 'background') {
//       Store.dispatch(addchatSeenPendingMsg(obj));
//    } else {
//       const parsedStoreVal = await getPendingSeenStatusMsg();
//       if (parsedStoreVal?.data.length) {
//          parsedStoreVal?.data.forEach(element => {
//             Store.dispatch(addchatSeenPendingMsg(element));
//          });
//       }
//    }
// };

// export const updateRecentAndConversationStore = obj => {
//    updateRecentChatMessage(obj, Store.getState());
//    updateConversationMessage(obj, Store.getState());
// };

// export const escapeRegExpReservedChars = str => {
//    return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
// };

// export const getUserProfileFromSDK = userId => {
//    const data = Store.getState().rosterData.data;
//    const userData = data[userId] || {};
//    if (data[userId]) {
//       return userData;
//    }
//    return SDK.getUserProfile(userId, false, true).then(res => {
//       if (res?.statusCode === 200) {
//          if (res.data !== userData) {
//             updateUserProfileStore(res.data);
//          }
//       }
//       return res;
//    });
// };
 */
// /**
//  * Helper function to get the contact user profile details for specific userId from rosterData redux reducer state
//  * @param {string} userId userId of the profile details needed
//  * @returns {import('../hooks/useRosterData').userProfileDetails}
//  */
/**
// export const getUserProfile = userId => {
//    // if JID passed mistakenly, then get the userId from it
//    const _userId = getUserIdFromJid(userId);
//    const rosterData = Store.getState().rosterData?.data || {};
//    if (_userId in rosterData) {
//       return rosterData[_userId];
//    } else if (_userId) {
//       getUserProfileFromSDK(_userId);
//       return {
//          nickName: '',
//          userId: _userId,
//       };
//    } else {
//       return {};
//    }
// };
 */
/**
 * Helper function to enable PIP mode for Android if the call is connected
 * @param {number} width
 * @param {number} height
 * @returns {boolean} - whether PIP mode has enabled or not based on the call connected status condition
 */
export const enablePipModeIfCallConnected = (
   width = 300,
   height = 600,
   shouldOpenPermissionScreenIfPipNotAllowed = true,
) => {
   if (Platform.OS === 'android') {
      Keyboard.dismiss();
      const isCallConnected = getIsUserOnCall();
      isCallConnected && PipHandler.enterPipMode(width, height, shouldOpenPermissionScreenIfPipNotAllowed);
      return isCallConnected;
   }
};
