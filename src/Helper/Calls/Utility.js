import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { v4 as uuidv4 } from 'uuid';
import { SDK } from '../../SDK';
import { muteLocalVideo } from '../../SDKActions/callbacks';
import {
  CallConnectionState,
  showConfrence,
  updateCallerUUID,
} from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import { formatUserIdToJid, getLocalUserDetails } from '../Chat/ChatHelper';
import { getMaxUsersInCall, startCallingTimer } from './Call';
import {
  OUTGOING_CALL_SCREEN,
  PERMISSION_DENIED
} from './Constant';

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

    Store.dispatch(CallConnectionState(callConnectionStatus));

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
        Store.dispatch(CallConnectionState(callConnectionStatusNew));
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
