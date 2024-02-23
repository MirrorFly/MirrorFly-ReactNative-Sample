import SDK from "../SDK/SDK";
import config from "../components/chat/common/config";
import { callBacks } from "./callbacks";

export const getInitializeObj = () => ({
    apiBaseUrl: config.API_URL,
    licenseKey: config.licenseKey,
    callbackListeners: callBacks,
});
