import SDK from "../SDK/SDK";
import { callBacks } from "./callbacks";

export const getInitializeObj = () => ({
    apiBaseUrl: `https://api-uikit-qa.contus.us/api/v1`,
    licenseKey: `ckIjaccWBoMNvxdbql8LJ2dmKqT5bp`,
    callbackListeners: callBacks,
});


export const handleSDKInitialize = async () => {
    const initializeObj = getInitializeObj();
    return await SDK.initializeSDK(initializeObj);
}