import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { AppRegistry, Platform } from 'react-native';
import { version } from '../../package.json';
import { handleSetPendingSeenStatus, updateRecentAndConversationStore } from '../Helper';
import { pushNotifyBackground } from '../Helper/Calls/Utility';
import { MIX_BARE_JID } from '../Helper/Chat/Constant';
import SDK from '../SDK/SDK';
import { callBacks as sdkCallBacks } from '../SDKActions/callbacks';
import { pushNotify, removeAllDeliveredNotification, updateNotification } from '../Service/remoteNotifyHandle';
import { CallComponent } from '../calls/CallComponent';
import { setupCallKit } from '../calls/ios';
import { setNotificationForegroundService } from '../calls/notification/callNotifyHandler';
import { requestNotificationPermission } from '../common/utils';
import { getNotifyMessage, getNotifyNickName } from '../components/RNCamera/Helper';
import config from '../config';
import RNVoipPushNotification from 'react-native-voip-push-notification';

let uiKitCallbackListenersVal = {},
   appInitialized = false,
   schemaUrl = '',
   appSchema = '',
   voipToken = '';

export const getVoipToken = () => voipToken;

export const getAppSchema = () => appSchema;

export const setAppConfig = params => {
   const { appSchema: _appSchema = '', stackURL = '' } = params;
   appSchema = _appSchema || appSchema;
   schemaUrl = _appSchema || stackURL;
};

export const mflog = (...args) => {
   console.log('RN-UIKIT', Platform.OS, version, ...args);
};

export const uikitCallbackListeners = () => uiKitCallbackListenersVal || {};

export const setAppInitialized = state => (appInitialized = state);

export const getAppInitialized = async () => appInitialized;

export const handleRegister = async (userIdentifier, fcmToken) => {
   const registerRes = await SDK.register(userIdentifier, fcmToken, voipToken, process.env?.NODE_ENV === 'production');
   if (registerRes.statusCode === 200) {
      const { data } = registerRes;
      await AsyncStorage.setItem('credential', JSON.stringify(data));
      await AsyncStorage.setItem('userIdentifier', JSON.stringify(userIdentifier));
      const connect = await SDK.connect(data.username, data.password);
      switch (connect?.statusCode) {
         case 200:
         case 409:
            let jid = await SDK.getCurrentUserJid();
            let userJID = jid.userJid.split('/')[0];
            AsyncStorage.setItem('currentUserJID', JSON.stringify(userJID));
            connect.jid = userJID;
            return connect;
         default:
            return connect;
      }
   } else {
      return registerRes;
   }
};

const initializeSetup = async () => {
   await messaging().requestPermission();
   requestNotificationPermission();
   setNotificationForegroundService();
};

export const mirrorflyInitialize = async args => {
   try {
      removeAllDeliveredNotification();
      const { apiBaseUrl, licenseKey, isSandbox, callBack, chatHistroy = false } = args;
      const mfInit = await SDK.initializeSDK({
         apiBaseUrl: apiBaseUrl,
         licenseKey: licenseKey,
         callbackListeners: sdkCallBacks,
         isSandbox: isSandbox,
         chatHistroy,
      });
      uiKitCallbackListenersVal = { callBack };
      if (mfInit.statusCode === 200) {
         setAppInitialized(true);
      }
      return mfInit;
   } catch (error) {
      return error;
   }
};

export const mirrorflyRegister = async args => {
   try {
      const { userIdentifier, fcmToken } = args;
      const _credential = await AsyncStorage.getItem('credential');
      const _userJID = await AsyncStorage.getItem('currentUserJID');
      const parsedCredential = JSON.parse(_credential);
      if (parsedCredential?.username === userIdentifier) {
         return {
            statusCode: 409,
            message: 'Registered User',
            jid: JSON.parse(_userJID),
         };
      }
      return handleRegister(userIdentifier, fcmToken);
   } catch (error) {
      return error;
   }
};

export const mirrorflyProfileUpdate = async args => {
   try {
      const mobileNumber = await AsyncStorage.getItem('userIdentifier');
      const { nickName, image, status, email } = args;
      return SDK.setUserProfile(nickName, image, status, JSON.parse(mobileNumber), email);
   } catch (error) {
      return error;
   }
};

export const mirrorflyNotificationHandler = async messageData => {
   try {
      const { remoteMessage = {}, apiBaseUrl = '', licenseKey = '' } = messageData;
      if (remoteMessage?.data?.push_from !== 'MirrorFly') {
         return;
      }
      if (MIX_BARE_JID.test(remoteMessage?.data?.user_jid)) {
         return;
      }
      await SDK.initializeSDK({
         apiBaseUrl: apiBaseUrl,
         licenseKey: licenseKey,
         callbackListeners: sdkCallBacks,
         isSandbox: false,
         chatHistroy: false,
      });
      if (remoteMessage?.data.type === 'mediacall') {
         await SDK.getCallNotification(remoteMessage);
         return;
      }
      const notify = await SDK.getNotificationData(remoteMessage);
      if (remoteMessage.data.type === 'recall') {
         updateNotification(remoteMessage?.data?.message_id);
         return;
      }
      if (notify?.statusCode === 200) {
         if (notify?.data?.type === 'receiveMessage') {
            updateRecentAndConversationStore(notify?.data);
            await handleSetPendingSeenStatus(notify?.data);
            pushNotify(
               notify?.data?.msgId,
               getNotifyNickName(notify?.data),
               getNotifyMessage(notify?.data),
               notify?.data?.fromUserJid,
            );
         }
      }
   } catch (error) {
      console.log('messaging().setBackgroundMessageHandler', error);
   }
};

export const constructMessageData = remoteMessage => {
   try {
      let remoteMessageData = {
         remoteMessage,
         apiBaseUrl: config.API_URL,
         licenseKey: config.licenseKey,
      };
      mirrorflyNotificationHandler(remoteMessageData);
   } catch (error) {
      mflog('Failed to construct notification data', error);
   }
};

const setApplicationUrl = url => {
   schemaUrl = url;
};

export const getApplicationUrl = () => schemaUrl;

export const setupCallScreen = async () => {
   //Permissions
   await initializeSetup();
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
