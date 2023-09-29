import PushNotifiLocal from './PushNotifiLocal';
import PushNotification from 'react-native-push-notification';
import { THIS_MESSAGE_WAS_DELETED } from '../Helper/Chat/Constant';
import { AppState } from 'react-native';
import { isActiveConversationUserOrGroup } from '../Helper/Chat/ChatHelper';

let notifyObj = {};
let ids = [];
export const pushNotify = async (
  msgId,
  title,
  body,
  sent_from,
  onForGround,
) => {
  const date = Date.now();
  const dateStr = date.toString();
  const id = dateStr.substring(dateStr.length - 1, 7);
  if (
    !isActiveConversationUserOrGroup(sent_from) ||
    AppState.currentState === 'background'
  ) {
    const pushNotifiLocal = new PushNotifiLocal(sent_from, onForGround);
    notifyObj = {
      ...notifyObj,
      [msgId]: { id, date, title, sent_from, onForGround },
    };
    pushNotifiLocal.scheduleNotify(id, date, title, body, true);
    ids.push(notifyObj[msgId].id);
    if (AppState.currentState === 'active') {
      setTimeout(() => {
        PushNotification.removeDeliveredNotifications(Object.values(ids));
        ids = [];
        notifyObj = {};
      }, 5000);
    }
  }
};

export const updateNotification = msgId => {
  if (notifyObj[msgId]) {
    const { id, date, title, sent_from, onForGround } = notifyObj[msgId];
    const pushNotifiLocal = new PushNotifiLocal(sent_from, onForGround);
    pushNotifiLocal.scheduleNotify(
      id,
      date,
      title,
      THIS_MESSAGE_WAS_DELETED,
      false,
    );
  }
};

export const removeAllDeliveredNotificatoin = () => {
  try {
    PushNotification.removeAllDeliveredNotifications();
  } catch (error) {
    console.log('removeAllDeliveredNotificatoin', error);
  }
};
