import notifee, { AndroidImportance } from '@notifee/react-native';
import { AppState } from 'react-native';
import _BackgroundTimer from 'react-native-background-timer';
import { isActiveChat } from '../helpers/chatHelpers';
import { THIS_MESSAGE_WAS_DELETED } from '../helpers/constants';
import { displayRemoteNotification } from './PushNotify';

let notifyObj = {};
let ids = [];
let notificationTimer = null;

export const clearNotifyTimer = () => {
   _BackgroundTimer.clearTimeout(notificationTimer);
   notificationTimer = null;
};

export const pushNotify = (msgId, title, body, sent_from, onForGround) => {
   const date = Date.now();
   const dateStr = date.toString();
   const id = notifyObj[msgId]?.id || dateStr.substring(dateStr.length - 1, 7);
   if (isActiveChat(sent_from) || AppState.currentState === 'background') {
      notifyObj = {
         ...notifyObj,
         [msgId]: { id, date, title, sent_from, onForGround },
      };

      displayRemoteNotification(id, date, title, body, sent_from, AndroidImportance.HIGH);
      ids.push(notifyObj[msgId].id);
      if (AppState.currentState === 'active') {
         clearNotifyTimer();
         notificationTimer = _BackgroundTimer.setTimeout(() => {
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
      displayRemoteNotification(id, date, title, THIS_MESSAGE_WAS_DELETED, sent_from, AndroidImportance.DEFAULT);
   }
};

export const removeAllDeliveredNotification = () => {
   try {
      if (Object.values(ids)) {
         notifee.cancelAllNotifications();
      }
   } catch (error) {
      console.log('removeAllDeliveredNotificatoin', error);
   }
};
