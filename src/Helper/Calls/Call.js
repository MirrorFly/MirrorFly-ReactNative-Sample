import { Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import SDK from '../../SDK/SDK';
import { removeRemoteStream, resetCallData } from '../../SDKActions/callbacks';
import { closeCallModal, pinUser, selectLargeVideoUser, showConfrence } from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import {
   CALL_RINGING_DURATION,
   CALL_STATUS_CALLING,
   CALL_STATUS_DISCONNECTED,
   CALL_STATUS_RINGING,
   DISCONNECTED_SCREEN_DURATION,
} from './Constant';
let missedCallNotificationTimer = null;
let callingRemoteStreamRemovalTimer = null,
   isPlayingRingintTone = false;

export const getMaxUsersInCall = () => 8;

export const getIsPlayingRingingTone = () => {
   return isPlayingRingintTone;
};

export const startMissedCallNotificationTimer = res => {
   missedCallNotificationTimer = setTimeout(() => {
      let callConnectionData = callConnectionStoreData();
      if (callConnectionData) {
         const callDetailObj = callConnectionData
            ? {
                 ...callConnectionData,
              }
            : {};
         callDetailObj['status'] = 'ended';
         // TODO: notify that call disconnected if needed
         // browserNotify.sendCallNotification(callDetailObj);
      }
   }, CALL_RINGING_DURATION + DISCONNECTED_SCREEN_DURATION);
};

export const clearOldCallingTimer = () => {
   if (callingRemoteStreamRemovalTimer !== null) {
      clearTimeout(callingRemoteStreamRemovalTimer);
      callingRemoteStreamRemovalTimer = null;
   }
};

export const disconnectCallConnection = (remoteStreams = [], callStatusMessage = '', cb) => {
   const callConnectionData = callConnectionStoreData();
   SDK.endCall();
   // dispatchDisconnected(CALL_STATUS_DISCONNECTED, remoteStreams);
   dispatchDisconnected(callStatusMessage, remoteStreams);
   // TODO: update the callLogs when implementing the feature
   // callLogs.update(callConnectionData.roomId, {
   // 		"endTime": callLogs.initTime(),
   // 		"sessionStatus": CALL_SESSION_STATUS_CLOSED
   // });
   // TODO: getFromLocalStorageAndDecrypt("isNewCallExist") verify
   const _isNewCallExist = /* getFromLocalStorageAndDecrypt("isNewCallExist") */ false;
   let timeOut = _isNewCallExist === true ? 0 : DISCONNECTED_SCREEN_DURATION;
   setTimeout(() => {
      resetCallData();
      cb?.();
      // TODO: commenting the below line as this reducer has been resetted form the above method. Verify once
      // Store.dispatch(showConfrence({
      // 		showComponent: false,
      // 		showCalleComponent: false,
      // 		callStatusText: null,
      // 		showStreamingComponent: false
      // }))
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

export const callConnectionStoreData = () => {
   return Store.getState?.().callData.connectionState || {};
};

export const showConfrenceStoreData = () => {
   return Store.getState?.().showConfrenceData || {};
};

export const clearMissedCallNotificationTimer = () => {
   if (missedCallNotificationTimer !== null) {
      clearTimeout(missedCallNotificationTimer);
      missedCallNotificationTimer = null;
   }
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
      Store.dispatch(closeCallModal());
   }, DISCONNECTED_SCREEN_DURATION);
};

export const startIncomingCallRingtone = () => {
   try {
      InCallManager.startRingtone();
   } catch (err) {
      console.log('Error while starting the ringtone sound');
   }
};

export const stopIncomingCallRingtone = () => {
   try {
      InCallManager.stopRingtone();
   } catch (err) {
      console.log('Error while stoping the ringtone sound');
   }
};

export const startOutgoingCallRingingTone = (callType = 'audio') => {
   try {
      // custom ringback added in the android and iOS folders and bundled with the app
      if (Platform.OS === 'ios') {
         InCallManager.startRingback('_BUNDLE_');
      } else {
         InCallManager.start({ media: callType, ringback: '_BUNDLE_' });
      }
      isPlayingRingintTone = true;
      // In Android when starting the ringback tone it is playing it in speaker
      // so turning off the speaker before starting the ringing tone
      // if (Platform.OS === 'android') {
      //    InCallManager.setSpeakerphoneOn(false);
      //    InCallManager.setForceSpeakerphoneOn(false);
      // }
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
      // InCallManager.startRingtone('_BUNDLE_');
   } catch (err) {
      console.log('Error when starting reconnecting rigntone', err);
   }
};

export const stopReconnectingTone = () => {
   try {
      // InCallManager.stopRingtone();
   } catch (err) {
      console.log('Error when stopping reconnecting rigntone', err);
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
