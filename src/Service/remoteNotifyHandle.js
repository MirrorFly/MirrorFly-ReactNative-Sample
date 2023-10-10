import { THIS_MESSAGE_WAS_DELETED } from '../Helper/Chat/Constant';
import { AppState, Platform } from 'react-native';
import { isActiveConversationUserOrGroup } from '../Helper/Chat/ChatHelper';
import { displayRemoteNotification } from './PushNotify';
import notifee from '@notifee/react-native';

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
    notifyObj = {
      ...notifyObj,
      [msgId]: { id, date, title, sent_from, onForGround },
    };
    if (
      Platform.OS === 'android' ||
      (Platform.OS === 'ios' && AppState.currentState === 'active')
    ) {
      displayRemoteNotification(id, date, title, body, sent_from);
    }
    ids.push(notifyObj[msgId].id);
    if (AppState.currentState === 'active') {
      setTimeout(() => {
        notifee.cancelDisplayedNotifications(Object.values(ids));
        ids = [];
        notifyObj = {};
      }, 5000);
    }
  }
};

export const updateNotification = msgId => {
  if (notifyObj[msgId]) {
    const { id, date, title, sent_from } = notifyObj[msgId];
    displayRemoteNotification(
      id,
      date,
      title,
      THIS_MESSAGE_WAS_DELETED,
      sent_from,
    );
  }
};

export const removeAllDeliveredNotificatoin = () => {
  try {
    notifee.cancelAllNotifications();
  } catch (error) {
    console.log('removeAllDeliveredNotificatoin', error);
  }
};
