import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { v4 as uuidv4 } from 'uuid';
import { SDK } from '../../SDK';
import { muteLocalVideo, resetCallData } from '../../SDKActions/callbacks';
import {
  updateCallConnectionState,
  showConfrence,
  updateCallerUUID,
  clearCallData,
  resetConferencePopup,
  closeCallModal,
} from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import { formatUserIdToJid, getLocalUserDetails } from '../Chat/ChatHelper';
import {
  clearMissedCallNotificationTimer,
  dispatchDisconnected,
  getMaxUsersInCall,
  startCallingTimer,
  stopIncomingCallRingtone,
} from './Call';
import {
  ONGOING_CALL_SCREEN,
  COMMON_ERROR_MESSAGE,
  DISCONNECTED_SCREEN_DURATION,
  OUTGOING_CALL_SCREEN,
  PERMISSION_DENIED,
} from './Constant';
import { getUserIdFromJid } from '../Chat/Utility';
import { batch } from 'react-redux';

export const makeCalls = async (callType, userId) => {
  let userList = [];
  if (!userId) {
    return;
  }
  let userListData = await getCallData(userId);
  userList = [...userListData];
  makeOne2OneCall(callType, userList);
};

const makeOne2OneCall = async (callType, usersList) => {
  // const roomName = getFromLocalStorageAndDecrypt('roomName');
  // if (roomName) {
  //     toast.info("Can't place a new call while you're already in a call.");
  //     return;
  // }
  let callMode = 'onetoone';
  let users = [];
  const maxMemberReached = Boolean(usersList.length > getMaxUsersInCall() - 1);
  if (maxMemberReached) {
    // toast.error("Maximum " + getMaxUsersInCall() + " members allowed in a call");
    return;
  }
  if (usersList.length > 1) {
    callMode = 'onetomany';
    users = usersList;
  } else {
    usersList.map(participant => {
      const { userJid, username, GroupUser } = participant;
      let user = userJid || username || GroupUser;
      user = user.split('@')[0];
      // let userDetails = getDataFromRoster(user);
      // if (!userDetails.isDeletedUser) {
      users.push(formatUserIdToJid(user));
      // }
    });
  }
  if (users.length === 1) {
    makeCall(callMode, callType, users, usersList, '');
  } else if (users.length > 1) {
    makeCall(callMode, callType, users, usersList, '');
  } else {
    // if(toast.error.length > 1) {
    //     toast.dismiss();
    //     // // toast.error(FEATURE_RESTRICTION_ERROR_MESSAGE);
    // }
  }
};

