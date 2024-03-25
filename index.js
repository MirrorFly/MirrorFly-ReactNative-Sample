import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import 'react-native-get-random-values';
import App from './App';
import { name as appName } from './app.json';
import {  setupCallScreen, constructMessageData } from './src/uikitHelpers/uikitMethods';

messaging().setBackgroundMessageHandler(async remoteMessage => {
   constructMessageData(remoteMessage);
});

setupCallScreen();

messaging().onMessage(async remoteMessage => {
   constructMessageData(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
