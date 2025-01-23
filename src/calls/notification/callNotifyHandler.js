import notifee, {
   AndroidCategory,
   AndroidFlags,
   AndroidForegroundServiceType,
   AndroidImportance,
   AndroidLaunchActivityFlag,
   AndroidVisibility,
   EventType,
} from '@notifee/react-native';
import { AppState, Linking, Platform } from 'react-native';
import _BackgroundTimer from 'react-native-background-timer';
import RootNavigation from '../../../src/Navigation/rootNavigation';
import { endCall, getCallDuration } from '../../Helper/Calls/Call';
import {
   CALL_STATUS_CONNECTED,
   CALL_TYPE_AUDIO,
   INCOMING_CALL,
   MISSED_CALL,
   ONGOING_CALL,
   OUTGOING_CALL,
} from '../../Helper/Calls/Constant';
import { answerIncomingCall, declineIncomingCall, endOnGoingCall } from '../../Helper/Calls/Utility';
import SDK from '../../SDK/SDK';
import { getChannelIds } from '../../Service/PushNotify';
import { removeAllDeliveredNotification } from '../../Service/remoteNotifyHandle';
import { getForegroundPermission } from '../../common/permissions';
import ActivityModule from '../../customModules/ActivityModule';
import { getUserIdFromJid } from '../../helpers/chatHelpers';
import { callDurationTimestamp } from '../../redux/callStateSlice';
import { resetNotificationData, setNotificationData } from '../../redux/notificationDataSlice';
import { setRoasterData } from '../../redux/rosterDataSlice';
import store from '../../redux/store';
import { CONVERSATION_SCREEN, CONVERSATION_STACK } from '../../screens/constants';
import { getAppSchema } from '../../uikitMethods';

let interval;
export const callNotifyHandler = async (
   roomId,
   data,
   userJid,
   nickName,
   callStatusType,
   isFullScreenIntent = false,
) => {
   const { muteNotification = false } = store.getState().settingsData;
   if (callStatusType === INCOMING_CALL) {
      getIncomingCallNotification(roomId, data, userJid, nickName, callStatusType, isFullScreenIntent);
   } else if (callStatusType === OUTGOING_CALL) {
      getOutGoingCallNotification(roomId, data, userJid, nickName, callStatusType);
   } else if (callStatusType === ONGOING_CALL) {
      getOnGoingCallNotification(roomId, data, userJid, nickName, callStatusType);
   } else if (callStatusType === MISSED_CALL && !muteNotification) {
      getMissedCallNotification(roomId, data, userJid, nickName, callStatusType);
   }
};

export const getIncomingCallNotification = async (
   roomId,
   callDetailObj,
   userJid,
   nickName,
   callStatusType,
   isFullScreenIntent,
) => {
   const launchCallActivity = await ActivityModule.getCallActivity();
   let callType = callDetailObj?.callType;
   let launchActivityState = AppState.currentState === 'active' ? launchCallActivity : 'default';
   let importanceState = AppState.currentState === 'active' ? AndroidImportance.DEFAULT : AndroidImportance.HIGH;
   const channelIds = AppState.currentState === 'active' ? 'IncomingCallLow' : 'IncomingCallHigh';
   let channelId = await notifee.createChannel({
      id: channelIds,
      name: 'Incoming Call',
      importance: importanceState,
      visibility: AndroidVisibility.PUBLIC,
      vibration: false,
   });
   let title = `Incoming ${callDetailObj.callType} call`;
   const notification = {
      title: title,
      body: nickName,
      data: { roomId: roomId } || null,
      android: {
         color: '#36A8F4',
         channelId: channelId,
         category: AndroidCategory.CALL,
         ongoing: true,
         flags: [AndroidFlags.FLAG_NO_CLEAR],
         importance: AndroidImportance.HIGH,
         sound: '',
         autoCancel: false,
         smallIcon: callType === CALL_TYPE_AUDIO ? 'ic_call_notification' : 'ic_video_call',
         asForegroundService: true,
         foregroundServiceTypes: [
            Platform.Version >= 34 && AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE,
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
         ],
         actions: [
            { title: 'Decline', pressAction: { id: 'decline' } },
            {
               title: 'Accept',
               pressAction: {
                  id: 'accept',
                  launchActivity: launchActivityState,
               },
            },
         ],
         timestamp: Date.now(),
         showTimestamp: true,
         pressAction: {
            id: 'incomingcallnotification',
            launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK],
            launchActivity: launchCallActivity,
         },
      },
   };

   if (isFullScreenIntent) {
      notification.android.fullScreenAction = {
         id: 'default',
         launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK],
         launchActivity: launchCallActivity,
      };
   }
   /** Display a notification */
   await notifee.displayNotification(notification);
};

