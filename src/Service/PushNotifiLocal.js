import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { useSelector } from 'react-redux';
import { CHATSCREEN } from '../constant';
import store from "../redux/store";
class PushNotifiLocal {
  constructor(fromUserJid, onForGround) {
    PushNotification.configure({
      onNotification: async function (notification) {
        if (onForGround) {
          const screenNav = useSelector(state => state.navigation.screen);
          let x = { screen: CHATSCREEN, fromUserId: fromUserJid };
          return store.dispatch(screenNav(x));
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
      channelId: 'reminders',
      title: title ? title : 'Task reminder Notification',
      message: body ? body : 'Reminder Task',
      date,
    });
  }
}

export default PushNotifiLocal;
