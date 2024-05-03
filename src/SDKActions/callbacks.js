import AsyncStorage from '@react-native-async-storage/async-storage';
import nextFrame from 'next-frame';
import { Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import RNCallKeep from 'react-native-callkeep';
import HeadphoneDetection from 'react-native-headphone-detection';
import RNInCallManager from 'react-native-incall-manager';
import KeepAwake from 'react-native-keep-awake';
import KeyEvent from 'react-native-keyevent';
import { MediaStream } from 'react-native-webrtc';
import { batch } from 'react-redux';
import {
   callConnectionStoreData,
   clearIncomingCallTimer,
   clearMissedCallNotificationTimer,
   clearOutgoingTimer,
   dispatchDisconnected,
   getCurrentCallRoomId,
   resetPinAndLargeVideoUser,
   showConfrenceStoreData,
   startCallingTimer,
   startIncomingCallRingtone,
   startMissedCallNotificationTimer,
   startReconnectingTone,
   stopIncomingCallRingtone,
   stopOutgoingCallRingingTone,
   stopReconnectingTone,
} from '../Helper/Calls/Call';
import {
   AUDIO_ROUTE_BLUETOOTH,
   AUDIO_ROUTE_PHONE,
   AUDIO_ROUTE_SPEAKER,
   CALL_AGAIN_SCREEN,
   CALL_BUSY_STATUS_MESSAGE,
   CALL_CONVERSION_STATUS_CANCEL,
   CALL_CONVERSION_STATUS_REQ_WAITING,
   CALL_ENGAGED_STATUS_MESSAGE,
   CALL_STATUS_CONNECTED,
   CALL_STATUS_DISCONNECTED,
   CALL_STATUS_ENDED,
   CALL_STATUS_RECONNECT,
   CALL_STATUS_RINGING,
   CALL_TYPE_AUDIO,
   CALL_TYPE_VIDEO,
   DISCONNECTED_SCREEN_DURATION,
   INCOMING_CALL_SCREEN,
   ONGOING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import {
   addHeadphonesConnectedListenerForCall,
   audioRouteNameMap,
   closeCallModalActivity,
   constructMuteStatus,
   displayIncomingCallForAndroid,
   displayIncomingCallForIos,
   endCallForIos,
   getNickName,
   listnerForNetworkStateChangeWhenIncomingCall,
   setPreviousHeadsetStatus,
   showCallModalToast,
   showOngoingNotification,
   startDurationTimer,
   unsubscribeListnerForNetworkStateChangeWhenIncomingCall,
   updateAudioRouteTo,
   updateMissedCallNotification,
} from '../Helper/Calls/Utility';
import {
   formatUserIdToJid,
   getLocalUserDetails,
   handleChangeIntoDownloadingState,
   handleChangeIntoUploadingState,
   handleUploadNextImage,
} from '../Helper/Chat/ChatHelper';
import {
   CONNECTION_STATE_CONNECTING,
   GROUP_CREATED,
   GROUP_PROFILE_INFO_UPDATED,
   GROUP_USER_ADDED,
   GROUP_USER_LEFT,
   GROUP_USER_MADE_ADMIN,
   GROUP_USER_REMOVED,
   MIX_BARE_JID,
   MSG_CLEAR_CHAT,
   MSG_CLEAR_CHAT_CARBON,
   MSG_DELETE_CHAT_CARBON,
   MSG_DELETE_STATUS,
   MSG_DELETE_STATUS_CARBON,
   MSG_SEEN_ACKNOWLEDGE_STATUS,
   MSG_SEEN_STATUS,
   MSG_SENT_SEEN_STATUS_CARBON,
} from '../Helper/Chat/Constant';
import { fetchGroupParticipants } from '../Helper/Chat/Groups';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { getUserProfileFromSDK, showToast, updateUserProfileDetails } from '../Helper/index';
import SDK from '../SDK/SDK';
import { pushNotify, updateNotification } from '../Service/remoteNotifyHandle';
import { callNotifyHandler, stopForegroundServiceNotification } from '../calls/notification/callNotifyHandler';
import { handleLogOut } from '../common/utils';
import { getNotifyMessage, getNotifyNickName } from '../components/RNCamera/Helper';
import { updateConversationMessage, updateRecentChatMessage } from '../components/chat/common/createMessage';
import ActivityModule from '../customModules/ActivityModule';
import BluetoothHeadsetDetectionModule from '../customModules/BluetoothHeadsetDetectionModule';
import RingtoneSilentKeyEventModule from '../customModules/RingtoneSilentKeyEventModule';
import {
   callDurationTimestamp,
   clearCallData,
   closeCallModal,
   resetConferencePopup,
   resetData,
   selectLargeVideoUser,
   setCallModalScreen,
   showConfrence,
   updateCallConnectionState,
   updateCallerUUID,
   updateConference,
} from '../redux/Actions/CallAction';
import { resetCallControlsStateAction, updateCallVideoMutedAction } from '../redux/Actions/CallControlsAction';
import { resetCallModalToastDataAction } from '../redux/Actions/CallModalToasAction';
import {
   ClearChatHistoryAction,
   DeleteChatHistoryAction,
   deleteMessageForEveryone,
   deleteMessageForMe,
   updateChatConversationHistory,
   updateUploadStatus,
} from '../redux/Actions/ConversationAction';
import { updateDownloadData } from '../redux/Actions/MediaDownloadAction';
import { updateMediaUploadData } from '../redux/Actions/MediaUploadAction';
import { updateProfileDetail } from '../redux/Actions/ProfileAction';
import {
   clearLastMessageinRecentChat,
   deleteActiveChatAction,
   recentRecallUpdate,
   recentRemoveMessageUpdate,
   updateMsgByLastMsgId,
   updateRecentChatMessageStatus,
} from '../redux/Actions/RecentChatAction';
import {
   resetChatTypingStatus,
   updateChatTypingGoneStatus,
   updateChatTypingStatus,
} from '../redux/Actions/TypingAction';
import { deleteChatSeenPendingMsg } from '../redux/Actions/chatSeenPendingMsgAction';
import { setXmppStatus } from '../redux/Actions/connectionAction';
import { updateRosterData } from '../redux/Actions/rosterAction';
import { updateUserPresence } from '../redux/Actions/userAction';
import { default as Store, default as store } from '../redux/store';
import { uikitCallbackListeners } from '../uikitHelpers/uikitMethods';
import { updateChatMessage, updateSentSeenStatus } from '../redux/Actions/ChatMessageAction';

let localStream = null,
   localVideoMuted = false,
   localAudioMuted = false,
   onCall = false,
   onReconnect = false,
   disconnectedScreenTimeoutTimer;
let remoteVideoMuted = {},
   remoteStream = [],
   remoteAudioMuted = [];

export const getDisconnectedScreenTimeoutTimer = () => disconnectedScreenTimeoutTimer;

export const setDisconnectedScreenTimeoutTimer = _timer => (disconnectedScreenTimeoutTimer = _timer);

const clearDisconnectedScreenTimeout = () => {
   BackgroundTimer.clearTimeout(disconnectedScreenTimeoutTimer);
};

export const getIsUserOnCall = () => {
   return onCall;
};

export const clearIosCallListeners = () => {
   if (Platform.OS === 'ios') {
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
      RNCallKeep.removeEventListener('didChangeAudioRoute');
      RNInCallManager.setForceSpeakerphoneOn(false);
   }
};

export const resetCallData = () => {
   onCall = false;
   onReconnect = false;
   remoteStream = [];
   localStream = null;
   remoteVideoMuted = {};
   remoteAudioMuted = [];
   localVideoMuted = false;
   localAudioMuted = false;
   /**
   // if (getFromLocalStorageAndDecrypt('isNewCallExist') === true) {
   //   deleteItemFromLocalStorage('isNewCallExist');
   // } else {
   //   Store.dispatch(resetCallIntermediateScreen());
   // }
   */
   unsubscribeListnerForNetworkStateChangeWhenIncomingCall();
   HeadphoneDetection.remove?.();
   BluetoothHeadsetDetectionModule.removeAllListeners();
   RingtoneSilentKeyEventModule.removeAllListeners();
   setPreviousHeadsetStatus(false);
   KeyEvent.removeKeyUpListener();
   if (Platform.OS === 'ios') {
      clearIosCallListeners();
      endCallForIos();
   } else {
      RNInCallManager.setSpeakerphoneOn(false);
      // updating the call connected status to android native code
      ActivityModule.updateCallConnectedStatus(false);
   }
   stopOutgoingCallRingingTone();
   stopReconnectingTone();
   batch(() => {
      Store.dispatch(resetConferencePopup());
      Store.dispatch(clearCallData());
      Store.dispatch(callDurationTimestamp(0));
      Store.dispatch(resetCallControlsStateAction());
      Store.dispatch(resetCallModalToastDataAction());
   });
   resetData();
   /**
   // setTimeout(() => {
   //   Store.dispatch(isMuteAudioAction(false));
   // }, 1000);
    */
};

export const muteLocalVideo = isMuted => {
   localVideoMuted = isMuted;
   let vcardData = getLocalUserDetails();
   let currentUser = vcardData?.fromUser;
   currentUser = formatUserIdToJid(currentUser);
   remoteVideoMuted = constructMuteStatus(remoteVideoMuted, currentUser, isMuted);
   Store.dispatch(
      updateConference({
         localVideoMuted: localVideoMuted,
         remoteVideoMuted: remoteVideoMuted,
      }),
   );
};

export const muteLocalAudio = isMuted => {
   localAudioMuted = isMuted;
   let vcardData = getLocalUserDetails();
   let currentUser = vcardData?.fromUser;
   currentUser = formatUserIdToJid(currentUser);
   remoteAudioMuted[currentUser] = isMuted;
};

export const removeRemoteStream = userJid => {
   remoteStream.forEach((item, key) => {
      if (item.fromJid === userJid) {
         remoteStream.splice(key, 1);
      }
   });
};

const updatingUserStatusInRemoteStream = usersStatus => {
   usersStatus.forEach(user => {
      const index = remoteStream.findIndex(item => item.fromJid === user.userJid);
      if (index > -1) {
         remoteStream[index] = {
            ...remoteStream[index],
            status: user.status,
         };
         remoteVideoMuted = constructMuteStatus(remoteVideoMuted, user.userJid, user.videoMuted);
         remoteAudioMuted[user.userJid] = user.audioMuted;
      } else {
         let streamObject = {
            id: Date.now(),
            fromJid: user.userJid,
            status: user.status || CONNECTION_STATE_CONNECTING,
         };
         remoteStream.push(streamObject);
         remoteVideoMuted = constructMuteStatus(remoteVideoMuted, user.userJid, user.videoMuted);
         remoteAudioMuted[user.userJid] = user.audioMuted;
      }
   });
};

const ringing = async res => {
   if (!onCall) {
      const callConnectionData = callConnectionStoreData();
      if (callConnectionData.callType === 'audio') {
         localVideoMuted = true;
      }
      batch(() => {
         Store.dispatch(
            showConfrence({
               callStatusText: 'Ringing',
               localStream,
               remoteStream,
               localVideoMuted,
               localAudioMuted,
            }),
         );
         Store.dispatch(setCallModalScreen(OUTGOING_CALL_SCREEN));
      });
   } else {
      const showConfrenceData = showConfrenceStoreData();
      const { data } = showConfrenceData;
      const index = remoteStream.findIndex(item => item.fromJid === res.userJid);
      if (index > -1) {
         remoteStream[index] = {
            ...remoteStream[index],
            status: res.status,
         };
         Store.dispatch(
            showConfrence({
               ...(data || {}),
               remoteStream: remoteStream,
            }),
         );
      }
   }
};

const userStatus = res => {
   updatingUserStatusInRemoteStream(res.usersStatus);
};

const removingRemoteStream = res => {
   remoteStream.forEach((item, key) => {
      if (item.fromJid === res.userJid) {
         remoteStream.splice(key, 1);
      }
   });
};

const updateCallConnectionStatus = usersStatus => {
   const callConnectionData = callConnectionStoreData();
   let usersLen;
   if (usersStatus.length) {
      let currentUsers = usersStatus.filter(el => el.status.toLowerCase() !== CALL_STATUS_ENDED);
      usersLen = currentUsers.length;
   }
   let callDetailsObj = {
      ...callConnectionData,
      callMode:
         (callConnectionData?.groupId && callConnectionData?.groupId !== null && callConnectionData?.groupId !== '') ||
         usersLen > 2
            ? 'onetomany'
            : 'onetoone',
   };
   Store.dispatch(updateCallConnectionState(callDetailsObj));
};

const resetCloseModel = () => {
   resetCallData();
   closeCallModalActivity(true);
};

const ended = async res => {
   stopIncomingCallRingtone();
   stopOutgoingCallRingingTone();
   stopReconnectingTone();

   clearIosCallListeners();
   endCallForIos();

   if (res.sessionStatus === 'closed') {
      if (Platform.OS === 'android') {
         await stopForegroundServiceNotification();
      }
      clearIncomingCallTimer();
      clearOutgoingTimer();
      let callConnectionData = null;
      if (remoteStream && !onCall && !res.carbonAttended) {
         // Call ended before attend
         callConnectionData = callConnectionStoreData();
      }
      dispatchDisconnected(CALL_STATUS_DISCONNECTED);
      /**
      // callLogs.update(roomId, {
      //     "endTime": callLogs.initTime(),
      //     "sessionStatus": res.sessionStatus
      // });
       */
      if (callConnectionData) {
         clearMissedCallNotificationTimer();
      }
      let callDetailsObj = {
         ...callConnectionStoreData(),
         ...res,
      };
      Store.dispatch(updateCallConnectionState(callDetailsObj));
      // SetTimeout not working in background and killed state
      const timeout = BackgroundTimer.setTimeout(() => {
         resetCloseModel();
         /** Store.dispatch(callConversion()); */
      }, DISCONNECTED_SCREEN_DURATION);
      setDisconnectedScreenTimeoutTimer(timeout);

      //Missed call Notification for missed incoming call
      let screenName = Store.getState().callData.screenName;
      if (callConnectionData && !res.localUser && screenName === INCOMING_CALL_SCREEN) {
         const callDetailObj = callConnectionData ? { ...callConnectionData } : {};
         callDetailObj['status'] = 'ended';
         let nickName = getNickName(callConnectionData);
         /** TODO: notify that call disconnected if needed */
         callNotifyHandler(callDetailObj.roomId, callDetailObj, callDetailObj.userJid, nickName, 'MISSED_CALL');
      }
   } else {
      if (!onCall || (remoteStream && Array.isArray(remoteStream) && remoteStream.length < 1)) {
         return;
      }
      removingRemoteStream(res);
      /** resetPinAndLargeVideoUser(res.userJid); */
      updateCallConnectionStatus(res.usersStatus);
      const showConfrenceData = showConfrenceStoreData();
      const { data } = showConfrenceData;
      Store.dispatch(
         showConfrence({
            ...(data || {}),
            remoteStream: remoteStream,
            remoteVideoMuted,
            remoteAudioMuted,
         }),
      );
   }
};

const dispatchCommon = () => {
   /**Store.dispatch(callConversion());
    * Store.dispatch(closeCallModal());
    */
   closeCallModalActivity(true);
   resetCallData();
};

const handleEngagedOrBusyStatus = async res => {
   stopOutgoingCallRingingTone();
   updatingUserStatusInRemoteStream(res.usersStatus);
   if (res.sessionStatus === 'closed') {
      clearOutgoingTimer();
      if (Platform.OS === 'android') {
         stopForegroundServiceNotification();
      }
      /**
      // callLogs.update(roomId, {
      //    endTime: callLogs.initTime(),
      //    sessionStatus: res.sessionStatus,
      // });
       */
      const callStatusMsg = res.status === 'engaged' ? CALL_ENGAGED_STATUS_MESSAGE : CALL_BUSY_STATUS_MESSAGE;
      dispatchDisconnected(callStatusMsg);
      showCallModalToast(callStatusMsg, 2500);
      // UI and toast show without delay
      const timeout = BackgroundTimer.setTimeout(() => {
         dispatchCommon();
      }, DISCONNECTED_SCREEN_DURATION);
      setDisconnectedScreenTimeoutTimer(timeout);
   } else {
      if (remoteStream && Array.isArray(remoteStream) && remoteStream.length < 1) {
         return;
      }
      const showConfrenceData = Store.getState().showConfrenceData;
      const { data } = showConfrenceData;
      if (!onCall) {
         let callConnectionData = callConnectionStoreData();
         let userList = callConnectionData.userList.split(',');
         let updatedUserList = [];
         userList.forEach(user => {
            if (user !== res.userJid) {
               updatedUserList.push(user);
            }
         });
         callConnectionData.userList = updatedUserList.join(',');
         if (callConnectionData.callMode === 'onetomany' && !callConnectionData.groupId) {
            if (updatedUserList.length > 1) {
               callConnectionData.callMode = 'onetomany';
            } else {
               callConnectionData.callMode = 'onetoone';
               callConnectionData.to = updatedUserList[0];
            }
         }
         store.dispatch(updateCallConnectionState(callConnectionData));
      }
      let userDetails = await getUserProfileFromSDK(getUserIdFromJid(res.userJid));
      let toastMessage =
         res.status === 'engaged'
            ? `${userDetails.displayName} is on another call`
            : `${userDetails.displayName} is busy`;
      showToast(toastMessage, {
         id: 'Engaged_Toast',
      });
      removingRemoteStream(res);
      Store.dispatch(
         showConfrence({
            ...(data || {}),
            remoteStream: remoteStream,
            remoteVideoMuted,
            remoteAudioMuted,
         }),
      );
   }
};

const connected = async res => {
   const userIndex = remoteStream.findIndex(item => item.fromJid === res.userJid);
   if (userIndex > -1) {
      let usersStatus = res.usersStatus;
      updatingUserStatusInRemoteStream(usersStatus);
      updateCallConnectionStatus(usersStatus);
      const { getState, dispatch } = Store;
      const showConfrenceData = getState().showConfrenceData;
      const { data } = showConfrenceData;
      if (!res.localUser) {
         stopOutgoingCallRingingTone();
         stopReconnectingTone();
         clearOutgoingTimer();
         if (Platform.OS === 'android') {
            // once the call is connected, already selected audio route is not automatically working
            // so manually rerouting the audio to the selected one if it is changed
            const selectedAudioRoute = Store.getState().callControlsData?.selectedAudioRoute || '';
            if (selectedAudioRoute) {
               updateAudioRouteTo(selectedAudioRoute, selectedAudioRoute); // only first 2 params will be used in Android so passing empty data for remaining params
            }
            if (!onReconnect) {
               await stopForegroundServiceNotification();
               showOngoingNotification(res);
            }
         } else {
            const { isBluetoothHeadsetConnected = false } = Store.getState().callControlsData || {};
            if (isBluetoothHeadsetConnected) {
               const callData = Store.getState().callData || {};
               const callControlsData = Store.getState().callControlsData || {};
               const activeCallerUUID = callData?.callerUUID;
               const selectedAudioRoute = callControlsData?.selectedAudioRoute;
               if (selectedAudioRoute === AUDIO_ROUTE_SPEAKER) {
                  await updateAudioRouteTo(AUDIO_ROUTE_PHONE, AUDIO_ROUTE_PHONE, activeCallerUUID, false);
               }
               const _routes = await RNCallKeep.getAudioRoutes();
               _routes.forEach(r => {
                  if (audioRouteNameMap[r.type] === AUDIO_ROUTE_BLUETOOTH) {
                     updateAudioRouteTo(r.name, r.type, activeCallerUUID, false);
                  }
               });
            }
         }
         onReconnect = false;
      }
      batch(() => {
         dispatch(
            showConfrence({
               ...(data || {}),
               remoteStream,
               status: res.callStatus,
               localVideoMuted: localVideoMuted,
               localAudioMuted: localAudioMuted,
               remoteVideoMuted: remoteVideoMuted,
               remoteAudioMuted: remoteAudioMuted,
            }),
         );
         if (!res.localUser) {
            dispatch(setCallModalScreen(ONGOING_CALL_SCREEN));
            // updating the call connected status to android native code
            ActivityModule.updateCallConnectedStatus(true);
            startDurationTimer();
         } else if (store.getState().callData?.screenName === OUTGOING_CALL_SCREEN) {
            // SDK will give 'connected' callback with {... localUser: true} when local user goes offline and come back online
            // So in that case we will show reconnecting text in UI, so we are updating the callStatusText to 'ringing' when user came back online on outgoing call screen
            // before receiver accept or decline the call
            store.dispatch(
               updateConference({
                  callStatusText: CALL_STATUS_RINGING,
               }),
            );
         }
      });
   }
};

const connecting = res => {
   stopOutgoingCallRingingTone();
   updatingUserStatusInRemoteStream(res.usersStatus);
   const showConfrenceData = showConfrenceStoreData();
   const { data } = showConfrenceData;
   if (Object.keys(data).length) {
      Store.dispatch(
         showConfrence({
            ...(data || {}),
            callStatusText: res.status,
            localStream,
            remoteStream,
            localVideoMuted,
            localAudioMuted,
         }),
      );
      /**
      // Store.dispatch(setCallModalScreen(ONGOING_CALL_SCREEN));
      // callLogs.update(roomId, {
      //    sessionStatus: res.sessionStatus,
      //    // "startTime": callLogs.initTime()
      // });
       */
   }
};

const disconnected = res => {
   stopOutgoingCallRingingTone();
   stopReconnectingTone();
   console.log(res, 'disconnected');
   let vcardData = getLocalUserDetails();
   let currentUser = vcardData?.fromUser;
   currentUser = formatUserIdToJid(currentUser);
   updatingUserStatusInRemoteStream(res.usersStatus);
   let disconnectedUser = res.userJid;
   disconnectedUser = disconnectedUser.includes('@') ? disconnectedUser.split('@')[0] : disconnectedUser;
   if (remoteStream.length < 1 || disconnectedUser === currentUser) {
      /**
      // callLogs.update(roomId, {
      //    endTime: callLogs.initTime(),
      //    sessionStatus: res.sessionStatus,
      // });
      // resetPinAndLargeVideoUser();
      // Store.dispatch(hideModal());
       */
      resetCallData();
   } else {
      Store.dispatch(
         showConfrence({
            showComponent: false,
            showStreamingComponent: true,
            showCallingComponent: false,
            localStream: localStream,
            remoteStream: remoteStream,
            fromJid: '',
            status: 'REMOTESTREAM',
            localVideoMuted: localVideoMuted,
            localAudioMuted: localAudioMuted,
            remoteVideoMuted: remoteVideoMuted,
            remoteAudioMuted: remoteAudioMuted,
         }),
      );
      resetPinAndLargeVideoUser(res.fromJid);
      removingRemoteStream(res);
   }
};

const reconnecting = res => {
   stopOutgoingCallRingingTone();
   onReconnect = true;
   startReconnectingTone();
   updatingUserStatusInRemoteStream(res.usersStatus);
   const showConfrenceData = Store.getState().showConfrenceData;
   const { data } = showConfrenceData;
   const updatedConferenceData = {
      showCallingComponent: false,
      ...(data || {}),
      localStream: localStream,
      remoteStream: remoteStream,
      fromJid: res.userJid,
      status: 'REMOTESTREAM',
      localVideoMuted: localVideoMuted,
      localAudioMuted: localAudioMuted,
      remoteVideoMuted: remoteVideoMuted,
      remoteAudioMuted: remoteAudioMuted,
      callStatusText: CALL_STATUS_RECONNECT,
   };
   /** 
    *  let vcardData = getLocalUserDetails();
    * let currentUserJid = formatUserIdToJid(vcardData?.fromUser)
   if (currentUserJid === res.userJid) {
      updatedConferenceData.callStatusText = CALL_STATUS_RECONNECT;
   }*/
   Store.dispatch(showConfrence(updatedConferenceData));
};

const callStatus = res => {
   if (res.status === 'ringing') {
      ringing(res);
   } else if (res.status === 'connecting') {
      connecting(res);
   } else if (res.status === 'connected') {
      connected(res);
   } else if (res.status === 'busy') {
      handleEngagedOrBusyStatus(res);
   } else if (res.status === 'disconnected') {
      disconnected(res);
   } else if (res.status === 'engaged') {
      handleEngagedOrBusyStatus(res);
   } else if (res.status === 'ended') {
      ended(res);
   } else if (res.status === 'reconnecting') {
      reconnecting(res);
   } else if (res.status === 'userstatus') {
      userStatus(res);
   } else if (res.status === 'hold') {
      /**hold(res); */
   }
};

export const callBacks = {
   connectionListener: response => {
      const connStatus = response.status || '';
      uikitCallbackListeners()?.callBack?.(response);
      console.log('connectionListener', response);
      store.dispatch(setXmppStatus(response.status));
      store.dispatch(resetChatTypingStatus());
      AsyncStorage.setItem('connection_status', connStatus);
      if (response.status === 'CONNECTED') {
         console.log('Connection Established');
      } else if (response.status === 'DISCONNECTED') {
         console.log('Disconnected');
      } else if (response.status === 'LOGOUT') {
         console.log('LOGOUT');
         handleLogOut();
      }
   },
   messageListener: async res => {
      console.log('messageListener res ==>', JSON.stringify(res, null, 2));
      await nextFrame();
      switch (res.msgType) {
         case 'acknowledge':
            if (res?.type === 'seen') {
               store.dispatch(updateSentSeenStatus(res));
            }
            break;
         case 'sentMessage':
         case 'carbonSentMessage':
         case 'receiveMessage':
         case 'carbonReceiveMessage':
         case 'groupCreated':
         case 'groupProfileUpdated':
            updateRecentChatMessage(res, store.getState());
            updateConversationMessage(res, store.getState());
            store.dispatch(updateRosterData(res.profileDetails));
            if (
               !MIX_BARE_JID.test(res?.fromUserJid) &&
               !res.notification &&
               (res.msgType === 'receiveMessage' || res.msgType === 'carbonReceiveMessage')
            ) {
               pushNotify(res.msgId, getNotifyNickName(res), getNotifyMessage(res), res?.fromUserJid);
            }
            break;
      }
      switch (res.msgType) {
         case 'carbonDelivered':
         case 'delivered':
         case 'seen':
         case 'carbonSeen':
            batch(() => {
               store.dispatch(updateRecentChatMessageStatus(res));
               store.dispatch(updateChatMessage(res));
            });
            break;
         case 'composing':
         case 'carbonComposing':
            store.dispatch(updateChatTypingStatus(res?.groupId || res?.fromUserId));
            break;
         case 'carbonGone':
         case 'gone':
            store.dispatch(updateChatTypingGoneStatus(res?.groupId || res?.fromUserId));
            break;
      }
      if (res.msgType === MSG_CLEAR_CHAT || res.msgType === MSG_CLEAR_CHAT_CARBON) {
         store.dispatch(clearLastMessageinRecentChat(res.fromUserId));
         store.dispatch(ClearChatHistoryAction(res.fromUserId));
      }
      if (
         /* res.msgType === MSG_DELETE_CHAT || */
         res.msgType === MSG_DELETE_CHAT_CARBON
      ) {
         store.dispatch(deleteActiveChatAction(res));
         store.dispatch(DeleteChatHistoryAction(res));
      }
      if (
         res.msgType === MSG_DELETE_STATUS ||
         res.msgType === MSG_DELETE_STATUS_CARBON ||
         res.msgType === 'carbonMessageClear' ||
         res.msgType === 'messageClear' ||
         res.msgType === 'clear_message'
      ) {
         store.dispatch(deleteMessageForMe(res));
         store.dispatch(recentRemoveMessageUpdate(res));

         if ((res.msgType === MSG_DELETE_STATUS || res.msgType === MSG_DELETE_STATUS_CARBON) && res.lastMsgId) {
            SDK.getMessageById(res.lastMsgId);
         }
      }

      if (
         res.msgType === 'recallMessage' ||
         res.msgType === 'carbonRecallMessage' ||
         res.msgType === 'carbonSentRecall' ||
         res.msgType === 'carbonReceiveRecall' ||
         (res.msgType === 'acknowledge' && res.type === 'recall')
      ) {
         store.dispatch(recentRecallUpdate(res));
         store.dispatch(deleteMessageForEveryone(res));
         if (res.msgId) {
            updateNotification(res.msgId);
         }
      }

      /**
        // if (res.msgType === "carbonDelivered" || res.msgType === "delivered" || res.msgType === "seen" || res.msgType === "carbonSeen") {
            // store.dispatch(updateRecentChatMessageStatus(res))
            // store.dispatch(updateChatConversationHistory(res))
            // store.dispatch(storeDeliveryStatus(res))
            // if (res.msgType === "seen" || res.msgType === "carbonSeen") {
            //     store.dispatch(storeSeenStatus(res))
            // }
            // store.dispatch(addMessageInfoUpdate(
            //     {
            //         id: SDK.randomString(),
            //         activeUserId: res.publisherId,
            //         time: res.timestamp,
            //         messageStatus:
            //             res.msgType === MSG_DELIVERED_STATUS_CARBON || res.msgType === MSG_DELIVERED_STATUS
            //                 ? MSG_DELIVERED_STATUS_ID
            //                 : MSG_SEEN_STATUS_ID
            //     }))
        // }
        */
      // When message is seen, then delete the seen messages from pending seen message list
      const pendingMessages = store?.getState().chatSeenPendingMsgData?.data || [];
      if (
         pendingMessages.length > 0 &&
         (res.msgType === MSG_SENT_SEEN_STATUS_CARBON ||
            (res.msgType === MSG_SEEN_ACKNOWLEDGE_STATUS && res.type === MSG_SEEN_STATUS))
      ) {
         const { msgId: currentMsgId = null } = res;
         store.dispatch(deleteChatSeenPendingMsg(currentMsgId));
      }

      if (res.msgType === 'acknowledge' && res.type === 'acknowledge') {
         batch(() => {
            store.dispatch(updateRecentChatMessageStatus(res));
            store.dispatch(updateChatMessage(res));
         });
      }
   },
   presenceListener: res => {
      console.log('presenceListener res ==>', JSON.stringify(res, null, 2));
      store.dispatch(updateUserPresence(res));
   },
   userProfileListener: res => {
      if (Array.isArray(res)) {
         Store.dispatch(updateRosterData(res));
      } else {
         store.dispatch(updateProfileDetail(res));
         updateUserProfileDetails(res);
      }
   },
   replyMessageListener: res => {
      console.log('replyMessageListener', res);
   },
   favouriteMessageListener: res => {
      console.log('favouriteMessageListener', res);
   },
   groupProfileListener: res => {
      if (
         res.msgType === GROUP_CREATED ||
         res.msgType === GROUP_USER_ADDED ||
         res.msgType === GROUP_PROFILE_INFO_UPDATED
      ) {
         const obj = {
            userId: getUserIdFromJid(res.groupJid),
            userJid: res.groupJid,
            ...res.groupProfile,
         };
         store.dispatch(updateRosterData(obj));
         const userObj = {
            userId: getUserIdFromJid(res.newUserJid),
            userJid: res.newUserJid,
            ...res.userProfile,
         };
         store.dispatch(updateRosterData(userObj));
         const publisherObj = {
            userId: getUserIdFromJid(res.publisherJid),
            userJid: res.publisherJid,
            ...res.publisherProfile,
         };
         store.dispatch(updateRosterData(publisherObj));
      }
      if (
         res.msgType === GROUP_USER_ADDED ||
         res.msgType === GROUP_USER_REMOVED ||
         res.msgType === GROUP_USER_MADE_ADMIN ||
         res.msgType === GROUP_USER_LEFT
      ) {
         setTimeout(() => {
            fetchGroupParticipants(res.groupJid);
         }, 1000);
      }
   },
   groupMsgInfoListener: res => {
      console.log('groupMsgInfoListener = (res) => { }', res);
   },
   mediaUploadListener: res => {
      store.dispatch(updateMediaUploadData(res));
      // handleChangeIntoUploadingState(res.msgId);
      if (res.progress === 100) {
         let updateObj = {
            statusCode: 200,
            msgId: res.msgId,
            is_downloaded: 2,
            uploadStatus: 2,
            local_path: res.local_path,
            fromUserId: getUserIdFromJid(res.fromUserJid),
         };
         store.dispatch(updateUploadStatus(updateObj));
         BackgroundTimer.setTimeout(() => {
            handleUploadNextImage(updateObj);
         }, 200);
      }
   },
   mediaDownloadListener: res => {
      console.log('mediaDownloadListener res ==>', res);
      store.dispatch(updateDownloadData(res));
      // handleChangeIntoDownloadingState(res.msgId);
      if (res.progress === 100) {
         let updateObj = {
            statusCode: 200,
            msgId: res.msgId,
            is_downloaded: 2,
            uploadStatus: 2,
            local_path: res.local_path,
            fromUserId: getUserIdFromJid(res.fromUserJid),
         };
         store.dispatch(updateUploadStatus(updateObj));
      }
   },
   blockUserListener: res => {
      console.log('blockUserListener = (res) => { }', res);
   },
   singleMessageDataListener: res => {
      store.dispatch(updateMsgByLastMsgId(res));
   },
   muteChatListener: res => {
      console.log('muteChatListener = (res) => { }', res);
   },
   archiveChatListener: res => {
      console.log('archiveChatListener = (res) => { }', res);
   },
   userDeletedListener: res => {
      console.log('userDeletedListener = (res) => { }', res);
   },
   adminBlockListener: res => {
      console.log('adminBlockListener = (res) => { }', res);
   },
   incomingCallListener: function (res) {
      if (onCall) {
         SDK.callEngaged();
         return;
      }
      remoteStream = [];
      localStream = null;
      let callMode = 'onetoone';
      if (res.toUsers.length === 1 && res.groupId === null) {
         res.from = res.toUsers[0];
         res.to = res.userJid;
         if (res.callType === 'audio') {
            localVideoMuted = true;
         } else {
            Store.dispatch(updateCallVideoMutedAction(false));
         }
      } else {
         callMode = 'onetomany';
         res.from = res.userJid;
         res.to = res.groupId ? res.groupId : res.userJid;
         res.userList = res.allUsers.join(',');
         if (res.callType === 'audio') {
            localVideoMuted = true;
         } else {
            Store.dispatch(updateCallVideoMutedAction(false));
         }
      }
      res.callMode = callMode;

      let roomId = getCurrentCallRoomId();

      if (roomId === '' || roomId === null || roomId === undefined) {
         addHeadphonesConnectedListenerForCall();
         startIncomingCallRingtone();
         resetPinAndLargeVideoUser();
         if (res.callType === 'audio') {
            localVideoMuted = true;
         } else {
            Store.dispatch(updateCallVideoMutedAction(false));
         }
         let callStatusText = `Incoming ${res.callType} call`;
         batch(() => {
            Store.dispatch(updateCallConnectionState(res));
            Store.dispatch(
               updateConference({
                  callStatusText: callStatusText,
               }),
            );
         });
         // Adding network state change listener
         listnerForNetworkStateChangeWhenIncomingCall();
         clearDisconnectedScreenTimeout();
         if (Platform.OS === 'android') {
            let callUUID = SDK.randomString(16, 'BA');
            Store.dispatch(updateCallerUUID(callUUID));
            KeepAwake.activate();
            displayIncomingCallForAndroid(res);
         } else {
            displayIncomingCallForIos(res);
         }
         // In iOS if the user is in call again screen, and he receives an incoming call then
         // we should close the call again screen to prevent the user from seeing the Incoming call screen UI, because the incoming call screen UI is only for Android.
         // for iOS incoming call will only be shown in call kit
         const { showCallModal: isCallModalOpen, screenName: currentCallModalScreen } = Store.getState().callData || {};
         if (Platform.OS === 'ios' && isCallModalOpen && currentCallModalScreen === CALL_AGAIN_SCREEN) {
            Store.dispatch(closeCallModal());
         }
         Store.dispatch(setCallModalScreen(INCOMING_CALL_SCREEN));
         updatingUserStatusInRemoteStream(res.usersStatus);
         startMissedCallNotificationTimer();
         startCallingTimer();
      } else {
         SDK.callEngaged();
      }
      /**
      // callLogs.insert({
      //   callMode: res.callMode,
      //   callState: 0,
      //   callTime: callLogs.initTime(),
      //   callType: res.callType,
      //   fromUser: res.from,
      //   roomId: res.roomId,
      //   userList: res.userList,
      //   groupId: res.callMode === 'onetoone' ? '' : res.groupId,
      // });
       */
   },
   callStatusListener: function (res) {
      callStatus(res);
   },
   userTrackListener: (res, check) => {
      if (res.localUser) {
         if (!res.trackType) {
            return;
         }
         localStream = localStream || {};
         let mediaStream = null;
         if (res.track) {
            mediaStream = new MediaStream();
            mediaStream.addTrack(res.track);
         }
         localStream[res.trackType] = mediaStream;
         const { getState, dispatch } = Store;
         const showConfrenceData = getState().showConfrenceData;
         const { data } = showConfrenceData;
         const usersStatus = res.usersStatus;
         usersStatus.map(user => {
            const index = remoteStream.findIndex(item => item.fromJid === user.userJid);
            if (index > -1) {
               remoteStream[index] = {
                  ...remoteStream[index],
                  status: user.status,
               };
               remoteVideoMuted = constructMuteStatus(remoteVideoMuted, user.userJid, user.videoMuted);
               remoteAudioMuted[user.userJid] = user.audioMuted;
            } else {
               let streamObject = {
                  id: Date.now(),
                  fromJid: user.userJid,
                  status: user.status,
               };
               remoteStream.push(streamObject);
               remoteVideoMuted = constructMuteStatus(remoteVideoMuted, user.userJid, user.videoMuted);
               remoteAudioMuted[user.userJid] = user.audioMuted;
            }
         });
         /**
         // const roomName = getFromLocalStorageAndDecrypt('roomName');
         // if (roomName === '' || roomName == null || roomName == undefined) {
         //   const { roomId = '' } = SDK.getCallInfo();
         //   console.log('localStorage roomId :>> ', roomId);
         //   encryptAndStoreInLocalStorage('roomName', roomId);
         // }
          */

         dispatch(
            showConfrence({
               localVideoMuted: localVideoMuted,
               ...(data || {}),
               localStream: localStream,
               remoteStream,
               localAudioMuted: localAudioMuted,
               status: 'LOCALSTREAM',
            }),
         );
      } else {
         onCall = true;
         /**encryptAndStoreInLocalStorage('callingComponent', false); */
         const streamType = res.trackType;
         let mediaStream = null;
         if (res.track) {
            mediaStream = new MediaStream();
            mediaStream.addTrack(res.track);
         }
         const streamUniqueId = `stream${streamType.charAt(0).toUpperCase() + streamType.slice(1)}Id`;
         updatingUserStatusInRemoteStream(res.usersStatus);
         const userIndex = remoteStream.findIndex(item => item.fromJid === res.userJid);
         if (userIndex > -1) {
            let { stream } = remoteStream[userIndex];
            stream = stream || {};
            stream[streamType] = mediaStream;
            stream['id'] = Date.now();
            stream[streamUniqueId] = Date.now();
            remoteStream[userIndex]['stream'] = stream;
         } else {
            let streamObject = {
               id: Date.now(),
               fromJid: res.userJid,
               status: CALL_STATUS_CONNECTED,
               stream: {
                  [streamUniqueId]: Date.now(),
                  [streamType]: mediaStream,
               },
            };
            remoteStream.push(streamObject);
         }

         // When remoteStream user length is one, set that user as large video user
         if (remoteStream.length === 2) {
            Store.dispatch(selectLargeVideoUser(res.userJid));
         } else {
            remoteStream.forEach(item => {
               return Store.dispatch(selectLargeVideoUser(item.userJid));
            });
         }

         const { showConfrenceData, callConversionData } = Store.getState();
         const { data } = showConfrenceData;
         Store.dispatch(
            showConfrence({
               showCallingComponent: false,
               localVideoMuted: localVideoMuted,
               ...(data || {}),
               localStream: localStream,
               remoteStream: remoteStream,
               fromJid: res.userJid,
               status: 'REMOTESTREAM',
               localAudioMuted: localAudioMuted,
               remoteVideoMuted: remoteVideoMuted,
               remoteAudioMuted: remoteAudioMuted,
               callStatusText: CALL_STATUS_CONNECTED,
            }),
         );

         // Need to hide the call converison request & response screen when more than one remote
         // users joined in call
         if (remoteStream.length >= 3) {
            const status =
               callConversionData && callConversionData.status === CALL_CONVERSION_STATUS_REQ_WAITING
                  ? {
                       status: CALL_CONVERSION_STATUS_CANCEL,
                    }
                  : undefined;
            /** Store.dispatch(callConversion(status)); */
            status && SDK.callConversion(CALL_CONVERSION_STATUS_CANCEL);
         }
      }
   },
   mediaErrorListener: res => {
      console.log(res, 'userProfileListener');
   },
   callSpeakingListener: res => {
      /**console.log('Speaking listener', res); */
   },
   callUsersUpdateListener: res => {
      console.log(res, 'userProfileListener');
   },
   helper: {
      getDisplayName: () => {
         let vcardData = getLocalUserDetails();
         if (vcardData && vcardData.nickName) {
            return vcardData.nickName;
         }
         return 'Anonymous user ';
      },
      getImageUrl: () => {
         let vcardData = getLocalUserDetails();
         if (vcardData) {
            return vcardData.image;
         }
         return '';
      },
   },
   inviteUsersListener: res => {},
   callUserJoinedListener: function (res) {},
   callUserLeftListener: function (res) {},
   missedCallListener: res => {
      console.log(res, 'missedCallListener');
      updateMissedCallNotification(res);
   },
   callSwitchListener: function (res) {},
   muteStatusListener: res => {
      if (!res) return;
      let localUser = false;
      let vcardData = getLocalUserDetails();
      const currentUser = vcardData && vcardData.fromUser;
      let mutedUser = res.userJid;
      mutedUser = mutedUser.includes('@') ? mutedUser.split('@')[0] : mutedUser;
      if (res.localUser || currentUser === mutedUser) {
         localUser = true;
      }
      if (localUser) {
         if (res.trackType === CALL_TYPE_AUDIO) {
            localAudioMuted = res.isMuted;
         }
         if (res.trackType === CALL_TYPE_VIDEO) {
            localVideoMuted = res.isMuted;
         }
      } else {
         if (res.trackType === CALL_TYPE_AUDIO) {
            remoteAudioMuted[res.userJid] = res.isMuted;
            if (res.isMuted) {
               Store.dispatch(selectLargeVideoUser(res.userJid, -100));
            }
         }
         if (res.trackType === CALL_TYPE_VIDEO) {
            remoteVideoMuted = constructMuteStatus(remoteVideoMuted, res.userJid, res.isMuted);
         }
      }

      Store.dispatch(
         updateConference({
            localStream: localStream,
            remoteStream: remoteStream,
            fromJid: res.userJid,
            status: 'MUTESTATUS',
            localVideoMuted: localVideoMuted,
            localAudioMuted: localAudioMuted,
            remoteVideoMuted: remoteVideoMuted,
            remoteAudioMuted: remoteAudioMuted,
         }),
      );
      /** updateCallTypeAfterCallSwitch(); */
   },
};
