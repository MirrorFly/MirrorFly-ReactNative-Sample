import PushNotification from 'react-native-push-notification';
import { CHATCONVERSATION, CHATSCREEN, CONVERSATION_SCREEN } from '../constant';
import store from '../redux/store';
import { navigate } from '../redux/Actions/NavigationAction';
import * as RootNav from '../../src/Navigation/rootNavigation';
import { updateChatConversationLocalNav } from '../redux/Actions/ChatConversationLocalNavAction';
import { AppState, Linking, Platform } from 'react-native';
class PushNotifiLocal {
  constructor(fromUserJid, onForeGround) {
    PushNotification.configure({
      onNotification: async function () {
        if (onForeGround || AppState.currentState === 'background') {
          let x = { screen: CHATSCREEN, fromUserJID: fromUserJid };
          await store.dispatch(navigate(x));
          if (RootNav.getCurrentScreen() === CHATSCREEN) {
            store.dispatch(updateChatConversationLocalNav(CHATCONVERSATION));
            return RootNav.navigate(CONVERSATION_SCREEN);
          }
          RootNav.navigate(CHATSCREEN);
          store.dispatch(updateChatConversationLocalNav(CHATCONVERSATION));
          return;
        }
        const push_url = 'mirrorfly_rn://CHATSCREEN?fromUserJid=' + fromUserJid;
        Linking.openURL(push_url);
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
      priority: 'high',
    });
  }
}

export default PushNotifiLocal;
