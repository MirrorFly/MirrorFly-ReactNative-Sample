import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import SDK from '../SDK/SDK';
import { callBacks as sdkCallBacks } from '../SDKActions/callbacks';
import { requestNotificationPermission } from '../common/utils';
import { pushNotify, removeAllDeliveredNotification, updateNotification } from '../Service/remoteNotifyHandle';
import { setNotificationForegroundService } from '../calls/notification/callNotifyHandler';
import { handleSetPendingSeenStatus, updateRecentAndConversationStore } from '../Helper';
import config from '../components/chat/common/config';
import { getNotifyMessage, getNotifyNickName } from '../components/RNCamera/Helper';
import { AppRegistry, Platform } from 'react-native';
import { CallComponent } from '../calls/CallComponent';
import { setupCallKit } from '../calls/ios';
import { pushNotifyBackground } from '../Helper/Calls/Utility';

let uiKitCallbackListenersVal = {},
   appInitialized = false,
   schemaUrl = '';

export const uikitCallbackListeners = () => uiKitCallbackListenersVal || {};

export const setAppInitialized = state => (appInitialized = state);

export const getAppInitialized = async () => appInitialized;

export const handleRegister = async (userIdentifier, fcmToken) => {
   const registerRes = await SDK.register(userIdentifier, fcmToken);
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
   removeAllDeliveredNotification();
   setNotificationForegroundService();
};

export const mirrorflyInitialize = async args => {
   try {
      const { apiBaseUrl, licenseKey, isSandbox, callBack } = args;
      const mfInit = await SDK.initializeSDK({
         apiBaseUrl: apiBaseUrl,
         licenseKey: licenseKey,
         callbackListeners: sdkCallBacks,
         isSandbox: isSandbox,
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
      await SDK.initializeSDK({
         apiBaseUrl: apiBaseUrl,
         licenseKey: licenseKey,
         callbackListeners: sdkCallBacks,
         isSandbox: false,
      });
      if (remoteMessage.data.type === 'recall') {
         updateNotification(remoteMessage.data.message_id);
         return;
      }
      if (remoteMessage?.data.type === 'mediacall') {
         await SDK.getCallNotification(remoteMessage);
         return;
      }
      const notify = await SDK.getNotificationData(remoteMessage);
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
   let remoteMessageData = {
      remoteMessage,
      apiBaseUrl: config.API_URL,
      licenseKey: config.licenseKey,
   };
   mirrorflyNotificationHandler(remoteMessageData);
};

export const setupCallScreen = () => {
   //Permissions
   initializeSetup();
   if (Platform.OS === 'android') {
      AppRegistry.registerComponent('CallScreen', () => CallComponent);
   }
   if (Platform.OS === 'ios') {
      // Setup ios callkit
      setupCallKit();
      pushNotifyBackground();
   }
};
