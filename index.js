/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import config from './src/config/config';
import { mirrorflyInitialize, setupCallScreen } from './src/uikitMethods';

mirrorflyInitialize({
   apiBaseUrl: config.API_URL,
   licenseKey: config.licenseKey,
   callbackListeners: () => {},
   isSandbox: false,
});

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//    if (Platform.OS === 'android') {
//       mirrorflyNotificationHandler(remoteMessage);
//    }
// });

// messaging().onMessage(async remoteMessage => {
//    if (remoteMessage?.data.type === 'mediacall') {
//       mirrorflyNotificationHandler(remoteMessage);
//    }
// });

setupCallScreen();

AppRegistry.registerComponent(appName, () => App);
