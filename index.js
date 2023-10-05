import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import messaging from '@react-native-firebase/messaging';
import SDK from './src/SDK/SDK';
import {
  pushNotify,
  updateNotification,
} from './src/Service/remoteNotifyHandle';
import {
  getNotifyMessage,
  getNotifyNickName,
} from './src/components/RNCamera/Helper';
import {
  handleSetPendingSeenStatus,
  updateRecentAndConversationStore,
} from './src/Helper';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    console.log(
      'setBackgroundMessageHandler remoteMessage',
      JSON.stringify(remoteMessage, null, 2),
    );
    if (remoteMessage.data.type === 'recall') {
      updateNotification(remoteMessage.data.message_id);
      return;
    }
    const notify = await SDK.getNotificationData(remoteMessage);
    if (notify?.statusCode === 200) {
      updateRecentAndConversationStore(notify?.data);
      if (notify?.data?.type === 'receiveMessage') {
        pushNotify(
          notify?.data?.msgId,
          getNotifyNickName(notify?.data),
          getNotifyMessage(notify?.data),
          notify?.data?.fromUserJid,
          false,
        );
      }
      handleSetPendingSeenStatus(notify?.data);
    }
  } catch (error) {
    console.log('messaging().setBackgroundMessageHandler', error);
  }
});
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
