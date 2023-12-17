import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import messaging from '@react-native-firebase/messaging';
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

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    await global.SDK.initializeSDK({
      apiBaseUrl: 'https://api-uikit-qa.contus.us/api/v1',
      licenseKey: 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp',
      callbackListeners: callBacks,
      isSandbox: false,
    });
    if (remoteMessage.data.type === 'recall') {
      updateNotification(remoteMessage.data.message_id);
      return;
    }
    const notify = await global.SDK.getNotificationData(remoteMessage);
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

AppRegistry.registerComponent(appName, () => App);
