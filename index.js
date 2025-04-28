/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import config from './src/config/config';
import { MIRRORFLY_RN } from './src/helpers/constants';
import { mirrorflyInitialize, setAppConfig, setupCallScreen } from './src/uikitMethods';

setAppConfig({ appSchema: MIRRORFLY_RN });

mirrorflyInitialize({
   apiBaseUrl: config.API_URL,
   licenseKey: config.licenseKey,
   isSandbox: false,
});

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//    if (Platform.OS === 'android') {
//       mirrorflyNotificationHandler(remoteMessage);
//    }
// });

// messaging().onMessage(async remoteMessage => {
//    if (remoteMessage?.data.type === 'mediacall' || (isPipModeEnabled() && AppState.currentState === 'background')) {
//       mirrorflyNotificationHandler(remoteMessage);
//    }
// });

setupCallScreen();

AppRegistry.registerComponent(appName, () => App);
