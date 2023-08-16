
import { Alert, AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import messaging from '@react-native-firebase/messaging';
import { handleSDKInitialize } from './src/SDKActions/utils';
import store from './src/redux/store';
import { remoteNotifyHandle } from './src/Service/remoteNotifyHandle';
import {connectAgain} from './src/Service/Auth'
import PushNotify from './src/Service/PushNotify';

// const isConnected = store.getState().auth.isConnected == 'notConnected';

// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     await handleSDKInitialize()
//     if (isConnected) {
//         await connectAgain()
//     }
//     await remoteNotifyHandle(remoteMessage)
// })

// messaging().onMessage(async remoteMessage => {
//     console.log(remoteMessage, "remote message onForGround");
//     // const date = new Date(Date.now() + 300);
//     // const title = remoteMessage?.from;
//     // const body = remoteMessage?.messageId;
//     // pushNotifiLocal.scheduleNotify(date, title, body);
//     // if (remoteMessage?.data?.sent_from === )
//     await remoteNotifyHandle(remoteMessage, 'onForGround')
// });
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
});


 messaging().onMessage(async remoteMessage => {
     Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage,null,2));
     console.log( "remote message", remoteMessage?.notification?.title,
     remoteMessage?.notification?.body,
     remoteMessage?.notification?.data);
     PushNotify.displayRemoteNotification(
        remoteMessage?.notification?.title,
        remoteMessage?.notification?.body,
        remoteMessage?.notification?.data,
    )
});

AppRegistry.registerComponent(appName, () => App);
