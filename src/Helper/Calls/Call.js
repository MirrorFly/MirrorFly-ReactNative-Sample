import Store from '../../redux/store';
import {
  CALL_RINGING_DURATION,
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

export const callConnectionStoreData = store => {
  store = store || Store;
  return store.getState?.().callData || {};
};

export const showConfrenceStoreData = store => {
  store = store || Store;
  return store.getState?.().showConfrenceData || {};
};