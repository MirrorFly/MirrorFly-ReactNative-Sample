import notifee, { AndroidVisibility } from '@notifee/react-native';
import { onChatNotificationBackGround, onChatNotificationForeGround } from '../calls/notification/callNotifyHandler';

export const displayRemoteNotification = async (id, date, title, body, jid, importance) => {
   const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance,
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
         importance,
      },
      ios: {
         sound: 'default',
         foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
         },
      },
   });
   notifee.onForegroundEvent(onChatNotificationForeGround);
   notifee.onBackgroundEvent(onChatNotificationBackGround);
};
