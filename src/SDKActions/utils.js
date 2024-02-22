import SDK from '../SDK/SDK';
import config from '../components/chat/common/config';
import { callBacks } from './callbacks';

export const getInitializeObj = () => ({
   apiBaseUrl: config.API_URL,
   licenseKey: config.lisenceKey,
   callbackListeners: callBacks,
});

export const handleSDKInitialize = async () => {
   const initializeObj = getInitializeObj();
   return await SDK.initializeSDK(initializeObj);
};
