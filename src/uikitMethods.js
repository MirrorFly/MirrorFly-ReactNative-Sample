import notifee from '@notifee/react-native';
import { AppRegistry, Platform } from 'react-native';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import { version } from '../package.json';
import { pushNotifyBackground } from './Helper/Calls/Utility';
import RootNavigation from './Navigation/rootNavigation';
import SDK, { RealmKeyValueStore } from './SDK/SDK';
import { callBacks } from './SDK/sdkCallBacks';
import { getUserSettings, resetVariable, updateNotificationSettings } from './SDK/utils';
import { pushNotify, updateNotification } from './Service/remoteNotifyHandle';
import { CallComponent } from './calls/CallComponent';
import { setupCallKit } from './calls/ios';
import { setNotificationForegroundService } from './calls/notification/callNotifyHandler';
import { getNotifyMessage, getNotifyNickName, getUserIdFromJid, showToast } from './helpers/chatHelpers';
import { addChatMessageItem } from './redux/chatMessageDataSlice';
import { clearState } from './redux/clearSlice';
import { addRecentChatItem } from './redux/recentChatDataSlice';
import { getArchive, getRoasterData } from './redux/reduxHook';
import { setRoasterData } from './redux/rosterDataSlice';
import store from './redux/store';
import { RECENTCHATSCREEN, REGISTERSCREEN } from './screens/constants';

let uiKitCallbackListenersVal = {},
   appInitialized = false,
   schemaUrl = '',
   appSchema = '',
   voipToken = '',
   currentUserJID = '',
   currentUserProfile = {},
   currentScreen = '';

export const getAppSchema = () => appSchema;
export const getCurrentScreen = () => currentScreen;
export const getAppInitStatus = () => appInitialized;
export const getCurrentUserJid = () => currentUserJID;
export const getLocalUserDetails = () => currentUserProfile;
export const setCurrectUserProfile = profile => {
   currentUserProfile = profile;
};

export const mflog = (...args) => {
   console.log('RN-UIKIT', Platform.OS, version, ...args);
};

export const setAppConfig = params => {
   const { appSchema: _appSchema = '', stackURL = '' } = params;
   appSchema = _appSchema || appSchema;
   schemaUrl = _appSchema || stackURL;
};

export const mirrorflyNotificationHandler = async remoteMessage => {
   try {
      if (remoteMessage?.data?.push_from !== 'MirrorFly') {
         return;
      }
      if (remoteMessage?.data.type === 'mediacall') {
         await SDK.getCallNotification(remoteMessage);
         return;
      }
      const notify = await SDK.getNotificationData(remoteMessage);
      if (notify?.data?.muteStatus === 1) {
         return;
      }
      if (remoteMessage.data.type === 'recall') {
         updateNotification(remoteMessage?.data?.message_id);
         return;
      }
      if (notify?.statusCode === 200) {
         if (
            notify?.data?.type === 'receiveMessage' ||
            notify?.data?.msgType === 'groupCreated' ||
            notify?.data?.msgType === 'groupProfileUpdated'
         ) {
            pushNotify(
               notify?.data?.msgId,
               getNotifyNickName(notify?.data),
               getNotifyMessage(notify?.data),
               notify?.data?.fromUserJid,
            );
            notify.data.archiveSetting = getArchive();
            store.dispatch(addRecentChatItem(notify?.data));
            store.dispatch(addChatMessageItem(notify?.data));
         }
      }
   } catch (error) {
      console.log('messaging().setBackgroundMessageHandler', error);
   }
};

export const mirrorflyInitialize = async args => {
   try {
      const { apiBaseUrl, licenseKey, isSandbox, callBack } = args;
      const mfInit = await SDK.initializeSDK({
         apiBaseUrl: apiBaseUrl,
         licenseKey: licenseKey,
         callbackListeners: callBacks,
         isSandbox: isSandbox,
      });
      uiKitCallbackListenersVal = { callBack };
      if (mfInit.statusCode === 200) {
         appInitialized = true;
         const data = await RealmKeyValueStore.getAll();
         const _extractedData = data.reduce((result, { key, value }) => {
            result[key] = value;
            return result;
         }, {});
         currentUserJID = _extractedData?.['currentUserJID'];
         currentScreen = _extractedData?.['screen'] || REGISTERSCREEN;
         fetchCurrentUserProfile();
         updateNotificationSettings();
      }
      await notifee.requestPermission();
      return mfInit;
   } catch (error) {
      return error;
   }
};

