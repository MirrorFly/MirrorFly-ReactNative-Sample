import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import 'react-native-get-random-values';
import App from './App';
import { name as appName } from './app.json';
import { constructMessageData, setupCallScreen } from './src/uikitHelpers/uikitMethods';

messaging().setBackgroundMessageHandler(async remoteMessage => {
   constructMessageData(remoteMessage);
});

setupCallScreen();

messaging().onMessage(async remoteMessage => {
   if (remoteMessage?.data.type === 'mediacall') {
      constructMessageData(remoteMessage);
   }
});

AppRegistry.registerComponent(appName, () => App);
