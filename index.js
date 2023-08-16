import { Alert, AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import messaging from '@react-native-firebase/messaging';
import SDK from 'SDK/SDK';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

messaging().onMessage(async remoteMessage => {
  console.log(
    'Message handled in the background!',
    JSON.stringify(remoteMessage, null, 2),
  );
  SDK.getNotificationData();
  Alert.alert(
    'A new FCM message arrived!',
    JSON.stringify(remoteMessage, null, 2),
  );
});

AppRegistry.registerComponent(appName, () => App);
