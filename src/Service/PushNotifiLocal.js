import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { CHATCONVERSATION, CHATSCREEN } from '../constant';
import store from '../redux/store';
import { navigate } from '../redux/Actions/NavigationAction';
import * as RootNav from '../../src/Navigation/rootNavigation';
import { updateChatConversationLocalNav } from '../redux/Actions/ChatConversationLocalNavAction';
import { AppState, Platform } from 'react-native';
import SDK from '../SDK/SDK';

class PushNotifiLocal {
  constructor(fromUserJid, onForeGround) {
    PushNotification.configure({
      onNotification: async function (notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
        if (onForeGround) {
          let x = { screen: CHATSCREEN, fromUserJID: fromUserJid };
          await store.dispatch(navigate(x));
          RootNav.navigate(CHATSCREEN);
          await store.dispatch(
            updateChatConversationLocalNav(CHATCONVERSATION),
          );
        }
        await AsyncStorage.setItem('fromUserJId', fromUserJid);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
    PushNotification.createChannel(
      {
        channelId: 'reminders',
        channelName: 'Task reminder Notification',
        channelDescription: 'Reminder Task',
      },
      () => {},
    );
    PushNotification.getScheduledLocalNotifications(rn => {});
  }
  scheduleNotify(id, date, title, body, playSound) {
    PushNotification.localNotification({
      smallIcon: 'ic_notification',
      largeIcon: '',
      channelId: 'reminders',
      title: title || 'Task reminder Notification',
      message: body || 'Reminder Task',
      date,
      when: date,
      id: id,
      playSound: playSound,
    });
  }
}

export default PushNotifiLocal;
