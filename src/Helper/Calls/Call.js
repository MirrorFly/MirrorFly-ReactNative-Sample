import { AppState, Platform, Vibration } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import InCallManager from 'react-native-incall-manager';
import { RINGER_MODE, getRingerMode } from 'react-native-ringer-mode';
import Sound from 'react-native-sound';
import SDK from '../../SDK/SDK';
import {
   clearIosCallListeners,
   muteLocalVideo,
   removeRemoteStream,
   resetCallData,
   setDisconnectedScreenTimeoutTimer,
} from '../../SDK/sdkCallBacks';
import { callNotifyHandler, stopForegroundServiceNotification } from '../../calls/notification/callNotifyHandler';
import AudioRoutingModule from '../../customModules/AudioRoutingModule';
import { updateCallAgainData } from '../../redux/callAgainSlice';
import { updateCallVideoMutedAction } from '../../redux/callControlsSlice';
import {
   callConversion,
   pinUser,
   setCallModalScreen,
   setLargeVideoUser,
   updateCallConnectionState,
} from '../../redux/callStateSlice';
import { showConfrence, updateConference } from '../../redux/showConfrenceSlice';
import Store from '../../redux/store';
import { getLocalUserDetails } from '../../uikitMethods';
import {
   CALL_AGAIN_SCREEN,
   CALL_CONVERSION_STATUS_REQUEST,
   CALL_RINGING_DURATION,
   CALL_STATUS_CALLING,
   CALL_STATUS_DISCONNECTED,
   CALL_STATUS_RINGING,
   CALL_STATUS_TRYING,
   CALL_TYPE_VIDEO,
   DISCONNECTED_SCREEN_DURATION,
} from './Constant';
import {
   closeCallModalActivity,
   enableSpeaker,
   endCallForIos,
   getNickName,
   isPipModeEnabled,
   openCallModelActivity,
   resetCallModalActivity,
   setpreventMultipleClick,
   showOngoingNotification,
   startProximitySensor,
   stopProximityListeners,
} from './Utility';

let missedCallNotificationTimer = null;
let callingRemoteStreamRemovalTimer = null;
let outgoingCallTimer = null;
let endOutgoingCallTimer = null;
let endIncomingCallTimer = null;
let isPlayingRingintTone = false;
let reconnectingSound = null;
let unsubscribeVibrationEvent;
let silentEvent = false;
let audioRouted = '';

let volumeLevelsInDBBasedOnUserJid = [];
let volumeLevelsBasedOnUserJid = [];
let volumeLevelResettingTimeout = null;
let speakingUser = {};
let largeUserJid = null;
let showVoiceDetect = false;
let pinUserData = {};

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
      if (reconnectingSound === null) {
         reconnectingSound = new Sound('fly_reconnecting_tone.mp3', Sound.MAIN_BUNDLE, error => {
            if (error) {
               console.log('Error Loading reconnecting sound from bundle', error);
               return;
            }
            reconnectingSound?.play?.();
            reconnectingSound?.setNumberOfLoops(-1);
         });
      }
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
const updateCallAgainScreenData = (userID, callType) => {
   Store.dispatch(
      updateCallAgainData({
         callType,
         userId: userID,
      }),
   );
   Store.dispatch(setCallModalScreen(CALL_AGAIN_SCREEN));
};

