import config from '../config';
import { callBacks } from './callbacks';

export const getInitializeObj = () => ({
   apiBaseUrl: config.API_URL,
   licenseKey: config.licenseKey,
   callbackListeners: callBacks,
});
