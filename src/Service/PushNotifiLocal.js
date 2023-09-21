import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { CHATCONVERSATION, CHATSCREEN } from '../constant';
import store from '../redux/store';
import { navigate } from '../redux/Actions/NavigationAction';
import * as RootNav from '../../src/Navigation/rootNavigation';
import { updateChatConversationLocalNav } from '../redux/Actions/ChatConversationLocalNavAction';

class PushNotifiLocal {
  constructor(fromUserJid, onForGround) {
    PushNotification.configure({
      onNotification: async function (notification) {
        if (onForGround) {
          let x = { screen: CHATSCREEN, fromUserJID: fromUserJid };
          await store.dispatch(navigate(x));
          RootNav.navigate(CHATSCREEN);
          store.dispatch(updateChatConversationLocalNav(CHATCONVERSATION));
        }
        await AsyncStorage.setItem('fromUserJId', fromUserJid);
      },
      popInitialNotification: true,
      requestPermissions: false,
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
  scheduleNotify(date, title, body) {
    PushNotification.localNotification({
      smallIcon: 'ic_notification',
      channelId: 'reminders',
      title: title ? title : 'Task reminder Notification',
      message: body ? body : 'Reminder Task',
      date,
    });
  }
}

export default PushNotifiLocal;
