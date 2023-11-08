import { getLocalUserDetails } from '../../Helper/Chat/ChatHelper';
import {
  CALLCONNECTION_STATE_DATA,
  CALL_DURATION_TIMESTAMP,
  CLEAR_CALL_DATA,
  CLOSE_CALL_MODAL,
  CONFRENCE_POPUP_STATUS,
  LARGE_VIDEO_USER,
  OPEN_CALL_MODAL,
  PIN_USER,
  RESET_CONFRENCE_POPUP_STATUS,
  UPDATE_CALLER_UUID
} from './Constants';

let volumeLevelsInDBBasedOnUserJid = [];
let volumeLevelsBasedOnUserJid = [];
let volumeLevelResettingTimeout = null;
let speakingUser = {};
let largeUserJid = null;
let showVoiceDetect = false;
let pinUserData = {};

export const updateCallConnectionState = data => {
  return {
    type: CALLCONNECTION_STATE_DATA,
    payload: data,
  };
};

export const clearCallData = () => {
  return {
    type: CLEAR_CALL_DATA,
  };
};

export const showConfrence = data => {
  return {
    type: CONFRENCE_POPUP_STATUS,
    payload: data,
  };
};

export const resetConferencePopup = () => {
  return {
    type: RESET_CONFRENCE_POPUP_STATUS,
  };
};

export const updateCallerUUID = data => {
  return {
    type: UPDATE_CALLER_UUID,
    payload:data,
  };
};

export const pinUser = userJid => {
  return (dispatch, getState) => {
    const state = getState();
    pinUserData = state.callData?.pinUserData || {};
    userJid = userJid && pinUserData.userJid !== userJid ? userJid : null;

    dispatch({
      type: PIN_USER,
      payload: {
        userJid,
      },
    });
  };
};

export const selectLargeVideoUser = (userJid, volumelevel) => {
  return (dispatch, getState) => {
    if (largeUserJid === null) {
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
          (volumeLevelsBasedOnUserJid[userJid] === 0.5 &&
            volumeLevelClassName !== 0.5) ||
          (volumeLevelsBasedOnUserJid[userJid] !== 0.5 &&
            volumeLevelClassName === 0.5)
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

    dispatch({
      type: LARGE_VIDEO_USER,
      payload: {
        userJid: largeUserJid,
        volumeLevelsBasedOnUserJid,
        showVoiceDetect,
        volumeLevelVideo: volumeLevelVideo,
      },
    });
    if (volumeLevelResettingTimeout !== null && userJid === largeUserJid) {
      clearInterval(volumeLevelResettingTimeout);
      volumeLevelResettingTimeout = null;
    }

    volumeLevelResettingTimeout = setTimeout(() => {
      setTimeout(() => {
        showVoiceDetect = false;
        dispatch({
          type: LARGE_VIDEO_USER,
          payload: {
            userJid: largeUserJid,
            volumeLevelsBasedOnUserJid,
            showVoiceDetect,
          },
        });
      }, 1000);
    }, 1000);
  };
};

export const callDurationTimestamp = timestamp => {
  return {
    type: CALL_DURATION_TIMESTAMP,
    payload: {
      callDurationTimestamp: timestamp,
    },
  };
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

export const openCallModal = () => {
  return {
    type: OPEN_CALL_MODAL,
  };
};

export const closeCallModal = () => {
  return {
    type: CLOSE_CALL_MODAL,
  };
};