const makeCall = async (
  callMode,
  callType,
  groupCallMemberDetails,
  usersList,
  groupId = null,
) => {
  let connectionStatus = await AsyncStorage.getItem('connection_status');
  if (connectionStatus === 'CONNECTED') {
    let users = [],
      roomId = '',
      call = null,
      image = '';
    const vcardData = getLocalUserDetails();
    let fromuser = formatUserIdToJid(vcardData.fromUser);

    if (callMode === 'onetoone') {
      users = groupCallMemberDetails;
    } else if (callMode === 'onetomany') {
      if (groupCallMemberDetails.length > 0) {
        groupCallMemberDetails.forEach(function (member) {
          if (member !== fromuser) {
            if (typeof member === 'object') users.push(member.userJid);
            else users.push(member);
          }
        });
      } else {
        users = [''];
      }
    }

    let callConnectionStatus = {
      callMode: callMode,
      callStatus: 'CALLING',
      callType: callType,
      from: fromuser,
      userList: users.join(','),
    };

    if (callMode === 'onetoone') {
      callConnectionStatus.to = users.join(',');
      callConnectionStatus.userAvatar = image;
    } else if (callMode === 'onetomany') {
      callConnectionStatus.to = groupId;
      callConnectionStatus.groupId = groupId;
    }
    // AsyncStorage.setItem('call_connection_status', JSON.stringify(callConnectionStatus))
    // encryptAndStoreInLocalStorage('callType', callType)
    // encryptAndStoreInLocalStorage('callingComponent', true)
    // encryptAndStoreInLocalStorage('callFrom', getFromLocalStorageAndDecrypt('loggedInUserJidWithResource'));

    if (Platform.OS === 'ios') {
      const callerName = usersList.map(ele => ele.name).join(',');
      const hasVideo = callType === 'video';
      let uuid = uuidv4();
      let callerId = users.join(',')?.split?.('@')?.[0];
      Store.dispatch(updateCallerUUID(uuid));
      startCall(uuid, callerId, callerName, hasVideo);
    }

    Store.dispatch(updateCallConnectionState(callConnectionStatus));

    const showConfrenceData = Store.getState().showConfrenceData;
    const { data: confrenceData } = showConfrenceData;
    Store.dispatch(
      showConfrence({
        localStream: confrenceData?.localStream,
        localVideoMuted: confrenceData?.localVideoMuted,
        localAudioMuted: confrenceData?.localAudioMuted,
        // showComponent: true,
        screenName: OUTGOING_CALL_SCREEN,
        callStatusText: 'Calling',
      }),
    );
    try {
      if (callType === 'audio') {
        muteLocalVideo(true);
        call = await SDK.makeVoiceCall(users, groupId);
      } else if (callType === 'video') {
        muteLocalVideo(false);
        call = await SDK.makeVideoCall(users, groupId);
      }
      if (call.statusCode !== 200 && call.message === PERMISSION_DENIED) {
        deleteAndDispatchAction();
      } else {
        roomId = call.roomId;
        // callLogsObj.insert({
        //     "callMode": callConnectionStatus.callMode,
        //     "callState": 1,
        //     "callTime": callLogsObj.initTime(),
        //     "callType": callConnectionStatus.callType,
        //     "fromUser": callConnectionStatus.from,
        //     "roomId": roomId,
        //     "userList": callConnectionStatus.userList,
        //     ...(callMode === "onetomany" && {
        //         "groupId": groupId
        //     })
        // });
        // encryptAndStoreInLocalStorage('roomName', roomId)
        let callConnectionStatusNew = {
          ...callConnectionStatus,
          roomId: roomId,
        };
        // encryptAndStoreInLocalStorage(
        //   'call_connection_status',
        //   JSON.stringify(callConnectionStatusNew),
        // );
        Store.dispatch(updateCallConnectionState(callConnectionStatusNew));
        startCallingTimer();
      }
    } catch (error) {
      console.log('Error in making call', error);
      if (error.message === PERMISSION_DENIED) {
        // deleteItemFromLocalStorage('roomName');
        // deleteItemFromLocalStorage('callType');
        // deleteItemFromLocalStorage('call_connection_status');
        // encryptAndStoreInLocalStorage('hideCallScreen', false);
        // encryptAndStoreInLocalStorage('callingComponent', false);
        // encryptAndStoreInLocalStorage('hideCallScreen', false);
        Store.dispatch(
          showConfrence({
            showComponent: false,
            showCalleComponent: false,
            stopSound: true,
            callStatusText: null,
          }),
        );
      }
    }
    // // preventMultipleClick = false;
  } else {
    // toast.error(NO_INTERNET)
    // // preventMultipleClick = false;
  }
};

const startCall = (uuid, callerId, callerName, hasVideo) => {
  RNCallKeep.startCall(uuid, callerId, callerName, 'generic', hasVideo);
};

export const answerIncomingCall = async () => {
  stopIncomingCallRingtone();
  clearMissedCallNotificationTimer();
  const answerCallResonse = await SDK.answerCall();
  console.log('answerCallResonse', answerCallResonse);
  if (answerCallResonse.statusCode !== 200) {
    if (answerCallResonse.message !== PERMISSION_DENIED) {
      showToast(COMMON_ERROR_MESSAGE, { id: 'call-answer-error' });
    }
    // deleteItemFromLocalStorage('roomName');
    // deleteItemFromLocalStorage('callType');
    // deleteItemFromLocalStorage('call_connection_status');
    // encryptAndStoreInLocalStorage('hideCallScreen', false);
    // encryptAndStoreInLocalStorage('callingComponent', false);
    // encryptAndStoreInLocalStorage('hideCallScreen', false);
    batch(() => {
      Store.dispatch(clearCallData());
      Store.dispatch(resetConferencePopup());
    });
  } else {
    // update the call screen Name instead of the below line
    // encryptAndStoreInLocalStorage('connecting', true);
    Store.dispatch(
      showConfrence({
        // showComponent: true,
        // showCalleComponent: false,
        screenName: ONGOING_CALL_SCREEN,
      }),
    );
    // TODO: update the Call logs when implementing
    // callLogs.update(callConnectionDate.data.roomId, {
    //   startTime: callLogs.initTime(),
    //   callState: 2,
    // });
  }
};

