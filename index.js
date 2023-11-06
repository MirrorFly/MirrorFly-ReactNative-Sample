import { AppRegistry, Linking } from 'react-native';
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
import { callBacks } from './src/SDKActions/callbacks';
import notifee, {
  AndroidVisibility,
  EventType,
  AndroidImportance,
} from '@notifee/react-native';

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
    console.log(notify, 'notify');
    if (remoteMessage.data.type === 'mediacall') {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'default',
      });
      /** Display a notification */
      await notifee.displayNotification({
        id: notify.roomId,
        title: notify.sdkStatus,
        body: notify.status,
        data: { fromUserJID: notify.userJid } || null,
        android: {
          channelId,
          sound: 'default',
          smallIcon: 'ic_notification',
          importance: AndroidImportance.HIGH,
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
          const push_url = 'mirrorfly_rn://';
          Linking.openURL(push_url);
        }
      });
    }
    // if (notify?.statusCode === 200) {
    //   updateRecentAndConversationStore(notify?.data);
    //   if (notify?.data?.type === 'receiveMessage') {
    //     pushNotify(
    //       notify?.data?.msgId,
    //       getNotifyNickName(notify?.data),
    //       getNotifyMessage(notify?.data),
    //       notify?.data?.fromUserJid,
    //     );
    //   }
    //   handleSetPendingSeenStatus(notify?.data);
    // }
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
