import InCallManager from 'react-native-incall-manager';
import { removeRemoteStream, resetCallData } from '../../SDKActions/callbacks';
import {
  closeCallModal,
  pinUser,
  selectLargeVideoUser,
  showConfrence,
} from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import {
  CALL_RINGING_DURATION,
  CALL_STATUS_CALLING,
  CALL_STATUS_DISCONNECTED,
  CALL_STATUS_RINGING,
  DISCONNECTED_SCREEN_DURATION,
} from './Constant';

let missedCallNotificationTimer = null;
let callingRemoteStreamRemovalTimer = null;

export const getMaxUsersInCall = () => 8;

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

export const disconnectCallConnection = (remoteStreams = []) => {
  const callConnectionData = callConnectionStoreData();
  SDK.endCall();
  dispatchDisconnected(CALL_STATUS_DISCONNECTED, remoteStreams);
  // TODO: update the callLogs when implementing the feature
  // callLogs.update(callConnectionData.roomId, {
  // 		"endTime": callLogs.initTime(),
  // 		"sessionStatus": CALL_SESSION_STATUS_CLOSED
  // });
  // TODO: getFromLocalStorageAndDecrypt("isNewCallExist") verify
  const _isNewCallExist = /* getFromLocalStorageAndDecrypt("isNewCallExist") */ true;
  let timeOut = _isNewCallExist === true ? 0 : DISCONNECTED_SCREEN_DURATION;
  setTimeout(() => {
    // encryptAndStoreInLocalStorage('callingComponent', false)
    // deleteItemFromLocalStorage('roomName')
    // deleteItemFromLocalStorage('callType')
    // deleteItemFromLocalStorage('call_connection_status');
    // deleteItemFromLocalStorage('inviteStatus');
    // encryptAndStoreInLocalStorage("hideCallScreen", false);
    resetCallData();
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
  return Store.getState?.().callData || {};
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
      remoteStream:
        remoteStreams.length > 1 ? remoteStreams : data.remoteStream,
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
