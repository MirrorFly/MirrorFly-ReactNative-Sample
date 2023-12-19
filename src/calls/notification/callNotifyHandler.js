// import { AppState, Platform } from 'react-native';
// import { isActiveConversationUserOrGroup } from '../Helper/Chat/ChatHelper';
import notifee, { AndroidCategory, AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import { AppState, Linking } from 'react-native';
import { CHATCONVERSATION, CHATSCREEN, CONVERSATION_SCREEN } from '../../constant';
import { updateChatConversationLocalNav } from '../../redux/Actions/ChatConversationLocalNavAction';
import Store from '../../redux/store';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getCurrentUserJid } from '../redux/Actions/AuthAction';
// import Store from '../redux/store';
import _BackgroundTimer from 'react-native-background-timer';
import * as RootNav from '../../../src/Navigation/rootNavigation';
import { endCall, getCallDuration } from '../../Helper/Calls/Call';
import {
   CALL_STATUS_CONNECTED,
   INCOMING_CALL,
   MISSED_CALL,
   ONGOING_CALL,
   OUTGOING_CALL,
} from '../../Helper/Calls/Constant';
import { answerIncomingCall, declineIncomingCall, endOnGoingCall } from '../../Helper/Calls/Utility';
import { removeAllDeliveredNotification } from '../../Service/remoteNotifyHandle';
import {
   callDurationTimestamp,
   openCallModal,
   resetNotificationData,
   setNotificationData,
} from '../../redux/Actions/CallAction';
import { navigate } from '../../redux/Actions/NavigationAction';

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
   data,
   userJid,
   nickName,
   callStatusType,
   isFullScreenIntent,
) => {
   await notifee.deleteChannel('Incoming Call');
   let channelId = await notifee.createChannel({
      id: 'Incoming Call',
      name: 'Incoming Call',
      importance: AppState.currentState === 'active' ? AndroidImportance.DEFAULT : AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      vibration: true,
   });

   const notification = {
      title: 'Incoming audio call',
      body: nickName,
      data: { roomId: roomId } || null,
      android: {
         color: '#36A8F4',
         channelId: channelId,
         category: AndroidCategory.CALL,
         onlyAlertOnce: true,
         importance: AndroidImportance.HIGH,
         sound: '',
         smallIcon: 'ic_call_notification',
         asForegroundService: true,
         actions: [
            { title: 'Decline', pressAction: { id: 'decline' } },
            { title: 'Accept', pressAction: { id: 'accept', launchActivity: 'default' } },
         ],
         timestamp: Date.now(),
         showTimestamp: true,
      },
   };

   if (isFullScreenIntent) {
      notification.android.fullScreenAction = {
         id: 'default',
      };
   }
   /** Display a notification */
   await notifee.displayNotification(notification);
};

export const getOutGoingCallNotification = async (roomId, data, userJid, nickName, callStatusType) => {
   // await notifee.deleteChannel('OutGoing Call');
   let channelId = await notifee.createChannel({
      id: 'OutGoing Call',
      name: 'OutGoing Call',
      importance: AndroidImportance.DEFAULT,
      visibility: AndroidVisibility.PUBLIC,
      vibration: false,
   });
   const notification = {
      title: 'Outgoing audio call',
      body: nickName,
      data: { roomId: roomId } || null,
      android: {
         color: '#36A8F4',
         onlyAlertOnce: true,
         channelId: channelId,
         importance: AndroidImportance.DEFAULT,
         sound: '',
         category: AndroidCategory.CALL,
         smallIcon: 'ic_call_notification',
         asForegroundService: true,
         actions: [{ title: 'Hang up', pressAction: { id: 'hangup' } }],
         timestamp: Date.now(),
         showTimestamp: true,
      },
   };
   /** Display a notification */
   await notifee.displayNotification(notification);
};

export const getOnGoingCallNotification = async (roomId, data, userJid, nickName, callStatusType) => {
   // await notifee.deleteChannel('OnGoing Call');
   let channelId = await notifee.createChannel({
      id: 'OnGoing Call',
      name: 'OnGoing Call',
      importance: AndroidImportance.DEFAULT,
      visibility: AndroidVisibility.PUBLIC,
      vibration: false,
   });
   const notification = {
      title: 'OnGoing audio call',
      body: `Call duration: ${'00:00'}`,
      data: { roomId: roomId } || null,
      android: {
         color: '#36A8F4',
         onlyAlertOnce: true,
         channelId: channelId,
         importance: AndroidImportance.DEFAULT,
         sound: '',
         smallIcon: 'ic_call_notification',
         asForegroundService: true,
         actions: [{ title: 'Hang up', pressAction: { id: 'endCall' } }],
         timestamp: Date.now(),
         showTimestamp: true,
      },
   };
   /** Display a notification */
   await notifee.displayNotification(notification);
};

export const getMissedCallNotification = async (roomId, callDetailObj = {}, userJid, nickName, callStatusType) => {
   let title = `You missed ${callDetailObj.callType === 'audio' ? 'an' : 'a'} ${callDetailObj.callType} call`;
   let displayedNotificationId = await notifee.getDisplayedNotifications();
   let notificationExist = displayedNotificationId.find(
      res => res?.notification?.title === title && res?.notification?.body === nickName,
   );
   let channelId = notificationExist ? notificationExist?.notification?.android?.channelId : '';
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
};

const onChatNotificationForeGround = async ({ type, detail }) => {
   if (type === EventType.PRESS) {
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
   }
};

const onChatNotificationBackGround = async ({ type, detail }) => {
   if (type === EventType.PRESS) {
      const {
         notification: { data: { fromUserJID } = '' },
      } = detail;
      let x = { screen: CHATSCREEN, fromUserJID };
      const push_url = 'mirrorfly_rn://CHATSCREEN?fromUserJID=' + fromUserJID;
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
   if (type === EventType.PRESS) {
      let checkChannelID = detail?.notification?.android?.channelId;
      const push_url = 'mirrorfly_rn://';
      Linking.openURL(push_url);
      if (checkChannelID !== MISSED_CALL) {
         Store.dispatch(openCallModal());
      }
      // stopForegroundServiceNotification(cancelIDS);
   }

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

export async function setNotificationForegroundService() {
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
               console.log('callStartTime from foreground service', callStartTime);
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

   //  Register notification listeners
   notifee.onBackgroundEvent(onNotificationAction);
   notifee.onForegroundEvent(onNotificationAction);
}

export const stopForegroundServiceNotification = async (cancelID = '') => {
   try {
      _BackgroundTimer.clearInterval(interval);
      let notifications = Store.getState().notificationData.data;
      await notifee.stopForegroundService();
      let displayedNotificationId = await notifee.getDisplayedNotifications();
      let cancelIDS = displayedNotificationId?.find(res => res.id === notifications.id)?.id;
      cancelIDS && (await notifee.cancelDisplayedNotification(cancelIDS));
      let channelId = notifications.android?.channelId;
      let channel = channelId && (await notifee.getChannels()).find(res => res.id === channelId);
      // _BackgroundTimer.setTimeout(async () => {
      //    channel?.id && (await notifee.deleteChannel(channel?.id));
      // }, 0);
      Store.dispatch(resetNotificationData());
   } catch (error) {
      console.log('Error when stopping foreground service ', error);
   }
};
