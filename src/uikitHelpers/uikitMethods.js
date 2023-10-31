import AsyncStorage from '@react-native-async-storage/async-storage';
import SDK from '../SDK/SDK';
import { callBacks as sdkCallBacks } from '../SDKActions/callbacks';

let uiKitCallbackListenersVal = {},
  appInitialized = false;

export const uikitCallbackListeners = () => uiKitCallbackListenersVal || {};

export const setAppInitialized = state => (appInitialized = state);

export const getAppInitialized = async () => appInitialized;

export const handleRegister = async (userIdentifier, fcmToken) => {
  const registerRes = await SDK.register(userIdentifier, fcmToken);
  if (registerRes.statusCode === 200) {
    const { data } = registerRes;
    await AsyncStorage.setItem('credential', JSON.stringify(data));
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
