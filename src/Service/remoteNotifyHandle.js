import SDK from '../SDK/SDK';
import PushNotifiLocal from './PushNotifiLocal';
import store from '../redux/store';

export const remoteNotifyHandle = async (remoteMessage, onForGround) => {
  const fromUserJid = store.getState().navigation.fromUserJid;
  if (remoteMessage?.data?.sent_from == fromUserJid) {
    return;
  }
  const pushNotifiLocal = new PushNotifiLocal(
    remoteMessage?.data?.sent_from,
    onForGround,
  );
  if (remoteMessage) {
    const foundMsg = await SDK.showChatNotification(remoteMessage);
    if (foundMsg?.statusCode == 200) {
      const date = foundMsg.message.date;
      const title = foundMsg.message.title;
      const body = foundMsg.message.body;
      pushNotifiLocal.scheduleNotify(date, title, body);
    }
  }
};