export const mirrorflyRegister = async ({ userIdentifier, fcmToken = '', metadata = {} }) => {
   try {
      if (currentUserJID) {
         return {
            statusCode: 409,
            message: 'Registered User',
            jid: currentUserJID,
         };
      }

      const registerRes = await SDK.register(
         userIdentifier,
         fcmToken,
         voipToken,
         process.env?.NODE_ENV === 'production',
         metadata,
      );
      if (registerRes.statusCode === 200) {
         const { data } = registerRes;
         const connect = await SDK.connect(data.username, data.password);
         switch (connect?.statusCode) {
            case 200:
            case 409:
               let jid = await SDK.getCurrentUserJid();
               let userJID = jid.userJid.split('/')[0];
               connect.jid = userJID;
               RealmKeyValueStore.setItem('currentUserJID', userJID);
               currentUserJID = userJID;
               fetchCurrentUserProfile(true);
               getUserSettings(true);
               SDK.getArchivedChats(true);
               updateNotificationSettings();
               Promise.resolve(connect);
               SDK.getUsersIBlocked();
               SDK.getUsersWhoBlockedMe();
               break;
            default:
               return connect;
         }
      } else {
         showToast(registerRes.message);
         return registerRes;
      }
   } catch (error) {
      return error;
   }
};

export const mirrorflyConnect = async (username, password) => {
   const connect = await SDK.connect(username, password);
   switch (connect?.statusCode) {
      case 200:
      case 409:
         let jid = await SDK.getCurrentUserJid();
         let userJID = jid.userJid.split('/')[0];
         connect.jid = userJID;
         if (navEnabled) {
            RootNavigation.reset(RECENTCHATSCREEN);
         }
         return connect;
      default:
         return connect;
   }
};

export const logoutClearVariables = () => {
   resetVariable();
   currentUserJID = '';
   currentUserProfile = {};
   currentScreen = REGISTERSCREEN;
   store.dispatch(clearState());
};

export const mirrorflyLogout = async () => {
   try {
      const { statusCode = '', message = '' } = await SDK.logout();
      if (statusCode !== 200) {
         showToast(message);
         return statusCode;
      }
      return statusCode;
   } catch (error) {}
};

export const fetchCurrentUserProfile = async (iq = false) => {
   if (currentUserJID) {
      const { data = {} } = await SDK.getUserProfile(getUserIdFromJid(currentUserJID), iq);
      currentUserProfile = data;
      store.dispatch(setRoasterData(data));
   }
};

export const mirrorflyProfileUpdate = async ({ nickName, image, status, mobileNumber, email }) => {
   const {
      nickName: _nickName,
      image: _image,
      status: _status,
      mobileNumber: _mobileNumber,
      email: _email,
   } = getRoasterData(getUserIdFromJid(currentUserJID));
   const updatedNickName = nickName !== undefined ? nickName : _nickName;
   const updatedImage = image !== undefined ? image : _image;
   const updatedStatus = status !== undefined ? status : _status;
   const updatedMobileNumber = mobileNumber !== undefined ? mobileNumber : _mobileNumber;
   const updatedEmail = email !== undefined ? email : _email;
   let UserInfo = await SDK.setUserProfile(
      updatedNickName,
      updatedImage,
      updatedStatus,
      updatedMobileNumber,
      updatedEmail,
   );
   currentScreen = RECENTCHATSCREEN;
   return UserInfo;
};

export const registerVoipToken = () => {
   RNVoipPushNotification.addEventListener('register', token => {
      // --- send token to your apn provider server
      voipToken = token;
      // unsubscrobing the listener
      RNVoipPushNotification.removeEventListener('register');
   });
   // =====  register =====
   RNVoipPushNotification.registerVoipToken();
};

export const setupCallScreen = async () => {
   //Permissions
   setNotificationForegroundService();
   if (Platform.OS === 'android') {
      AppRegistry.registerComponent('CallScreen', () => CallComponent);
   }
   if (Platform.OS === 'ios') {
      // Setup ios callkit
      registerVoipToken();
      setupCallKit();
      pushNotifyBackground();
   }
};
