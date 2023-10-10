import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import { Linking } from 'react-native';
import Store from '../redux/store';
import * as RootNav from '../../src/Navigation/rootNavigation';
import { CHATCONVERSATION, CHATSCREEN, CONVERSATION_SCREEN } from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import { updateChatConversationLocalNav } from '../redux/Actions/ChatConversationLocalNavAction';

export const displayRemoteNotification = async (id, date, title, body, jid) => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'default',
  });

  /** Display a notification */
  await notifee.displayNotification({
    id: id,
    title: title,
    body: body,
    data: { fromUserJID: jid } || null,
    android: {
      channelId,
      sound: 'default',
      timestamp: date,
      smallIcon: 'ic_notification',
      importance: AndroidImportance.HIGH,
    },
  });
  notifee.onForegroundEvent(async ({ type, detail }) => {
    switch (type) {
      case EventType.PRESS:
        const {
          notification: { data: { fromUserJID } = '' },
        } = detail;
        let x = { screen: CHATSCREEN, fromUserJID };
        Store.dispatch(navigate(x));
        if (RootNav.getCurrentScreen() === CHATSCREEN) {
          Store.dispatch(updateChatConversationLocalNav(CHATCONVERSATION));
          return RootNav.navigate(CONVERSATION_SCREEN);
        }
        RootNav.navigate(CHATSCREEN);
        Store.dispatch(updateChatConversationLocalNav(CHATCONVERSATION));
        break;
      default:
        break;
    }
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const {
      notification: { data: { fromUserJID } = '' },
    } = detail;
    let x = { screen: CHATSCREEN, fromUserJID };
    const push_url = 'mirrorfly_rn://CHATSCREEN?fromUserJID=' + fromUserJID;
    Store.dispatch(navigate(x));
    Linking.openURL(push_url);
  });
};

export const handleNotifeeNotify = async () => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default name',
  });
  const groupId = await notifee.createChannelGroup({
    id: 'incoming',
    name: 'Default name',
  });
  notifee.displayNotification({
    title: 'Sarah Lane',
    body: 'Great thanks, food later?',
    android: {
      channelId,
      groupId,
      smallIcon: 'ic_notification_blue',
      /**
      //   style: {
      //     type: AndroidStyle.MESSAGING,
      //     person: {
      //       name: 'John Doe',
      //       icon: 'https://my-cdn.com/avatars/123.png',
      //     },
      //     messages: [
      //       {
      //         text: 'Hey, how are you?',
      //         timestamp: Date.now() - 600000, // 10 minutes ago
      //       },
      //       {
      //         text: 'Great thanks, food later?',
      //         timestamp: Date.now(), // Now
      //         person: {
      //           name: 'Sarah Lane',
      //           // icon: 'S',
      //         },
      //       },
      //     ],
      //   },
       */
    },
  });
  /**
  // notifee.displayNotification({
  //   // title: '<p style="color: #4caf50;"><b>Styled HTMLTitle</span></p></b></p> &#128576;',
  //   // subtitle: '&#129395;',
  //   // body:
  //   //   '<img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" style="width: 20px; height: 20px;" />',
  //   title: 'Title Push notification',
  //   body: 'Title Body sample Notification',
  //   android: {
  //     channelId,
  //     color: '#4caf50',
  //     schedule: {
  //       fireDate: scheduleTime,
  //     },
  //     smallIcon: 'ic_launcher',
  //     largeIcon: require('../assets/BG.png'),
  //   },
  // });
  */
};
