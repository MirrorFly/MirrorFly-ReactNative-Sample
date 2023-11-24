import { THIS_MESSAGE_WAS_DELETED } from '../Helper/Chat/Constant';
import { AppState, Platform } from 'react-native';
import { isActiveConversationUserOrGroup } from '../Helper/Chat/ChatHelper';
import { displayRemoteNotification } from './PushNotify';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserJid } from '../redux/Actions/AuthAction';
import Store from '../redux/store';

let notifyObj = {};
let ids = [];
export const pushNotify = async (roomId, title, body, sent_from) => {
   const date = Date.now();
   const dateStr = date.toString();
   const id = dateStr.substring(dateStr.length - 1, 7);
   //    if (!isActiveConversationUserOrGroup(sent_from) || AppState.currentState === 'background') {
   notifyObj = {
      ...notifyObj,
      [roomId]: { id, date, title, sent_from },
   };
   displayRemoteNotification(id, date, title, body, sent_from, AndroidImportance.HIGH);
   //    ids.push(notifyObj[msgId].id);
   //    if (AppState.currentState === 'active') {
   //       setTimeout(() => {
   //          notifee.cancelDisplayedNotifications(Object.values(ids));
   //          ids = [];
   //          notifyObj = {};
   //       }, 5000);
   //    }
   //    }
};

// export const updateNotification = msgId => {
//    if (notifyObj[msgId]) {
//       const { id, date, title, sent_from } = notifyObj[msgId];
//       displayRemoteNotification(id, date, title, THIS_MESSAGE_WAS_DELETED, sent_from, AndroidImportance.DEFAULT);
//    }
// };

// export const removeAllDeliveredNotification = () => {
//    try {
//       notifee.cancelAllNotifications();
//    } catch (error) {
//       console.log('removeAllDeliveredNotificatoin', error);
//    }
// };