export const declineIncomingCall = async () => {
  stopIncomingCallRingtone();
  clearMissedCallNotificationTimer();
  let declineCallResponse = await SDK.declineCall();
  console.log('declineCallResponse', declineCallResponse);
  if (declineCallResponse.statusCode === 200) {
    // TODO: update the Call logs when implementing
    // callLogs.update(callConnectionDate.data.roomId, {
    //   endTime: callLogs.initTime(),
    //   sessionStatus: CALL_SESSION_STATUS_CLOSED,
    // });
    dispatchDisconnected();
    setTimeout(() => {
      // deleteItemFromLocalStorage('roomName');
      // deleteItemFromLocalStorage('callType');
      // deleteItemFromLocalStorage('call_connection_status');
      // encryptAndStoreInLocalStorage('hideCallScreen', false);
      batch(() => {
        Store.dispatch(closeCallModal());
        Store.dispatch(clearCallData());
        Store.dispatch(resetConferencePopup());
      });
      resetCallData();
    }, DISCONNECTED_SCREEN_DURATION);
  } else {
    console.log(
      'Error occured while rejecting the incoming call',
      declineCallResponse.errorMessage,
    );
  }
};

const handleIncoming_CallKeepListeners = () => {
  RNCallKeep.addEventListener('answerCall', async ({ callUUID }) => {
    console.log('callUUID from Call Keep answer call event', callUUID);
    answerIncomingCall();
  });
  RNCallKeep.addEventListener('endCall', async ({ callUUID }) => {
    console.log('callUUID from Call Keep end call event', callUUID);
    declineIncomingCall();
  });
};

export const displayIncomingCallForIos = (callResponse, uuid) => {
  console.log('callResponse', JSON.stringify(callResponse, null, 2));
  const callingUserData = callResponse.usersStatus?.find(
    u => u.userJid === callResponse.userJid && u.localUser === false,
  );
  if (callingUserData) {
    const contactNumber = getUserIdFromJid(callResponse.userJid);
    const contactName = callingUserData.userDetails?.displayName || '';
    handleIncoming_CallKeepListeners();
    RNCallKeep.displayIncomingCall(
      uuid,
      contactNumber,
      contactName,
      'generic',
      callResponse.callType === 'video',
    );
  }
};

const deleteAndDispatchAction = () => {
  // deleteItemFromLocalStorage('roomName')
  // deleteItemFromLocalStorage('callType')
  // deleteItemFromLocalStorage('call_connection_status')
  // encryptAndStoreInLocalStorage("hideCallScreen", false);
  // encryptAndStoreInLocalStorage('callingComponent', false)
  // encryptAndStoreInLocalStorage("hideCallScreen", false);
  Store.dispatch(
    showConfrence({
      showComponent: false,
      showCalleComponent: false,
      stopSound: true,
      callStatusText: null,
    }),
  );
};

export const getCallData = async userJid => {
  return Promise.all(
    userJid.map(async userId => {
      const jid = formatUserIdToJid(userId);
      const profileData = await SDK.getUserProfile(jid);
      if (profileData && profileData.statusCode === 200) {
        let response = {
          email: profileData.data.email,
          image: profileData.data.image,
          isAdminBlocked: 0,
          isDeletedUser: false,
          isFriend: true,
          mobileNumber: profileData.data.mobileNumber,
          name: profileData.data.nickName,
          nickName: profileData.data.nickName,
          status: profileData.data.status,
          userColor: '',
          userId: profileData.data.userId,
          userJid: jid,
        };
        let data = {
          contactName: profileData.data.nickName,
          email: profileData.data.email,
          image: profileData.data.image,
          isAdminBlocked: 0,
          isDeletedUser: false,
          isFriend: true,
          mobileNumber: profileData.data.mobileNumber,
          name: profileData.data.nickName,
          nickName: profileData.data.nickName,
          roster: response,
          userId: profileData.data.userId,
          userJid: jid,
        };
        return data;
      }
    }),
  );
};
