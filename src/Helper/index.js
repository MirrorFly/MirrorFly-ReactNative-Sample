import React from 'react';
import { Toast } from 'native-base';
import { Alert, Linking, Platform, Text, View } from 'react-native';
import Graphemer from 'graphemer';
import RNFS from 'react-native-fs';
import { Image as ImageCompressor } from 'react-native-compressor';
import { createThumbnail } from 'react-native-create-thumbnail';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Store from '../redux/store';
import { updateRosterData } from '../redux/Actions/rosterAction';
import { profileDetail } from '../redux/Actions/ProfileAction';
import SDK from '../SDK/SDK';
import { updateUserProfileStore } from './Chat/ChatHelper';
import { toastStyles } from '../common/commonStyles';
import * as RootNav from '../Navigation/rootNavigation';
import { navigate } from '../redux/Actions/NavigationAction';
import { MAP_THHUMBNAIL_URL, CHATSCREEN, CHATCONVERSATION } from '../constant';
import config from '../components/chat/common/config';
import { updateChatConversationLocalNav } from '../redux/Actions/ChatConversationLocalNavAction';
import { addchatSeenPendingMsg } from '../redux/Actions/chatSeenPendingMsgAction';
import {
  updateConversationMessage,
  updateRecentChatMessage,
} from '../components/chat/common/createMessage';

const toastLocalRef = React.createRef({});
toastLocalRef.current = {};

const toastConfig = {
  duration: 2500,
  avoidKeyboard: true,
};

/**
 * showToast
 * @param {String} message
 * @param {Object} options
 * @example ('Toast Message', {id:'toast-id'})
 */
export const showToast = (message, options, ignoreDuplicateToast = true) => {
  const id = options?.id || Date.now();
  if (options.id && ignoreDuplicateToast && toastLocalRef.current[options.id]) {
    return;
  }

  toastLocalRef.current[id] = true;

  options.onCloseComplete = () => {
    delete toastLocalRef.current[id];
  };

  Toast.show({
    ...toastConfig,
    ...options,
    render: () => {
      return (
        <View style={toastStyles.toastContainer}>
          <Text style={toastStyles.toastContent}>{message}</Text>
        </View>
      );
    },
  });
};

export const showAlert = (message, title) => {
  Alert.alert(title, message);
};

export const convertBytesToKB = bytes => {
  if (bytes < 1024) {
    // If the size is less than 1KB, return bytes only
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    // If the size is less than 1MB, return in KB
    const KB = bytes / 1024;
    return KB.toFixed(2) + ' KB';
  } else {
    // If the size is 1MB or more, return in MB
    const MB = bytes / (1024 * 1024);
    return MB.toFixed(2) + ' MB';
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
    quality: 0.8,
  });
  const response = await RNFS.readFile(result, 'base64');
  return response;
};

/**
 * Helpler function to generate thumbnail for video
 * @param {string} uri local file path of the video
 * @returns {Promise<string>} returns the base64 data of the Thumbnail Image
 */
export const getVideoThumbImage = async uri => {
  let response;
  if (Platform.OS === 'ios') {
    if (uri.includes('ph://')) {
      let result = await ImageCompressor.compress(uri, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8,
      });
      response = await RNFS.readFile(result, 'base64');
    } else {
      const frame = await createThumbnail({
        url: uri,
        timeStamp: 10000,
      });
      response = await RNFS.readFile(frame.path, 'base64');
    }
  } else {
    const frame = await createThumbnail({
      url: uri,
      timeStamp: 10000,
    });
    response = await RNFS.readFile(frame.path, 'base64');
  }
  return response;
};

export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Helper function to update the User profile details
 *
 * If It is current User It is update in Async Storage as well
 */
export const updateUserProfileDetails = async data => {
  const userIdentifier = JSON.parse(
    (await AsyncStorage.getItem('userIdentifier')) || '""',
  );
  if (data?.userId === userIdentifier) {
    AsyncStorage.setItem('vCardProfile', JSON.stringify(data));
    Store.dispatch(profileDetail(data));
  } else {
    Store.dispatch(updateRosterData(data));
  }
};

const memoizedUsernameGraphemes = {};
const splitter = new Graphemer();

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

export const fetchContactsFromSDK = async (
  _searchText,
  _pageNumber,
  _limit,
) => {
  let contactsResponse = await SDK.getUsersList(
    _searchText,
    _pageNumber,
    _limit,
  );
  // update the user profile store
  if (contactsResponse.statusCode === 200) {
    updateUserProfileStore(contactsResponse.users);
  }
  return contactsResponse;
};

export const showCheckYourInternetToast = () => {
  showToast('Please check your internet connection', {
    id: 'no-internet-toast',
  });
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
      showToast('Unable to open the location', {
        id: 'location-open-error-toast',
      });
    });
  } else {
    showToast('No app found to open location', {
      id: 'location-open-error-toast',
    });
  }
};

export const getLocationImageURL = ({ latitude, longitude }) => {
  return `${MAP_THHUMBNAIL_URL}?center=${latitude},${longitude}&zoom=13&size=300x200&markers=color:red|${latitude},${longitude}&key=${config.GOOGLE_LOCATION_API_KEY}`;
};

export const addPendingSeenStatusMsg = obj => {
  Store.dispatch(addchatSeenPendingMsg(obj));
};

export const getPendingSeenStatusMsg = async () => {
  const storedVal = await AsyncStorage.getItem('pendingSeenStatus');
  return JSON.parse(storedVal);
};

export const handleSetPendingSeenStatus = async obj => {
  const parsedStoreVal = await getPendingSeenStatusMsg();
  if (parsedStoreVal) {
    const filterdArr = parsedStoreVal?.data.filter(
      o => o.msgId !== obj.msgId && obj.msgStatus === 1,
    );
    if (filterdArr?.length) {
      filterdArr?.forEach(element => {
        addPendingSeenStatusMsg(element);
      });
    }
    if (!parsedStoreVal?.data.length) {
      addPendingSeenStatusMsg(obj);
    }
  } else {
    addPendingSeenStatusMsg(obj);
  }
};

export const updateRecentAndConversationStore = obj => {
  updateRecentChatMessage(obj, Store.getState());
  updateConversationMessage(obj, Store.getState());
};

export const escapeRegExpReservedChars = str => {
  return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};
