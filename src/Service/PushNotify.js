import notifee, { AndroidColor, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { Platform } from 'react-native';
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

const activeDownloads = {
   files: 0, // Number of active downloads
   progress: 0, // Combined progress percentage
   individualProgress: {}, // Progress of each individual file, keyed by msgId
};

export const updateProgressNotification = async (msgId, progress, type, isCanceled = false) => {
   if (Platform.OS == 'ios') return;
   if (isCanceled) {
      // Remove canceled download from tracker
      delete activeDownloads.individualProgress[msgId];
      activeDownloads.files -= 1;
   } else {
      // Add or update download progress
      if (!activeDownloads.individualProgress[msgId]) {
         activeDownloads.files += 1;
      }
      activeDownloads.individualProgress[msgId] = progress;
   }

   // Recalculate combined progress
   const totalProgress = Object.values(activeDownloads.individualProgress).reduce((sum, p) => sum + p, 0);
   activeDownloads.progress = activeDownloads.files > 0 ? Math.floor(totalProgress / activeDownloads.files) : 0;

   // Update notification title
   const title = activeDownloads.files > 1 ? `Downloading ${activeDownloads.files} files` : 'Downloading 1 file';

   // If all downloads are canceled, clear notification
   if (activeDownloads.files === 0) {
      await notifee.cancelNotification('media_progress_notification');
      return;
   }

   // Update the notification
   await notifee.displayNotification({
      id: 'media_progress_notification', // Single notification ID for all downloads
      title,
      body: `Progress: ${activeDownloads.progress}%`,
      android: {
         onlyAlertOnce: true,
         channelId: 'media_progress_channel',
         color: AndroidColor.BLUE,
         importance: AndroidImportance.HIGH,
         smallIcon: 'ic_notification',
         ongoing: true,
         progress: {
            max: 100,
            current: activeDownloads.progress,
            indeterminate: false,
         },
      },
      ios: {
         categoryId: 'media_progress_category',
         sound: 'default',
         attachments: [],
         customSummary: 'Media progress notification',
         threadId: 'media_progress',
         foregroundPresentationOptions: {
            banner: false,
            list: false,
            badge: false,
            sound: false,
         },
      },
   });
};

export const createNotificationChannels = async settings => {
   try {
      if (settings.authorizationStatus === 1) {
         // Create notification channel for media progress
         await notifee.createChannel({
            id: 'media_progress_channel',
            name: 'Media Progress Channel',
            sound: 'default', // No sound for progress updates
         });

         console.log('Media progress notification channel created');
      }
   } catch (error) {
      mflog('Failed to create notification channels', error);
   }
};