export const getOutGoingCallNotification = async (roomId, callDetailObj, userJid, nickName, callStatusType) => {
   let title = `Outgoing ${callDetailObj.callType} call`;
   let callType = callDetailObj?.callType;
   const launchCallActivity = await ActivityModule.getCallActivity();
   const foregroundServiceTypes = await getForegroundPermission(callType);
   let channelId = await notifee.createChannel({
      id: 'Outgoing Call',
      name: 'Outgoing Call',
      importance: AndroidImportance.DEFAULT,
      visibility: AndroidVisibility.PUBLIC,
      vibration: false,
   });
   const notification = {
      title: title,
      body: nickName,
      data: { roomId: roomId } || null,
      android: {
         color: '#36A8F4',
         channelId: channelId,
         importance: AndroidImportance.DEFAULT,
         ongoing: true,
         sound: '',
         autoCancel: false,
         category: AndroidCategory.CALL,
         smallIcon: callType === CALL_TYPE_AUDIO ? 'ic_call_notification' : 'ic_video_call',
         asForegroundService: true,
         foregroundServiceTypes,
         actions: [{ title: 'Hang up', pressAction: { id: 'hangup' } }],
         timestamp: Date.now(),
         showTimestamp: true,
         pressAction: {
            id: 'outgoingcallnotification',
            launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK],
            launchActivity: launchCallActivity,
         },
      },
   };
   /** Display a notification */
   await notifee.displayNotification(notification);
};

export const getOnGoingCallNotification = async (roomId, callDetailObj, userJid, nickName, callStatusType) => {
   let title = `Ongoing ${callDetailObj.callType} call`;
   let callType = callDetailObj?.callType;
   const launchCallActivity = await ActivityModule.getCallActivity();
   const foregroundServiceTypes = await getForegroundPermission(callType);
   let channelId = await notifee.createChannel({
      id: 'OnGoing Call',
      name: 'OnGoing Call',
      importance: AndroidImportance.DEFAULT,
      visibility: AndroidVisibility.PUBLIC,
      vibration: false,
   });
   const notification = {
      title: title,
      body: `Call duration: ${'00:00'}`,
      data: { roomId: roomId } || null,
      android: {
         color: '#36A8F4',
         channelId: channelId,
         autoCancel: false,
         ongoing: true,
         importance: AndroidImportance.DEFAULT,
         sound: '',
         smallIcon: callType === CALL_TYPE_AUDIO ? 'ic_call_notification' : 'ic_video_call',
         asForegroundService: true,
         foregroundServiceTypes,
         actions: [{ title: 'Hang up', pressAction: { id: 'endCall' } }],
         timestamp: Date.now(),
         showTimestamp: true,
         pressAction: {
            id: 'ongoingcallnotification',
            launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK],
            launchActivity: launchCallActivity,
         },
      },
   };
   /** Display a notification */
   await notifee.displayNotification(notification);
};

