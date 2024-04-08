import messaging from '@react-native-firebase/messaging';
import { AppRegistry, Platform } from 'react-native';
import 'react-native-get-random-values';
import App from './App';
import { name as appName } from './app.json';
import { constructMessageData, setAppConfig, setupCallScreen } from './src/uikitHelpers/uikitMethods';
import { MIRRORFLY_RN } from './src/constant';

messaging().setBackgroundMessageHandler(async remoteMessage => {
   if (Platform.OS === 'ios') {
      return;
   }
   constructMessageData(remoteMessage);
});

setAppConfig({
   appSchema: MIRRORFLY_RN, //NOSONAR
});

setupCallScreen();

messaging().onMessage(async remoteMessage => {
   if (remoteMessage?.data.type === 'mediacall') {
      constructMessageData(remoteMessage);
   }
});

AppRegistry.registerComponent(appName, () => App);
