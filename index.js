/**
 * @format
 */
import messaging from '@react-native-firebase/messaging';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import config from './src/config/config';
import { mirrorflyInitialize, mirrorflyNotificationHandler, setupCallScreen } from './src/uikitMethods';

/**
 import { startNetworkLogging } from 'react-native-network-logger';
 if (process.env?.NODE_ENV === 'development') {
    startNetworkLogging();
 }
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
   if (remoteMessage?.data.type === 'mediacall') {
      mirrorflyNotificationHandler(remoteMessage);
   }
});

setupCallScreen();

AppRegistry.registerComponent(appName, () => App);