export const getMissedCallNotification = async (
   roomId = '',
   callDetailObj = {},
   userJid = '',
   nickName = '',
   callStatusType = '',
) => {
   const launchActivityName = Platform.OS === 'android' ? await ActivityModule.getMainActivity() : '';
   let title = `You missed ${callDetailObj.callType === 'audio' ? 'an' : 'a'} ${callDetailObj.callType} call`;
   let displayedNotificationId = await notifee.getDisplayedNotifications();
   const channelIds = getChannelIds(true);
   let notificationExist = displayedNotificationId.find(
      res =>
         res?.notification?.title === title &&
         res?.notification?.body === nickName &&
         res?.notification?.android?.channelId === channelIds.channelId,
   );
   let channelId =
      notificationExist && Platform.OS === 'android' ? notificationExist?.notification?.android?.channelId : '';
   if (!notificationExist) {
      let channelData = {
         id: channelIds.channelId,
         name: channelIds.channelId,
         importance: AndroidImportance.HIGH,
         visibility: AndroidVisibility.PUBLIC,
      };
      if (channelIds.sound) channelData.sound = channelIds.sound;
      channelData.vibration = channelIds.vibration;
      channelId = await notifee.createChannel(channelData);
   }
   const notification = {
      title: title,
      body: nickName,
      data: { roomId: roomId } || null,
      android: {
         color: '#36A8F4',
         channelId: channelId,
         importance: AndroidImportance.HIGH,
         smallIcon: 'ic_notification',
         timestamp: Date.now(),
         showTimestamp: true,
         visibility: AndroidVisibility.PUBLIC,
         pressAction: {
            id: 'MissedCallNotification',
            launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK],
            launchActivity: launchActivityName,
         },
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
   if (notificationExist) notification.id = notificationExist?.notification?.id;
   /** Display a notification */
   await notifee.displayNotification(notification);
   if (Platform.OS === 'ios') {
      registerNotificationEvents();
   }
};

export const onChatNotificationForeGround = async ({ type, detail }) => {
   if (detail.notification?.data?.roomId) {
      callNotifiHandling(detail);
   } else if (type === EventType.PRESS) {
      const {
         notification: { data: { fromUserJID = '', from_user = '' } = '' },
      } = detail;
      RootNavigation.navigate(CONVERSATION_STACK, {
         screen: CONVERSATION_SCREEN,
         params: { jid: fromUserJID || from_user },
      });
   }
};

export const onChatNotificationBackGround = async ({ type, detail }) => {
   if (detail.notification?.data?.roomId) {
      callNotifiHandling(detail);
   } else if (type === EventType.PRESS) {
      const {
         notification: { data: { fromUserJID = '', from_user = '' } = '' },
      } = detail;
      const push_url = fromUserJID
         ? getAppSchema() + `${CONVERSATION_STACK}/${CONVERSATION_SCREEN}?jid=${fromUserJID || from_user}`
         : getAppSchema();
      const { statusCode, data = {} } = await SDK.getUserProfile(getUserIdFromJid(fromUserJID || from_user));
      if (statusCode === 200) {
         const { userId = '' } = data;
         store.dispatch(setRoasterData({ userId, ...data }));
      }
      Linking.openURL(push_url);
      removeAllDeliveredNotification();
   }
};

const callNotifiHandling = detail => {
   const { callerUUID: activeCallUUID = '' } = store.getState().callData || {};
   if (detail.pressAction?.id === 'accept') {
      answerIncomingCall(activeCallUUID);
   } else if (detail.pressAction?.id === 'decline') {
      declineIncomingCall();
   } else if (detail.pressAction?.id === 'hangup') {
      endCall();
   } else if (detail.pressAction?.id === 'endCall') {
      endOnGoingCall();
   }
};

export const setNotificationForegroundService = async () => {
   // Register foreground service, NOOP
   notifee.registerForegroundService(notification => {
      return new Promise(() => {
         if (notification?.android?.channelId === 'media_progress_channel') {
            return;
         }
         const { data: confrenceData = {} } = store.getState().showConfrenceData || {};
         const { callStatusText } = confrenceData;
         store.dispatch(setNotificationData(notification));
         if (notification?.android?.channelId === 'OnGoing Call' && callStatusText === CALL_STATUS_CONNECTED) {
            let callStartTime = store.getState()?.callData?.callDuration;
            if (!callStartTime) {
               callStartTime = Date.now();
               store.dispatch(callDurationTimestamp(callStartTime));
            }
            interval = _BackgroundTimer.setInterval(() => {
               onTaskUpdate({
                  update: {
                     current: Date.now() - callStartTime,
                  },
               });
            }, 300);
            function onTaskUpdate(task) {
               if (task.update) {
                  notifee.displayNotification({
                     title: notification.title,
                     id: notification.id,
                     body: `Call Duration: ${getCallDuration(task.update.current)}`,
                     data: notification.data,
                     android: {
                        ...notification.android,
                        channelId: notification.android.channelId,
                        vibration: false,
                        sound: '',
                        importance: AndroidImportance.LOW,
                        color: '#36A8F4',
                        smallIcon: notification.android.smallIcon,
                        timestamp: Date.now(),
                        showTimestamp: true,
                     },
                  });
               }
            }
         }
      });
   });
   registerNotificationEvents();
};

export const registerNotificationEvents = () => {
   //  Register notification listeners
   notifee.onBackgroundEvent(onChatNotificationBackGround);
   notifee.onForegroundEvent(onChatNotificationForeGround);
};

export const stopForegroundServiceNotification = async (cancelID = '') => {
   return new Promise(async resolve => {
      try {
         _BackgroundTimer.clearInterval(interval);
         const notifications = store.getState().notificationData.data;
         await notifee.stopForegroundService();
         const displayedNotificationId = await notifee.getDisplayedNotifications();
         const cancelIDS = displayedNotificationId?.find(res => res.id === notifications.id)?.id;
         cancelIDS && (await notifee.cancelDisplayedNotification(cancelIDS));
         const channelId = notifications.android?.channelId;
         const channel =
            channelId &&
            (await notifee.getChannels()).find(res => res.id === channelId && res?.id?.includes('IncomingCall'))?.id;
         channel && (await notifee.deleteChannel(channel));
         store.dispatch(resetNotificationData());
         resolve();
      } catch (error) {
         console.log('Error when stopping foreground service: ', error);
      }
   });
};
