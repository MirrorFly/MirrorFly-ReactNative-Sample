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
export const pushNotify = async (msgId, title, body, sent_from, onForGround) => {
   const date = Date.now();
   const dateStr = date.toString();
   const id = dateStr.substring(dateStr.length - 1, 7);
   if (!isActiveConversationUserOrGroup(sent_from) || AppState.currentState === 'background') {
      notifyObj = {
         ...notifyObj,
         [msgId]: { id, date, title, sent_from, onForGround },
      };
      const currentUserJID = await AsyncStorage.getItem('currentUserJID');
      const _currentUserJID = JSON.parse(currentUserJID);
      Store.dispatch(getCurrentUserJid(_currentUserJID));
      if (
         Platform.OS === 'android' ||
         (Platform.OS === 'ios' && AppState.currentState === 'active' && sent_from !== _currentUserJID)
      ) {
         displayRemoteNotification(id, date, title, body, sent_from, AndroidImportance.HIGH);
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
      displayRemoteNotification(id, date, title, THIS_MESSAGE_WAS_DELETED, sent_from, AndroidImportance.DEFAULT);
   }
};

export const removeAllDeliveredNotification = () => {
  try {
    notifee.cancelAllNotifications(Object.values(ids));
  } catch (error) {
    console.log('removeAllDeliveredNotificatoin', error);
  }
};
