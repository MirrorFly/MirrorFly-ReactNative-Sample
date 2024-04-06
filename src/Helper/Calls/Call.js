import { AppState, Platform, Vibration } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import InCallManager from 'react-native-incall-manager';
import { RINGER_MODE, getRingerMode } from 'react-native-ringer-mode';
import { subscribe as vibrationEventListener } from 'react-native-silentmode-detector';
import Sound from 'react-native-sound';
import { batch } from 'react-redux';
import SDK from '../../SDK/SDK';
import {
   clearIosCallListeners,
   removeRemoteStream,
   resetCallData,
   setDisconnectedScreenTimeoutTimer,
} from '../../SDKActions/callbacks';
import { callNotifyHandler, stopForegroundServiceNotification } from '../../calls/notification/callNotifyHandler';
import {
   pinUser,
   selectLargeVideoUser,
   setCallModalScreen,
   showConfrence,
   updateConference,
} from '../../redux/Actions/CallAction';
import { updateCallAgainData } from '../../redux/Actions/CallAgainAction';
import Store from '../../redux/store';
import {
   CALL_AGAIN_SCREEN,
   CALL_RINGING_DURATION,
   CALL_STATUS_CALLING,
   CALL_STATUS_DISCONNECTED,
   CALL_STATUS_RINGING,
   CALL_STATUS_TRYING,
   DISCONNECTED_SCREEN_DURATION,
} from './Constant';
import { closeCallModalActivity, endCallForIos, getNickName, resetCallModalActivity } from './Utility';

let missedCallNotificationTimer = null;
let callingRemoteStreamRemovalTimer = null;
let outgoingCallTimer = null;
let endOutgoingCallTimer = null;
let endIncomingCallTimer = null;
let isPlayingRingintTone = false;
let reconnectingSound = null;
let unsubscribeVibrationEvent;
let silentEvent = false;

export const getMaxUsersInCall = () => 8;

export const startOutgoingCallRingingTone = (callType = 'audio') => {
   try {
      // custom ringback added in the android and iOS folders and bundled with the app
      if (Platform.OS === 'ios') {
         InCallManager.startRingback('_BUNDLE_');
      } else {
         InCallManager.start({ media: callType, ringback: '_BUNDLE_' });
      }
      isPlayingRingintTone = true;
   } catch (err) {
      console.log('Error while starting the ringtone sound');
   }
};

export const stopOutgoingCallRingingTone = () => {
   try {
      isPlayingRingintTone = false;
      if (Platform.OS === 'ios') {
         InCallManager.stopRingback();
      } else {
         InCallManager.stop();
      }
   } catch (err) {
      console.log('Error while starting the ringtone sound');
   }
};

export const startReconnectingTone = () => {
   try {
      reconnectingSound = new Sound('fly_reconnecting_tone.mp3', Sound.MAIN_BUNDLE, error => {
         if (error) {
            console.log('Error Loading reconnecting sound from bundle', error);
            return;
         }
         reconnectingSound?.play?.();
         reconnectingSound?.setNumberOfLoops(-1);
      });
   } catch (err) {
      console.log('Error when starting reconnecting rigntone', err);
   }
};

export const stopReconnectingTone = () => {
   try {
      reconnectingSound?.stop?.();
      reconnectingSound?.release?.();
      reconnectingSound = null;
   } catch (err) {
      console.log('Error when stopping reconnecting rigntone', err);
   }
};

export const clearMissedCallNotificationTimer = () => {
   if (missedCallNotificationTimer !== null) {
      BackgroundTimer.clearTimeout(missedCallNotificationTimer);
      missedCallNotificationTimer = null;
   }
};

export const startMissedCallNotificationTimer = res => {
   let callConnectionData = callConnectionStoreData();
   missedCallNotificationTimer = BackgroundTimer.setTimeout(() => {
      if (callConnectionData) {
         const callDetailObj = callConnectionData ? { ...callConnectionData } : {};
         callDetailObj['status'] = 'ended';
         let nickName = getNickName(callConnectionData);
         /**TODO: notify that call disconnected if needed */
         callNotifyHandler(callDetailObj.roomId, callDetailObj, callDetailObj.userJid, nickName, 'MISSED_CALL');
      }
   }, CALL_RINGING_DURATION + DISCONNECTED_SCREEN_DURATION);
};

export const clearOldCallingTimer = () => {
   if (callingRemoteStreamRemovalTimer !== null) {
      clearTimeout(callingRemoteStreamRemovalTimer);
      callingRemoteStreamRemovalTimer = null;
   }
};

export const disconnectCallConnection = (remoteStreams = [], callStatusMessage = '', cb = () => {}) => {
   /**const callConnectionData = callConnectionStoreData();*/
   SDK.endCall();
   clearIosCallListeners();
   endCallForIos();

   dispatchDisconnected(callStatusMessage, remoteStreams);
   /**
    // TODO: update the callLogs when implementing the feature
    * callLogs.update(callConnectionData.roomId, {
   		"endTime": callLogs.initTime(),
   		"sessionStatus": CALL_SESSION_STATUS_CLOSED
         // TODO: getFromLocalStorageAndDecrypt("isNewCallExist") verify
   });*/
   const _isNewCallExist = /* getFromLocalStorageAndDecrypt("isNewCallExist") */ false;
   let timeOut = _isNewCallExist === true ? 0 : DISCONNECTED_SCREEN_DURATION;
   setTimeout(() => {
      resetCallData();
      cb?.();
   }, timeOut);
};

