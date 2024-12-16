/**
 * @format
 */
import messaging from '@react-native-firebase/messaging';
import { AppRegistry, AppState, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { isPipModeEnabled } from './src/Helper/Calls/Utility';
import config from './src/config/config';
import { MIRRORFLY_RN } from './src/helpers/constants';
import { mirrorflyInitialize, mirrorflyNotificationHandler, setAppConfig, setupCallScreen } from './src/uikitMethods';

setAppConfig({ appSchema: MIRRORFLY_RN });

import { startNetworkLogging } from 'react-native-network-logger';
if (process.env?.NODE_ENV === 'development') {
   startNetworkLogging();
}
/**
 */
mirrorflyInitialize({
   apiBaseUrl: config.API_URL,
   licenseKey: config.licenseKey,
   callbackListeners: () => {},
   isSandbox: false,
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
   if (Platform.OS === 'android') {
      mirrorflyNotificationHandler(remoteMessage);
   }
});

messaging().onMessage(async remoteMessage => {
   if (remoteMessage?.data.type === 'mediacall' || (isPipModeEnabled() && AppState.currentState === 'background')) {
      mirrorflyNotificationHandler(remoteMessage);
   }
});

setupCallScreen();

AppRegistry.registerComponent(appName, () => App);
