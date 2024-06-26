import { Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import HeadphoneDetection from 'react-native-headphone-detection';
import RNInCallManager from 'react-native-incall-manager';
import KeepAwake from 'react-native-keep-awake';
import KeyEvent from 'react-native-keyevent';
import { MediaStream } from 'react-native-webrtc';
import {
   callConnectionStoreData,
   clearIncomingCallTimer,
   clearMissedCallNotificationTimer,
   clearOutgoingTimer,
   dispatchDisconnected,
   getCurrentCallRoomId,
   resetData,
   resetPinAndLargeVideoUser,
   selectLargeVideoUser,
   setSelectedAudioRoute,
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
   CALL_AGAIN_SCREEN,
   CALL_BUSY_STATUS_MESSAGE,
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
   stopProximityListeners,
   unsubscribeListnerForNetworkStateChangeWhenIncomingCall,
   updateAudioRouteTo,
} from '../Helper/Calls/Utility';
import RootNavigation from '../Navigation/rootNavigation';
import { pushNotify } from '../Service/remoteNotifyHandle';
import { callNotifyHandler, stopForegroundServiceNotification } from '../calls/notification/callNotifyHandler';
import ActivityModule from '../customModules/ActivityModule';
import BluetoothHeadsetDetectionModule from '../customModules/BluetoothHeadsetDetectionModule';
import RNCallKeep from '../customModules/CallKitModule';
import RingtoneSilentKeyEventModule from '../customModules/RingtoneSilentKeyEventModule';
import {
   formatUserIdToJid,
   getNotifyMessage,
   getNotifyNickName,
   getUserIdFromJid,
   handleUploadNextImage,
   isLocalUser,
   showToast,
   updateDeleteForEveryOne,
} from '../helpers/chatHelpers';
import {
   CONNECTION_STATE_CONNECTING,
   GROUP_CREATED,
   GROUP_PROFILE_INFO_UPDATED,
   GROUP_USER_ADDED,
   GROUP_USER_LEFT,
   GROUP_USER_MADE_ADMIN,
   GROUP_USER_REMOVED,
   MIX_BARE_JID,
} from '../helpers/constants';
import { resetCallControlsStateAction, updateCallVideoMutedAction } from '../redux/callControlsSlice';
import { resetCallModalToastDataAction } from '../redux/callModalToastSlice';
import {
   callDurationTimestamp,
   clearCallData,
   setCallModalScreen,
   updateCallConnectionState,
   updateCallerUUID,
} from '../redux/callStateSlice';
import {
   addChatMessageItem,
   updateChatMessageSeenStatus,
   updateChatMessageStatus,
   updateMediaStatus,
} from '../redux/chatMessageDataSlice';
import { setXmppConnectionStatus } from '../redux/loggedInUserDataSlice';
import { setPresenceData } from '../redux/presenceDataSlice';
import { setProgress } from '../redux/progressDataSlice';
import { addRecentChatItem, updateMsgByLastMsgId, updateRecentMessageStatus } from '../redux/recentChatDataSlice';
import { getArchive } from '../redux/reduxHook';
import { setRoasterData } from '../redux/rosterDataSlice';
import { toggleArchiveSetting } from '../redux/settingDataSlice';
import { resetConferencePopup, showConfrence, updateConference } from '../redux/showConfrenceSlice';
import store from '../redux/store';
import { resetTypingStatus, setTypingStatus } from '../redux/typingStatusDataSlice';
import { REGISTERSCREEN } from '../screens/constants';
import { getLocalUserDetails, logoutClearVariables, mflog, setCurrectUserProfile } from '../uikitMethods';
import { CONNECTED } from './constants';
import { fetchGroupParticipants, getUserProfileFromSDK, getUserSettings } from './utils';
import { updateMissedCallNotification } from '../Helper/Calls/Utility';

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
   //   store.dispatch(resetCallIntermediateScreen());
   // }
   */
   unsubscribeListnerForNetworkStateChangeWhenIncomingCall();
   HeadphoneDetection.remove?.();
   BluetoothHeadsetDetectionModule.removeAllListeners();
   RingtoneSilentKeyEventModule.removeAllListeners();
   setPreviousHeadsetStatus(false);
   KeyEvent.removeKeyUpListener();
   setSelectedAudioRoute('');
   if (Platform.OS === 'ios') {
      clearIosCallListeners();
      endCallForIos();
      stopProximityListeners();
   } else {
      RNInCallManager.setSpeakerphoneOn(false);
      // updating the call connected status to android native code
      ActivityModule.updateCallConnectedStatus(false);
   }
   stopOutgoingCallRingingTone();
   stopReconnectingTone();

   store.dispatch(resetConferencePopup());
   store.dispatch(clearCallData());
   store.dispatch(callDurationTimestamp(0));
   store.dispatch(resetCallControlsStateAction());
   store.dispatch(resetCallModalToastDataAction());

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
   store.dispatch(
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
   remoteStream = remoteStream.filter(item => item.fromJid !== userJid);
};

const updatingUserStatusInRemoteStream = usersStatus => {
   usersStatus.forEach(user => {
      const index = remoteStream.findIndex(item => item.fromJid === user.userJid);
      if (index > -1) {
         const newRemoteStreamupdate = remoteStream.map((ele, ind) => {
            if (ind === index) {
               return {
                  ...ele,
                  status: user.status,
               };
            } else {
               return { ...ele };
            }
         });
         remoteStream = newRemoteStreamupdate;
         remoteVideoMuted = constructMuteStatus(remoteVideoMuted, user.userJid, user.videoMuted);
         remoteAudioMuted[user.userJid] = user.audioMuted;
      } else {
         let streamObject = {
            id: Date.now(),
            fromJid: user.userJid,
            status: user.status || CONNECTION_STATE_CONNECTING,
         };
         remoteStream = [...remoteStream, streamObject];
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

      store.dispatch(
         showConfrence({
            callStatusText: 'Ringing',
            localStream,
            remoteStream,
            localVideoMuted,
            localAudioMuted,
         }),
      );
      store.dispatch(setCallModalScreen(OUTGOING_CALL_SCREEN));
   } else {
      const showConfrenceData = showConfrenceStoreData();
      const { data } = showConfrenceData;
      const index = remoteStream.findIndex(item => item.fromJid === res.userJid);
      if (index > -1) {
         const mapRemoteStream = remoteStream.map((ele, ind) => {
            if (ind === index) {
               return { ...ele, status: res.status };
            } else {
               return { ...ele };
            }
         });
         remoteStream = mapRemoteStream;
         store.dispatch(
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
   remoteStream = remoteStream.filter(item => item.fromJid !== res.userJid);
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
   store.dispatch(updateCallConnectionState(callDetailsObj));
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
      store.dispatch(updateCallConnectionState(callDetailsObj));
      // SetTimeout not working in background and killed state
      const timeout = BackgroundTimer.setTimeout(() => {
         resetCloseModel();
         /** store.dispatch(callConversion()); */
      }, DISCONNECTED_SCREEN_DURATION);
      setDisconnectedScreenTimeoutTimer(timeout);

      //Missed call Notification for missed incoming call
      let screenName = store.getState().callData.screenName;
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
      store.dispatch(
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
   /**store.dispatch(callConversion());
    * store.dispatch(closeCallModal());
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
      const showConfrenceData = store.getState().showConfrenceData;
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
      showToast(toastMessage);
      removingRemoteStream(res);
      store.dispatch(
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
      const { getState, dispatch } = store;
      const showConfrenceData = getState().showConfrenceData;
      const { data } = showConfrenceData;
      if (!res.localUser) {
         stopOutgoingCallRingingTone();
         stopReconnectingTone();
         clearOutgoingTimer();
         if (Platform.OS === 'android') {
            // once the call is connected, already selected audio route is not automatically working
            // so manually rerouting the audio to the selected one if it is changed
            const selectedAudioRoute = store.getState().callControlsData?.selectedAudioRoute || '';
            if (selectedAudioRoute) {
               updateAudioRouteTo(selectedAudioRoute, selectedAudioRoute); // only first 2 params will be used in Android so passing empty data for remaining params
            }
            if (!onReconnect) {
               await stopForegroundServiceNotification();
               showOngoingNotification(res);
            }
         }
         onReconnect = false;
      }
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
   }
};

const connecting = res => {
   stopOutgoingCallRingingTone();
   updatingUserStatusInRemoteStream(res.usersStatus);
   const showConfrenceData = showConfrenceStoreData();
   const { data } = showConfrenceData;
   if (Object.keys(data).length) {
      store.dispatch(
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
      // store.dispatch(setCallModalScreen(ONGOING_CALL_SCREEN));
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
      // store.dispatch(hideModal());
       */
      resetCallData();
   } else {
      store.dispatch(
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
   const showConfrenceData = store.getState().showConfrenceData;
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
   store.dispatch(showConfrence(updatedConferenceData));
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
      store.dispatch(setXmppConnectionStatus(response.status));
      if (response.status === CONNECTED) {
         getUserSettings();
      }
      if (response.status === 'LOGOUT') {
         logoutClearVariables();
         RootNavigation.reset(REGISTERSCREEN);
      }
   },
   messageListener: async res => {
      console.log('res ==>', JSON.stringify(res, null, 2));
      switch (res.msgType) {
         case 'groupCreated':
         case 'receiveMessage':
         case 'groupProfileUpdated':
            res.archiveSetting = getArchive();
            store.dispatch(addRecentChatItem(res));
            store.dispatch(addChatMessageItem(res));
            if (
               !MIX_BARE_JID.test(res?.fromUserJid) &&
               !res.notification &&
               (res.msgType === 'receiveMessage' || res.msgType === 'carbonReceiveMessage')
            ) {
               pushNotify(res.msgId, getNotifyNickName(res), getNotifyMessage(res), res?.fromUserJid);
            }
            break;
         case 'delivered':
         case 'seen':
            store.dispatch(updateRecentMessageStatus(res));
            store.dispatch(updateChatMessageStatus(res));
            break;
         case 'acknowledge':
            if (res.type === 'seen') store.dispatch(updateChatMessageSeenStatus(res));
            if (res.type === 'acknowledge') {
               store.dispatch(updateRecentMessageStatus(res));
               store.dispatch(updateChatMessageStatus(res));
            }
            break;
         case 'composing':
         case 'carbonComposing':
            store.dispatch(setTypingStatus(res));
            break;
         case 'carbonGone':
         case 'gone':
            store.dispatch(resetTypingStatus(res));
            break;
         case 'deleteMessage':
            SDK.getMessageById(res.lastMsgId);
            break;
         case 'recallMessage':
            updateDeleteForEveryOne(res.fromUserId, res.msgId.split(','), res.fromUserJid);
            break;
      }
   },
   presenceListener: res => {
      console.log('presenceListener res ==>', JSON.stringify(res, null, 2));
      store.dispatch(setPresenceData(res));
   },
   userProfileListener: res => {
      if (isLocalUser(res.userId)) {
         setCurrectUserProfile(res);
      }
      store.dispatch(setRoasterData(res));
   },
   replyMessageListener: res => {},
   favouriteMessageListener: res => {},
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
         store.dispatch(setRoasterData(obj));
         const userObj = {
            userId: getUserIdFromJid(res.newUserJid),
            userJid: res.newUserJid,
            ...res.userProfile,
         };
         store.dispatch(setRoasterData(userObj));
         const publisherObj = {
            userId: getUserIdFromJid(res.publisherJid),
            userJid: res.publisherJid,
            ...res.publisherProfile,
         };
         store.dispatch(setRoasterData(publisherObj));
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
   groupMsgInfoListener: res => {},
   mediaUploadListener: res => {
      store.dispatch(setProgress(res));
      if (res.progress === 100) {
         const mediaStatusObj = {
            msgId: res.msgId,
            is_uploading: 2,
            local_path: res.local_path,
            userId: getUserIdFromJid(res.fromUserJid),
         };
         store.dispatch(updateMediaStatus(mediaStatusObj));
         BackgroundTimer.setTimeout(() => {
            handleUploadNextImage(mediaStatusObj);
         }, 200);
      }
   },
   mediaDownloadListener: res => {
      store.dispatch(setProgress(res));
      if (res.progress === 100) {
         const mediaStatusObj = {
            msgId: res.msgId,
            is_downloaded: 2,
            local_path: res.local_path,
            userId: getUserIdFromJid(res.fromUserJid),
         };
         store.dispatch(updateMediaStatus(mediaStatusObj));
      }
   },
   blockUserListener: res => {},
   singleMessageDataListener: res => {
      store.dispatch(updateMsgByLastMsgId(res));
   },
   muteChatListener: res => {},
   archiveChatListener: res => {
      console.log('archiveChatListener res ==>', JSON.stringify(res, null, 2));
   },
   userDeletedListener: res => {},
   adminBlockListener: res => {},
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
         getUserProfileFromSDK(getUserIdFromJid(res.userJid));
         if (res.callType === 'audio') {
            localVideoMuted = true;
         } else {
            store.dispatch(updateCallVideoMutedAction(false));
         }
      } else {
         callMode = 'onetomany';
         res.from = res.userJid;
         res.to = res.groupId ? res.groupId : res.userJid;
         res.userList = res.allUsers.join(',');
         if (res.callType === 'audio') {
            localVideoMuted = true;
         } else {
            store.dispatch(updateCallVideoMutedAction(false));
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
            store.dispatch(updateCallVideoMutedAction(false));
         }
         let callStatusText = `Incoming ${res.callType} call`;

         store.dispatch(updateCallConnectionState(res));
         store.dispatch(
            updateConference({
               callStatusText: callStatusText,
            }),
         );
         // Adding network state change listener
         listnerForNetworkStateChangeWhenIncomingCall();
         clearDisconnectedScreenTimeout();
         if (Platform.OS === 'android') {
            let callUUID = SDK.randomString(16, 'BA');
            store.dispatch(updateCallerUUID(callUUID));
            KeepAwake.activate();
            displayIncomingCallForAndroid(res);
         } else {
            displayIncomingCallForIos(res);
         }
         // In iOS if the user is in call again screen, and he receives an incoming call then
         // we should close the call again screen to prevent the user from seeing the Incoming call screen UI, because the incoming call screen UI is only for Android.
         // for iOS incoming call will only be shown in call kit
         const { showCallModal: isCallModalOpen, screenName: currentCallModalScreen } = store.getState().callData || {};
         if (Platform.OS === 'ios' && isCallModalOpen && currentCallModalScreen === CALL_AGAIN_SCREEN) {
            store.dispatch(closeCallModal());
         }
         store.dispatch(setCallModalScreen(INCOMING_CALL_SCREEN));
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
         const { getState, dispatch } = store;
         const showConfrenceData = getState().showConfrenceData;
         const { data } = showConfrenceData;
         const usersStatus = res.usersStatus;
         usersStatus.map(user => {
            const index = remoteStream.findIndex(item => item.fromJid === user.userJid);
            if (index > -1) {
               const mapRemoteStreamSucc = remoteStream.map((ele, ind) => {
                  if (ind === index) {
                     return { ...ele, status: user.status };
                  } else {
                     return { ...ele };
                  }
               });
               remoteStream = mapRemoteStreamSucc;
               remoteVideoMuted = constructMuteStatus(remoteVideoMuted, user.userJid, user.videoMuted);
               remoteAudioMuted[user.userJid] = user.audioMuted;
            } else {
               let streamObject = {
                  id: Date.now(),
                  fromJid: user.userJid,
                  status: user.status,
               };
               remoteStream = [...remoteStream, streamObject];
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
            stream = { ...stream } || {};
            stream[streamType] = mediaStream;
            stream['id'] = Date.now();
            stream[streamUniqueId] = Date.now();
            const mapRemote = remoteStream.map((ele, ind) => {
               if (ind === userIndex) {
                  return { ...ele, stream: stream };
               } else {
                  return { ...ele };
               }
            });
            remoteStream = mapRemote;
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
            remoteStream = [...remoteStream, streamObject];
         }

         // When remoteStream user length is one, set that user as large video user
         if (remoteStream.length === 2) {
            store.dispatch(selectLargeVideoUser(res.userJid));
         } else {
            remoteStream.forEach(item => {
               return store.dispatch(selectLargeVideoUser(item.userJid));
            });
         }

         const { showConfrenceData, callConversionData } = store.getState();
         const { data } = showConfrenceData;
         store.dispatch(
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
            /** store.dispatch(callConversion(status)); */
            status && SDK.callConversion(CALL_CONVERSION_STATUS_CANCEL);
         }
      }
   },
   mediaErrorListener: res => {
      console.log(res, 'userProfileListener');
   },
   callSpeakingListener: res => {},
   callUsersUpdateListener: res => {},
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
               store.dispatch(selectLargeVideoUser(res.userJid, -100));
            }
         }
         if (res.trackType === CALL_TYPE_VIDEO) {
            remoteVideoMuted = constructMuteStatus(remoteVideoMuted, res.userJid, res.isMuted);
         }
      }

      store.dispatch(
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
   userSettingsListener: res => {
      store.dispatch(toggleArchiveSetting(res?.archive));
   },
};
