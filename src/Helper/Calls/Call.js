import { showConfrence } from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import {
  CALL_RINGING_DURATION,
  CALL_STATUS_DISCONNECTED,
  DISCONNECTED_SCREEN_DURATION,
} from './Constant';

let missedCallNotificationTimer = null;

export const getMaxUsersInCall = () => 8;

export const startMissedCallNotificationTimer = res => {
  missedCallNotificationTimer = setTimeout(() => {
    // TODO: get the call connection status from store
    // let callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'));
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
}

export function dispatchDisconnected(statusMessage, remoteStreams = []) {
  const {
      getState,
      dispatch
  } = Store;
  const showConfrenceData = getState().showConfrenceData;
  const {
      data
  } = showConfrenceData;
  statusMessage = statusMessage || CALL_STATUS_DISCONNECTED;
  dispatch(showConfrence({
      ...(data || {}),
      callStatusText: statusMessage,
      remoteStream: remoteStreams.length > 1 ? remoteStreams : data.remoteStream,
      stopSound: true
  }))
}