export const startCallingTimer = () => {
   clearOldCallingTimer();
   callingRemoteStreamRemovalTimer = setTimeout(() => {
      const { getState, dispatch } = Store;
      const showConfrenceData = getState().showConfrenceData;
      const { data } = showConfrenceData;
      if (data.remoteStream) {
         let remoteStreams = [...data.remoteStream];
         let remoteStreamsUpdated = [...data.remoteStream];
         if (remoteStreams) {
            remoteStreams.forEach(stream => {
               if (
                  stream.status &&
                  (stream.status.toLowerCase() === CALL_STATUS_CALLING ||
                     stream.status.toLowerCase() === CALL_STATUS_RINGING)
               ) {
                  removeRemoteStream(stream.fromJid);
                  remoteStreamsUpdated = remoteStreamsUpdated
                     .map(ele => {
                        if (ele.fromJid !== stream.fromJid) {
                           return ele;
                        } else {
                           return undefined;
                        }
                     })
                     .filter(e => e !== undefined);
               } else {
                  return undefined;
               }
            });
            if (remoteStreamsUpdated.length > 1) {
               dispatch(
                  showConfrence({
                     ...(data || {}),
                     remoteStream: remoteStreamsUpdated,
                  }),
               );
            } else {
               disconnectCallConnection(remoteStreams);
            }
         }
      }
   }, CALL_RINGING_DURATION);
};

//OutGoingCall Timer
export const clearEndOutgoingCallTimer = () => {
   if (endOutgoingCallTimer !== null) {
      BackgroundTimer.clearTimeout(endOutgoingCallTimer);
      endOutgoingCallTimer = null;
   }
};

export const clearOutgoingCallTimer = () => {
   if (outgoingCallTimer !== null) {
      BackgroundTimer.clearTimeout(outgoingCallTimer);
      outgoingCallTimer = null;
   }
};

export const clearOutgoingTimer = () => {
   clearOutgoingCallTimer();
   clearEndOutgoingCallTimer();
};

//Call Again Screen
const updateCallAgainScreenData = (userID, callType, localVideoStream, localVideoMuted) => {
   batch(() => {
      Store.dispatch(
         updateCallAgainData({
            callType,
            userId: userID,
            localVideoStream,
            localVideoMuted,
         }),
      );
      Store.dispatch(setCallModalScreen(CALL_AGAIN_SCREEN));
   });
};

export const endCall = async (isFromTimeout = false, userId = '', callType = '') => {
   const { data: confrenceData = {} } = Store.getState().showConfrenceData || {};
   const { callStatusText } = confrenceData;
   if ((callStatusText === CALL_STATUS_DISCONNECTED || callStatusText === undefined) && !isFromTimeout) {
      return;
   }
   clearOutgoingTimer();
   SDK.endCall();
   stopOutgoingCallRingingTone();
   if (Platform.OS === 'android') {
      stopForegroundServiceNotification();
   }
   dispatchDisconnected();
   /** callLogs.update(callConnectionDataEndCall.roomId, {
   //     "endTime": callLogs.initTime(),
   //     "sessionStatus": CALL_SESSION_STATUS_CLOSED
   // });
    */

   if (isFromTimeout) {
      let localVideoStream = Store.getState().showConfrenceData.data;
      resetCallData();
      const _userID = userId;
      const _callType = callType;
      updateCallAgainScreenData(_userID, _callType, localVideoStream.localStream, localVideoStream.localVideoMuted);
   } else {
      clearIosCallListeners();
      endCallForIos();
      const timeout = BackgroundTimer.setTimeout(() => {
         resetCallData();
         closeCallModalActivity(true);
         /**
         // Store.dispatch(closeCallModal());
         // batch(()=>{
         //     Store.dispatch(showConfrence({
         //         showComponent: false,
         //         screenName:'',
         //         showCalleComponent:false,
         //         stopSound: true,
         //         callStatusText: null
         //     }))
         // })
          */
      }, DISCONNECTED_SCREEN_DURATION);
      setDisconnectedScreenTimeoutTimer(timeout);
   }
};

export const startOutgoingcallTimer = (userId, callType) => {
   if (endOutgoingCallTimer === null) {
      outgoingCallTimer = BackgroundTimer.setTimeout(() => {
         let callStatus = Store.getState().showConfrenceData?.data?.callStatusText;
         callStatus === CALL_STATUS_TRYING &&
            Store.dispatch(
               updateConference({
                  callStatusText: 'Unavailable',
               }),
            );
      }, 10000);
      endOutgoingCallTimer = BackgroundTimer.setTimeout(() => {
         endCall(true, userId, callType);
      }, CALL_RINGING_DURATION);
   }
};