export const endCall = async (isFromTimeout = false, userId = '', callType = '') => {
   setpreventMultipleClick(false);
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
      resetCallData();
      const _userID = userId;
      const _callType = callType;
      updateCallAgainScreenData(_userID, _callType);
   } else {
      clearIosCallListeners();
      endCallForIos();
      const timeout = BackgroundTimer.setTimeout(() => {
         resetCallData();
         closeCallModalActivity(true);
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

export const getCallConversionStoreData = () => {
   return Store.getState?.().callData.callConversionData || {};
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
      unsubscribeVibrationEvent = AudioRoutingModule.startVibrateEvent(async () => {
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

export const debounceFunction = (func, delay) => {
   let timeout;
   return (...args) => {
      BackgroundTimer.clearTimeout(timeout);
      timeout = BackgroundTimer.setTimeout(() => {
         func(...args);
      }, delay);
   };
};

export const setSelectedAudioRoute = selectedAudioRoute => {
   audioRouted = selectedAudioRoute;
};

export const getSelectedAudioRoute = () => {
   return audioRouted;
};

export const resetData = () => {
   volumeLevelsInDBBasedOnUserJid = [];
   volumeLevelsBasedOnUserJid = [];
   volumeLevelResettingTimeout = null;
   speakingUser = {};
   largeUserJid = null;
   showVoiceDetect = false;
   pinUserData = {};
};

export const selectLargeVideoUser = (userJid, volumelevel) => {
   return (dispatch, getState) => {
      if (largeUserJid === userJid) {
         return;
      }
      if (largeUserJid !== userJid) {
         largeUserJid = userJid;
      }
      const state = getState();
      const showConfrenceData = state.showConfrenceData;
      const { data: { remoteStream = [] } = {} } = showConfrenceData || {};

      let volumeLevelClassName;
      let volumeLevelVideo = 0;
      if (userJid) {
         if (!volumeLevelsBasedOnUserJid[userJid]) {
            volumeLevelsBasedOnUserJid[userJid] = 0.5;
         }
         volumeLevelsInDBBasedOnUserJid[userJid] = volumelevel ? volumelevel : 0;
         if (Object.keys(volumeLevelsInDBBasedOnUserJid).length > 1) {
            let largest = Object.values(volumeLevelsInDBBasedOnUserJid)[0];
            userJid = Object.keys(volumeLevelsInDBBasedOnUserJid)[0];
            for (const index in volumeLevelsInDBBasedOnUserJid) {
               if (volumeLevelsInDBBasedOnUserJid[index] > largest) {
                  largest = volumeLevelsInDBBasedOnUserJid[index];
                  userJid = index;
               }
            }
         }

         if (!speakingUser.jid) {
            largeUserJid = userJid;
         }

         if (speakingUser.jid === userJid) {
            if (speakingUser.count >= 2) {
               largeUserJid = userJid;
               speakingUser.jid = userJid;
               speakingUser.count = 1;
            } else {
               speakingUser.count += 1;
            }
         } else {
            speakingUser.jid = userJid;
            speakingUser.count = 1;
         }
         volumeLevelVideo = volumeLevelsInDBBasedOnUserJid[userJid];
         if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 0) {
            volumeLevelClassName = 0.5;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 1) {
            volumeLevelClassName = 0.52;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 2) {
            volumeLevelClassName = 0.54;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 3) {
            volumeLevelClassName = 0.58;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 4) {
            volumeLevelClassName = 0.6;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 5) {
            volumeLevelClassName = 0.64;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 6) {
            volumeLevelClassName = 0.68;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 7) {
            volumeLevelClassName = 0.72;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 8) {
            volumeLevelClassName = 0.76;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 9) {
            volumeLevelClassName = 0.78;
         } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 10) {
            volumeLevelClassName = 0.8;
         }

         showVoiceDetect = false;
         if (volumeLevelsBasedOnUserJid[userJid]) {
            if (
               (volumeLevelsBasedOnUserJid[userJid] === 0.5 && volumeLevelClassName !== 0.5) ||
               (volumeLevelsBasedOnUserJid[userJid] !== 0.5 && volumeLevelClassName === 0.5)
            ) {
               showVoiceDetect = true;
            }
         }
      } else {
         showVoiceDetect = true;
         const vcardData = getLocalUserDetails();
         if (remoteStream && remoteStream.length > 0) {
            remoteStream.map(rs => {
               let id = rs.fromJid;
               id = id.includes('@') ? id.split('@')[0] : id;
               if (id !== vcardData.fromUser) {
                  largeUserJid = rs.fromJid;
               }
            });
         }
      }
      volumeLevelsBasedOnUserJid[userJid] = volumeLevelClassName;

      dispatch(
         setLargeVideoUser({
            userJid: largeUserJid,
            volumeLevelsBasedOnUserJid,
            showVoiceDetect,
            volumeLevelVideo: volumeLevelVideo,
         }),
      );
      if (volumeLevelResettingTimeout !== null && userJid === largeUserJid) {
         clearInterval(volumeLevelResettingTimeout);
         volumeLevelResettingTimeout = null;
      }

      volumeLevelResettingTimeout = setTimeout(() => {
         setTimeout(() => {
            showVoiceDetect = false;
            dispatch(
               setLargeVideoUser({
                  userJid: largeUserJid,
                  volumeLevelsBasedOnUserJid,
                  showVoiceDetect,
               }),
            );
         }, 1000);
      }, 1000);
   };
};

function getFromJidFromRemoteStream(remoteStream) {
   const vcardData = getLocalUserDetails();
   let fromJid = '';
   if (remoteStream.length > 0) {
      remoteStream.map(rs => {
         let id = rs.fromJid;
         id = id.includes('@') ? id.split('@')[0] : id;
         if (id !== vcardData.fromUser) {
            fromJid = rs.fromJid;
         }
      });
   }
   return fromJid;
}

export const switchCallData = (callType, res) => {
   const callerUUID = Store.getState().callData.callerUUID || {};
   const isSpeakerEnabled = callType === CALL_TYPE_VIDEO ? true : false;
   enableSpeaker(callerUUID, isSpeakerEnabled);
   if (Platform.OS === 'android') {
      stopForegroundServiceNotification().then(() => {
         showOngoingNotification(res);
      });
   } else {
      isSpeakerEnabled ? stopProximityListeners() : startProximitySensor();
   }
};

/**
 * onetoone call, there is a feature called CALL SWITCH. So
 * Need update the callType after converted the audio call to video and
 * When both the user mute the call again conerted the video call to audio
 *
 * @param {*} param0
 * @param {*} localVideoMuted
 */
export const updateCallTypeAfterCallSwitch = async (localVideoMute, isLocalMute = false) => {
   const { getState } = Store;
   const { data } = getState().showConfrenceData;
   let { remoteStream, remoteVideoMuted } = data || {};
   const { isVideoMuted: localVideoMuted } = getState().callControlsData;
   const callConnectionStatus = { ...callConnectionStoreData() };
   if (!callConnectionStatus) return;
   let callType = null;
   if (
      remoteStream &&
      Array.isArray(remoteStream) &&
      remoteStream.length === 2 &&
      callConnectionStatus.callMode === 'onetoone'
   ) {
      let fromJid = getFromJidFromRemoteStream(remoteStream);
      if (localVideoMuted && fromJid && remoteVideoMuted[fromJid]) {
         callType = 'audio';
      } else {
         callType = 'video';
      }
      if (!isLocalMute) {
         Store.dispatch(updateCallVideoMutedAction(localVideoMute));
         muteLocalVideo(localVideoMute);
      }
      if (callType && callType !== callConnectionStatus.callType) {
         callConnectionStatus.callType = callType;
         Store.dispatch(updateCallConnectionState(callConnectionStatus));
         switchCallData(callType, callConnectionStatus);
         // need to update the callLogs in as per calltype
         // callLogs.update(callConnectionStatus.roomId, {
         //    callType,
         // });
      }
   }
};

let callSwitchTimer = null;
const clearCallSwitchTimer = () => {
   BackgroundTimer.clearTimeout(callSwitchTimer);
   callSwitchTimer = null;
};

export const callSwitch = res => {
   clearCallSwitchTimer();
   const { status, userJid } = res;
   const dispatchCallConversion = () => Store.dispatch(callConversion({ status, fromUser: userJid }));
   if (isPipModeEnabled()) {
      openCallModelActivity();
      if (status === CALL_CONVERSION_STATUS_REQUEST && callSwitchTimer === null) {
         callSwitchTimer = BackgroundTimer.setTimeout(() => {
            if (status === CALL_CONVERSION_STATUS_REQUEST) {
               dispatchCallConversion();
            }
         }, 650);
         return;
      }
   }
   dispatchCallConversion();
};
