import messaging from '@react-native-firebase/messaging';
import { AppRegistry, Platform } from 'react-native';
import 'react-native-get-random-values';
import App from './App';
import { name as appName } from './app.json';
import { handleSetPendingSeenStatus, updateRecentAndConversationStore } from './src/Helper';
import SDK from './src/SDK/SDK';
import { callBacks } from './src/SDKActions/callbacks';
import { pushNotify, updateNotification } from './src/Service/remoteNotifyHandle';
import { setNotificationForegroundService } from './src/calls/notification/callNotifyHandler';
import { getNotifyMessage, getNotifyNickName } from './src/components/RNCamera/Helper';

messaging().setBackgroundMessageHandler(async remoteMessage => {
   try {
      await SDK.initializeSDK({
         apiBaseUrl: 'https://api-uikit-qa.contus.us/api/v1',
         licenseKey: 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp',
         callbackListeners: callBacks,
         isSandbox: false,
      });
      if (remoteMessage.data.type === 'recall') {
         updateNotification(remoteMessage.data.message_id);
         return;
      }
      const notify = await SDK.getNotificationData(remoteMessage);
      if (notify?.statusCode === 200) {
         if (notify?.data?.type === 'receiveMessage') {
            updateRecentAndConversationStore(notify?.data);
            await handleSetPendingSeenStatus(notify?.data);
            pushNotify(
               notify?.data?.msgId,
               getNotifyNickName(notify?.data),
               getNotifyMessage(notify?.data),
               notify?.data?.fromUserJid,
            );
         }
      }
   } catch (error) {
      console.log('messaging().setBackgroundMessageHandler', error);
   }
});
if (Platform.OS === 'android') {
   setNotificationForegroundService();
}
/**
// messaging().onMessage(async remoteMessage => {
//   console.log(
//     'Message handled in the forground!',
//     JSON.stringify(remoteMessage, null, 2),
//   );
//   Alert.alert(
//     'A new FCM message arrived!',
//     JSON.stringify(remoteMessage, null, 2),
//   );
// });
 */

AppRegistry.registerComponent(appName, () => App);
