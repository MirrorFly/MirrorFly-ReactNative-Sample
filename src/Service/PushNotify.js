import notifee, { AndroidVisibility } from '@notifee/react-native';
import { onNotificationAction } from '../calls/notification/callNotifyHandler';

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
         foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
         },
      },
   });
   notifee.onForegroundEvent(onNotificationAction);
   notifee.onBackgroundEvent(onNotificationAction);
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
      },
   });
};
