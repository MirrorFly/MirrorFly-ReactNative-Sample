import notifee, { AndroidColor, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { MISSED_CALL } from '../Helper/Calls/Constant';
import { getMuteStatus } from '../SDK/utils';
import { onChatNotificationBackGround, onChatNotificationForeGround } from '../calls/notification/callNotifyHandler';
import store from '../redux/store';
import { mflog } from '../uikitMethods';

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

// Function to show or update the foreground service notification
export const updateProgressNotification = async (msgId, progress, type) => {
   await notifee.displayNotification({
      id: msgId, // Unique ID for the notification
      title: type === 'download' ? 'Downloading Media' : 'Uploading Media',
      body: `Progress: ${progress}%`,
      android: {
         onlyAlertOnce: true,
         channelId: 'media_progress_channel',
         color: AndroidColor.BLUE,
         importance: AndroidImportance.HIGH,
         smallIcon: 'ic_notification', // Ensure this matches your app's icon resource
         ongoing: true,
         progress: {
            max: 100,
            current: progress,
            indeterminate: false,
         },
      },
   });
};

// Function to cancel the notification when task completes
export const cancelProgressNotification = async msgId => {
   await notifee.cancelNotification(msgId);
};

export const createNotificationChannels = async settings => {
   try {
      if (settings.authorizationStatus === 1) {
         // Create notification channel for media progress
         await notifee.createChannel({
            id: 'media_progress_channel',
            name: 'Media Progress Channel',
            importance: AndroidImportance.HIGH,
            sound: 'default', // No sound for progress updates
         });

         console.log('Media progress notification channel created');
      }
   } catch (error) {
      mflog('Failed to create notification channels', error);
   }
};
