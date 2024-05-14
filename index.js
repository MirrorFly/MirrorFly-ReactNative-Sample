import { AppRegistry } from 'react-native';
import 'react-native-get-random-values';
import App from './App';
import { name as appName } from './app.json';
import { setAppConfig, setupCallScreen } from './src/uikitHelpers/uikitMethods';
import { APP_SCHEMA } from './src/constant';

// import messaging from '@react-native-firebase/messaging'; //
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//    if (Platform.OS === 'ios') {
//       return;
//    }
//    constructMessageData(remoteMessage);
// });

setAppConfig({
   appSchema: APP_SCHEMA, //NOSONAR
});

setupCallScreen();

// messaging().onMessage(async remoteMessage => {
//    if (remoteMessage?.data.type === 'mediacall') {
//       constructMessageData(remoteMessage);
//    }
// });

AppRegistry.registerComponent(appName, () => App);
