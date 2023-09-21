import SDK from '../SDK/SDK';
import PushNotifiLocal from './PushNotifiLocal';
import store from '../redux/store';
import { CHATCONVERSATION } from '../constant';

export const remoteNotifyHandle = async (remoteMessage, onForGround) => {
  const fromUserJid = store.getState().navigation.fromUserJid;
  if (remoteMessage?.data?.sent_from === fromUserJid) {
    return;
  }
  const pushNotifiLocal = new PushNotifiLocal(
    remoteMessage?.data?.sent_from,
    onForGround,
  );
  if (remoteMessage) {
    const foundMsg = await SDK.showChatNotification(remoteMessage);
    if (foundMsg?.statusCode === 200) {
      const date = foundMsg.message.date;
      const title = foundMsg.message.title;
      const body = foundMsg.message.body;
      pushNotifiLocal.scheduleNotify(date, title, body);
    }
  }
};

export const pushNotify = (title, body, sent_from, onForGround) => {
  const date = Date.now();
  const activeScreen = store.getState().navigation.notificationCheck;
  console.log(activeScreen, 'activeScreen');
  if (activeScreen !== sent_from) {
    const pushNotifiLocal = new PushNotifiLocal(sent_from, onForGround);
    pushNotifiLocal.scheduleNotify(date, title, body);
  }
};
