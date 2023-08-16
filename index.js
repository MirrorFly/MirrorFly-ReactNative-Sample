import { Alert, AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

messaging().onMessage(async remoteMessage => {
  Alert.alert(
    'A new FCM message arrived!',
    JSON.stringify(remoteMessage, null, 2),
  );
  console.log(
    'remote message',
    remoteMessage?.notification?.title,
    remoteMessage?.notification?.body,
    remoteMessage?.notification?.data,
  );
});

AppRegistry.registerComponent(appName, () => App);
