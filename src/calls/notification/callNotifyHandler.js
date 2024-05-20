import notifee, {
   AndroidCategory,
   AndroidFlags,
   AndroidImportance,
   AndroidLaunchActivityFlag,
   AndroidVisibility,
   EventType,
} from '@notifee/react-native';
import { AppState, Linking, NativeModules, Platform } from 'react-native';
import _BackgroundTimer from 'react-native-background-timer';
import * as RootNav from '../../../src/Navigation/rootNavigation';
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
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import SDK from '../../SDK/SDK';
import { removeAllDeliveredNotification } from '../../Service/remoteNotifyHandle';
import { CHATCONVERSATION, CHATSCREEN, CONVERSATION_SCREEN } from '../../constant';
import { callDurationTimestamp, resetNotificationData, setNotificationData } from '../../redux/Actions/CallAction';
import { updateChatConversationLocalNav } from '../../redux/Actions/ChatConversationLocalNavAction';
import { navigate } from '../../redux/Actions/NavigationAction';
import { updateRosterData } from '../../redux/Actions/rosterAction';
import Store from '../../redux/store';
import { getApplicationUrl } from '../../uikitHelpers/uikitMethods';
const { ActivityModule } = NativeModules;

let interval;
export const callNotifyHandler = async (
   roomId,
   data,
   userJid,
   nickName,
   callStatusType,
   isFullScreenIntent = false,
) => {
   if (callStatusType === INCOMING_CALL) {
      getIncomingCallNotification(roomId, data, userJid, nickName, callStatusType, isFullScreenIntent);
   } else if (callStatusType === OUTGOING_CALL) {
      getOutGoingCallNotification(roomId, data, userJid, nickName, callStatusType);
   } else if (callStatusType === ONGOING_CALL) {
      getOnGoingCallNotification(roomId, data, userJid, nickName, callStatusType);
   } else if (callStatusType === MISSED_CALL) {
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
         onlyAlertOnce: true,
         ongoing: true,
         flags: [AndroidFlags.FLAG_NO_CLEAR],
         importance: AndroidImportance.HIGH,
         sound: '',
         autoCancel: false,
         smallIcon: callType === CALL_TYPE_AUDIO ? 'ic_call_notification' : 'ic_video_call',
         asForegroundService: true,
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
         onlyAlertOnce: true,
         channelId: channelId,
         importance: AndroidImportance.DEFAULT,
         ongoing: true,
         sound: '',
         autoCancel: false,
         category: AndroidCategory.CALL,
         smallIcon: callType === CALL_TYPE_AUDIO ? 'ic_call_notification' : 'ic_video_call',
         asForegroundService: true,
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
         onlyAlertOnce: true,
         channelId: channelId,
         autoCancel: false,
         ongoing: true,
         importance: AndroidImportance.DEFAULT,
         sound: '',
         smallIcon: callType === CALL_TYPE_AUDIO ? 'ic_call_notification' : 'ic_video_call',
         asForegroundService: true,
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
   let notificationExist = displayedNotificationId.find(
      res => res?.notification?.title === title && res?.notification?.body === nickName,
   );
   let channelId =
      notificationExist && Platform.OS === 'android' ? notificationExist?.notification?.android?.channelId : '';
   if (!notificationExist) {
      channelId = await notifee.createChannel({
         id: MISSED_CALL,
         name: 'Missed Call',
         importance: AndroidImportance.HIGH,
         visibility: AndroidVisibility.PUBLIC,
         vibration: true,
         sound: 'default',
      });
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
         sound: 'default',
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
   if (notificationExist) notification.id = notificationExist?.notification?.id;
   /** Display a notification */
   await notifee.displayNotification(notification);
   if (Platform.OS === 'ios') {
      registerNotificationEvents();
   }
};

const onChatNotificationForeGround = async ({ type, detail }) => {
   if (type === EventType.PRESS) {
      const {
         notification: { data: { fromUserJID = '', from_user = '' } = '' },
      } = detail;
      let x = { screen: CHATSCREEN, fromUserJID: fromUserJID || from_user };
      Store.dispatch(navigate(x));
      if (RootNav.getCurrentScreen() === CHATSCREEN) {
         Store.dispatch(updateChatConversationLocalNav(CHATCONVERSATION));
         return RootNav.navigate(CONVERSATION_SCREEN);
      } else {
         RootNav.navigate(CHATSCREEN);
         Store.dispatch(updateChatConversationLocalNav(CHATCONVERSATION));
      }
   }
};

const onChatNotificationBackGround = async ({ type, detail }) => {
   if (type === EventType.PRESS) {
      const {
         notification: { data: { fromUserJID = '', from_user = '' } = '' },
      } = detail;
      let x = { screen: CHATSCREEN, fromUserJID: fromUserJID || from_user };
      const push_url = getApplicationUrl() + 'CHATSCREEN?fromUserJID=' + fromUserJID;
      const { statusCode, data = {} } = await SDK.getUserProfile(getUserIdFromJid(fromUserJID));
      if (statusCode === 200) {
         const { userId = '' } = data;
         Store.dispatch(updateRosterData({ userId, ...data }));
      }
      Store.dispatch(navigate(x));
      Linking.openURL(push_url);
      removeAllDeliveredNotification();
   }
};

export const onNotificationAction = async ({ type, detail }) => {
   const { callerUUID: activeCallUUID = '' } = Store.getState().callData || {};
   if (!detail.notification?.data?.roomId) {
      if (AppState.currentState === 'active') {
         onChatNotificationForeGround({ type, detail });
         return;
      } else {
         onChatNotificationBackGround({ type, detail });
         return;
      }
   }

   /** if (type === EventType.PRESS) {
      let checkChannelID = detail?.notification?.android?.channelId || '';
      if (checkChannelID && checkChannelID !== MISSED_CALL) {
         let showCallModal = Store.getState()?.callData?.showCallModal;
         let activity = await ActivityModule.getActivity();
         if (AppState.currentState === 'active') {
            if (showCallModal && activity?.includes('CallScreenActivity')) {
               return;
            } else {
               openCallModelActivity();
            }
         } else {
            const push_url = getApplicationUrl();

            if (push_url) {
               Linking.openURL(push_url);
            }
            if (activity !== 'undefined') {
               // const push_url = 'mirrorfly_rn://';
               // Linking.openURL(push_url).then(() => {
               openCallModelActivity();
               // });
            } else {
               const push_url = getApplicationUrl();
               if (push_url) {
                  Linking.openURL(push_url).then(() => {
                     _BackgroundTimer.setTimeout(() => {
                        openCallModelActivity();
                     }, 200);
                  });
               }
            }
         }
      }
   } */

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
      const { data: confrenceData = {} } = Store.getState().showConfrenceData || {};
      const { callStatusText } = confrenceData;
      return new Promise(() => {
         Store.dispatch(setNotificationData(notification));
         if (notification?.android?.channelId === 'OnGoing Call' && callStatusText === CALL_STATUS_CONNECTED) {
            let callStartTime = Store.getState()?.callData?.callDuration;
            if (!callStartTime) {
               callStartTime = Date.now();
               Store.dispatch(callDurationTimestamp(callStartTime));
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
                        smallIcon: 'ic_call_notification',
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
   notifee.onBackgroundEvent(onNotificationAction);
   notifee.onForegroundEvent(onNotificationAction);
};

export const stopForegroundServiceNotification = async (cancelID = '') => {
   try {
      _BackgroundTimer.clearInterval(interval);
      let notifications = Store.getState().notificationData.data;
      await notifee.stopForegroundService();
      let displayedNotificationId = await notifee.getDisplayedNotifications();
      let cancelIDS = displayedNotificationId?.find(res => res.id === notifications.id)?.id;
      cancelIDS && (await notifee.cancelDisplayedNotification(cancelIDS));
      let channelId = notifications.android?.channelId;
      let channel =
         channelId &&
         (await notifee.getChannels()).find(res => res.id === channelId && res?.id?.includes('IncomingCall'))?.id;
      channel && (await notifee.deleteChannel(channel));
      Store.dispatch(resetNotificationData());
   } catch (error) {
      console.log('Error when stopping foreground service ', error);
   }
};