//IncomingCall Timer
export const clearIncomingCallTimer = () => {
   if (endIncomingCallTimer !== null) {
      BackgroundTimer.clearTimeout(endIncomingCallTimer);
      endIncomingCallTimer = null;
   }
};

export const endIncomingCall = () => {
   clearIncomingCallTimer();
   SDK.endCall();
   dispatchDisconnected('');
   /**
   // TODO: update the Call logs when implementing
   // callLogs.update(callConnectionDate.data.roomId, {
   //     "endTime": callLogs.initTime(),
   //     "sessionStatus": CALL_SESSION_STATUS_CLOSED
   // });
    */
   const timeout = BackgroundTimer.setTimeout(() => {
      resetCallData();
      resetCallModalActivity();
      /** Store.dispatch(resetCallStateData());*/
   }, DISCONNECTED_SCREEN_DURATION);
   setDisconnectedScreenTimeoutTimer(timeout);
};

export const startIncomingCallTimer = () => {
   if (endIncomingCallTimer === null) {
      endIncomingCallTimer = BackgroundTimer.setTimeout(() => {
         endIncomingCall();
      }, CALL_RINGING_DURATION);
   }
};

export const callConnectionStoreData = () => {
   return Store.getState?.().callData.connectionState || {};
};

export const showConfrenceStoreData = () => {
   return Store.getState?.().showConfrenceData || {};
};

export function dispatchDisconnected(statusMessage, remoteStreams = []) {
   const { getState, dispatch } = Store;
   const showConfrenceData = getState().showConfrenceData;
   const { data } = showConfrenceData;
   statusMessage = statusMessage || CALL_STATUS_DISCONNECTED;
   dispatch(
      showConfrence({
         ...(data || {}),
         callStatusText: statusMessage,
         remoteStream: remoteStreams.length > 1 ? remoteStreams : data.remoteStream,
         stopSound: true,
      }),
   );
}

export function resetPinAndLargeVideoUser(fromJid) {
   if (!fromJid) {
      Store.dispatch(selectLargeVideoUser());
      Store.dispatch(pinUser());
   }
   const state = Store.getState();
   const largeVideoUserData = state.callData?.largeVideoUser || {};
   if (largeVideoUserData.userJid === fromJid) {
      Store.dispatch(selectLargeVideoUser());
   }
   // If pinned user disconnected from the call, Need to remove the user.
   const pinUserData = state.callData?.pinUserData || {};
   if (pinUserData.userJid === fromJid) {
      Store.dispatch(pinUser(fromJid));
   }
}

export const getCurrentCallRoomId = () => {
   return Store.getState().callData?.connectionState?.roomId;
};

export const closeCallModalWithDelay = () => {
   setTimeout(() => {
      closeCallModalActivity();
      /** Store.dispatch(closeCallModal()); */
   }, DISCONNECTED_SCREEN_DURATION);
};

export const startVibration = async () => {
   const currentMode = await getRingerMode();
   if (Platform.OS === 'android' && currentMode === RINGER_MODE.vibrate) {
      let timerSec = AppState.currentState === 'active' ? 0 : 200;
      BackgroundTimer.setTimeout(() => {
         Vibration.vibrate([800, 1000], true);
      }, timerSec);
   }
};

export const startVibrationBasedOnEvent = () => {
   if (Platform.OS === 'android') {
      silentEvent = true;
      unsubscribeVibrationEvent = vibrationEventListener(async () => {
         const currentMode = await getRingerMode();
         if (currentMode !== RINGER_MODE.vibrate) {
            stopVibration();
         } else if (currentMode === RINGER_MODE.vibrate) {
            startVibration();
         }
      });
   }
};

export const clearVibrationEvent = () => {
   if (Platform.OS === 'android' && silentEvent) {
      unsubscribeVibrationEvent();
      silentEvent = false;
   }
};

export const startIncomingCallRingtone = () => {
   if (Platform.OS === 'android') {
      try {
         InCallManager.startRingtone();
         startVibration();
         startVibrationBasedOnEvent();
      } catch (err) {
         console.log('Error while starting the ringtone sound');
      }
   }
};

export const stopVibration = async () => {
   if (Platform.OS === 'android') {
      BackgroundTimer.setTimeout(() => {
         Vibration.cancel();
      }, 0);
   }
};

export const stopIncomingCallRingtone = () => {
   if (Platform.OS === 'android') {
      try {
         InCallManager.stopRingtone();
         clearVibrationEvent();
         stopVibration();
      } catch (err) {
         console.log('Error while stoping the ringtone sound');
      }
   }
};

export function getCallDuration(timerTime) {
   if (!timerTime) return '';
   let seconds = ('0' + (Math.floor(timerTime / 1000) % 60)).slice(-2);
   let minutes = ('0' + (Math.floor(timerTime / 60000) % 60)).slice(-2);
   let hours = ('0' + Math.floor(timerTime / 3600000)).slice(-2);
   const minAndSecs = `${minutes}:${seconds}`;
   return hours > 0 ? `${hours}:${minAndSecs}` : minAndSecs;
}

export const getMissedCallMessage = callType => {
   return `You missed an ${callType} call`;
};
