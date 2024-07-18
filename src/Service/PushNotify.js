import notifee, { AndroidVisibility } from '@notifee/react-native';
import { MISSED_CALL } from '../Helper/Calls/Constant';
import { getMuteStatus } from '../SDK/utils';
import { onChatNotificationBackGround, onChatNotificationForeGround } from '../calls/notification/callNotifyHandler';
import store from '../redux/store';

export const displayRemoteNotification = async (id, date, title, body, jid, importance) => {
   let isMute = await getMuteStatus(jid);
   const { muteNotification = false } = store.getState().settingsData;
   if (isMute === 0 && !muteNotification) {
      const channelIds = getChannelIds();
      let channelId = {
         id: channelIds.channelId,
         name: channelIds.channelId,
         importance,
         visibility: AndroidVisibility.PUBLIC,
      };
      if (channelIds.sound) channelId.sound = channelIds.sound;
      channelId.vibration = channelIds.vibration;
      let channelIdData = await notifee.createChannel(channelId);
      /** Display a notification */
      let notification = {
         id: id,
         title: title,
         body: body,
         data: { fromUserJID: jid } || null,
         android: {
            channelId: channelIdData,
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
      };
      if (Platform.OS === 'ios' && channelIds.sound) notification.ios.sound = 'default';
      await notifee.displayNotification(notification);
   }
   notifee.onForegroundEvent(onChatNotificationForeGround);
   notifee.onBackgroundEvent(onChatNotificationBackGround);
};

export const getChannelIds = (missedCall = false) => {
   const channelIds = {};
   const { notificationSound = false, notificationVibrate = false } = store.getState().settingsData;
   if (notificationSound && notificationVibrate) {
      channelIds.channelId = missedCall ? MISSED_CALL : 'Incoming Message';
      channelIds.vibration = notificationVibrate;
      channelIds.sound = 'default';
   } else if (notificationVibrate) {
      channelIds.channelId = 'Vibrate Notification';
      channelIds.vibration = notificationVibrate;
   } else if (notificationSound) {
      channelIds.channelId = 'Sound Notification';
      channelIds.vibration = notificationVibrate;
      channelIds.sound = 'default';
   } else {
      channelIds.channelId = 'Silent Notification';
      channelIds.vibration = false;
   }
   return channelIds;
};
