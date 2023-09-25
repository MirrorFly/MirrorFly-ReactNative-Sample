import PushNotifiLocal from './PushNotifiLocal';
import store from '../redux/store';
import PushNotification from 'react-native-push-notification';
import { THIS_MESSAGE_WAS_DELETED } from '../Helper/Chat/Constant';

/**
// export const remoteNotifyHandle = async (remoteMessage, onForGround) => {
//   const fromUserJid = store.getState().navigation.fromUserJid;
//   if (remoteMessage?.data?.sent_from === fromUserJid) {
//     return;
//   }
//   const pushNotifiLocal = new PushNotifiLocal(
//     remoteMessage?.data?.sent_from,
//     onForGround,
//   );
//   if (remoteMessage) {
//     const foundMsg = await SDK.showChatNotification(remoteMessage);
//     if (foundMsg?.statusCode === 200) {
//       const date = foundMsg.message.date;
//       const title = foundMsg.message.title;
//       const body = foundMsg.message.body;
//       pushNotifiLocal.scheduleNotify(date, title, body);
//     }
//   }
// };
 */
let notifyObj = {};
let ids = [];
export const pushNotify = (msgId, title, body, sent_from, onForGround) => {
  const date = Date.now().toString();
  const id = date.substring(date.length - 1, 7);
  const activeScreen = store.getState().navigation.notificationCheck;
  if (activeScreen !== sent_from) {
    const pushNotifiLocal = new PushNotifiLocal(sent_from, onForGround);
    notifyObj = {
      ...notifyObj,
      [msgId]: { id, date, title, sent_from, onForGround },
    };
    pushNotifiLocal.scheduleNotify(id, date, title, body, true);
    ids.push(notifyObj[msgId].id);
    setTimeout(() => {
      PushNotification.removeDeliveredNotifications(Object.values(ids));
      ids = [];
      notifyObj = {};
    }, 5000);
  }
};

export const updateNotification = msgId => {
  const { id, date, title, sent_from, onForGround } = notifyObj[msgId];
  const pushNotifiLocal = new PushNotifiLocal(sent_from, onForGround);
  pushNotifiLocal.scheduleNotify(
    id,
    date,
    title,
    THIS_MESSAGE_WAS_DELETED,
    false,
  );
};
