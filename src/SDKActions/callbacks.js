import AsyncStorage from '@react-native-async-storage/async-storage';
import nextFrame from 'next-frame';
import { MediaStream } from 'react-native-webrtc';
import { batch } from 'react-redux';
import {
  callConnectionStoreData,
  clearMissedCallNotificationTimer,
  closeCallModalWithDelay,
  dispatchDisconnected,
  getCurrentCallRoomId,
  resetPinAndLargeVideoUser,
  showConfrenceStoreData,
  startCallingTimer,
  startMissedCallNotificationTimer,
} from '../Helper/Calls/Call';
import {
  CALL_CONVERSION_STATUS_CANCEL,
  CALL_CONVERSION_STATUS_REQ_WAITING,
  CALL_STATUS_CONNECTED,
  CALL_STATUS_ENDED,
  INCOMING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import {
  formatUserIdToJid,
  getLocalUserDetails,
} from '../Helper/Chat/ChatHelper';
import {
  CONNECTION_STATE_CONNECTING,
  MSG_CLEAR_CHAT,
  MSG_CLEAR_CHAT_CARBON,
  MSG_DELETE_CHAT_CARBON,
  MSG_DELETE_STATUS,
  MSG_DELETE_STATUS_CARBON,
  MSG_SEEN_ACKNOWLEDGE_STATUS,
  MSG_SEEN_STATUS,
  MSG_SENT_SEEN_STATUS_CARBON,
} from '../Helper/Chat/Constant';
import { updateUserProfileDetails } from '../Helper/index';
import * as RootNav from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import { pushNotify, updateNotification } from '../Service/remoteNotifyHandle';
import {
  getNotifyMessage,
  getNotifyNickName,
} from '../components/RNCamera/Helper';
import {
  updateConversationMessage,
  updateRecentChatMessage,
} from '../components/chat/common/createMessage';
import { REGISTERSCREEN } from '../constant';
import {
  CallConnectionState,
  opneCallModal,
  resetConferencePopup,
  resetData,
  showConfrence
} from '../redux/Actions/CallAction';
import {
  ClearChatHistoryAction,
  DeleteChatHistoryAction,
  deleteMessageForEveryone,
  deleteMessageForMe,
  updateChatConversationHistory,
} from '../redux/Actions/ConversationAction';
import { updateDownloadData } from '../redux/Actions/MediaDownloadAction';
import { updateMediaUploadData } from '../redux/Actions/MediaUploadAction';
import { navigate } from '../redux/Actions/NavigationAction';
import { updateProfileDetail } from '../redux/Actions/ProfileAction';
import {
  clearLastMessageinRecentChat,
  deleteActiveChatAction,
  recentRecallUpdate,
  recentRemoveMessageUpdate,
  updateMsgByLastMsgId,
  updateRecentChatMessageStatus,
} from '../redux/Actions/RecentChatAction';
import {
  resetChatTypingStatus,
  updateChatTypingGoneStatus,
  updateChatTypingStatus,
} from '../redux/Actions/TypingAction';
import { deleteChatSeenPendingMsg } from '../redux/Actions/chatSeenPendingMsgAction';
import { setXmppStatus } from '../redux/Actions/connectionAction';
import { updateUserPresence } from '../redux/Actions/userAction';
import { default as Store, default as store } from '../redux/store';
import { uikitCallbackListeners } from '../uikitHelpers/uikitMethods';

let localStream = null,
  localVideoMuted = false,
  localAudioMuted = false,
  onCall = false;
let remoteVideoMuted = [],
  remoteStream = [],
  remoteAudioMuted = [];

export const resetCallData = () => {
  onCall = false;
  remoteStream = [];
  localStream = null;
  remoteVideoMuted = [];
  remoteAudioMuted = [];
  localVideoMuted = false;
  localAudioMuted = false;
  // if (getFromLocalStorageAndDecrypt('isNewCallExist') === true) {
  //   deleteItemFromLocalStorage('isNewCallExist');
  // } else {
  //   Store.dispatch(resetCallIntermediateScreen());
  // }
  // Store.dispatch(callDurationTimestamp());
  Store.dispatch(resetConferencePopup());
  resetData();
  // setTimeout(() => {
  //   Store.dispatch(isMuteAudioAction(false));
  // }, 1000);
};

export const muteLocalVideo = isMuted => {
  localVideoMuted = isMuted;
  let vcardData = getLocalUserDetails();
  let currentUser = vcardData?.fromUser;
  currentUser = formatUserIdToJid(currentUser);
  remoteVideoMuted[currentUser] = isMuted;
};

export const muteLocalAudio = isMuted => {
  localAudioMuted = isMuted;
  let vcardData = getLocalUserDetails();
  let currentUser = vcardData?.fromUser;
  currentUser = formatUserIdToJid(currentUser);
  remoteAudioMuted[currentUser] = isMuted;
};

export const removeRemoteStream = userJid => {
  remoteStream.forEach((item, key) => {
    if (item.fromJid === userJid) {
      remoteStream.splice(key, 1);
    }
  });
};

const updatingUserStatusInRemoteStream = usersStatus => {
  usersStatus.map(user => {
    const index = remoteStream.findIndex(item => item.fromJid === user.userJid);
    if (index > -1) {
      remoteStream[index] = {
        ...remoteStream[index],
        status: user.status,
      };
      remoteVideoMuted[user.userJid] = user.videoMuted;
      remoteAudioMuted[user.userJid] = user.audioMuted;
    } else {
      let streamObject = {
        id: Date.now(),
        fromJid: user.userJid,
        status: user.status || CONNECTION_STATE_CONNECTING,
      };
      remoteStream.push(streamObject);
      remoteVideoMuted[user.userJid] = user.videoMuted;
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
    Store.dispatch(
      showConfrence({
        callStatusText: 'Ringing',
        showStreamingComponent: false,
        localStream,
        remoteStream,
        localVideoMuted,
        localAudioMuted,
        showComponent: true,
      }),
    );
  } else {
    const showConfrenceData = showConfrenceStoreData();
    const { data } = showConfrenceData;
    const index = remoteStream.findIndex(item => item.fromJid === res.userJid);
    if (index > -1) {
      remoteStream[index] = {
        ...remoteStream[index],
        status: res.status,
      };
      Store.dispatch(
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
  remoteStream.forEach((item, key) => {
    if (item.fromJid === res.userJid) {
      remoteStream.splice(key, 1);
    }
  });
};

const updateCallConnectionStatus = usersStatus => {
  const callConnectionData = callConnectionStoreData();
  let usersLen;
  if (usersStatus.length) {
    let currentUsers = usersStatus.filter(
      el => el.status.toLowerCase() !== CALL_STATUS_ENDED,
    );
    usersLen = currentUsers.length;
  }
  let callDetailsObj = {
    ...callConnectionData,
    callMode:
      (callConnectionData?.groupId &&
        callConnectionData?.groupId !== null &&
        callConnectionData?.groupId !== '') ||
      usersLen > 2
        ? 'onetomany'
        : 'onetoone',
  };
  Store.dispatch(CallConnectionState(callDetailsObj));
  // encryptAndStoreInLocalStorage("call_connection_status", JSON.stringify(callDetailsObj));
};

const ended = res => {
  // deleteItemFromLocalStorage('inviteStatus');
  // let roomId = getFromLocalStorageAndDecrypt('roomName');
  if (res.sessionStatus === 'closed') {
    let callConnectionData = null;
    if (remoteStream && !onCall && !res.carbonAttended) {
      // Call ended before attend
      callConnectionData = callConnectionStoreData();
    }
    // callLogs.update(roomId, {
    //     "endTime": callLogs.initTime(),
    //     "sessionStatus": res.sessionStatus
    // });
    dispatchDisconnected();
    if (callConnectionData) {
      clearMissedCallNotificationTimer();
    }
    batch(() => {
      // localstoreCommon();
      Store.dispatch(resetConferencePopup());
      // Store.dispatch(callConversion());
      // Store.dispatch(hideModal());
      Store.dispatch(CallConnectionState(res));
    });
    closeCallModalWithDelay();
    if (callConnectionData) {
      const callDetailObj = callConnectionData
        ? {
            ...callConnectionData,
          }
        : {};
      callDetailObj['status'] = 'ended';
      // browserNotify.sendCallNotification(callDetailObj);
    }
    resetCallData();
  } else {
    if (
      !onCall ||
      (remoteStream && Array.isArray(remoteStream) && remoteStream.length < 1)
    ) {
      return;
    }
    removingRemoteStream(res);
    // resetPinAndLargeVideoUser(res.userJid);
    updateCallConnectionStatus(res.usersStatus);
    const showConfrenceData = showConfrenceStoreData();
    const { data } = showConfrenceData;
    Store.dispatch(
      showConfrence({
        ...(data || {}),
        remoteStream: remoteStream,
        remoteVideoMuted,
        remoteAudioMuted,
      }),
    );
  }
};

const callStatus = res => {
  if (res.status === 'ringing') {
    ringing(res);
  } else if (res.status === 'connecting') {
    // connecting(res);
  } else if (res.status === 'connected') {
    // connected(res);
  } else if (res.status === 'busy') {
    // handleEngagedOrBusyStatus(res);
  } else if (res.status === 'disconnected') {
    // disconnected(res);
  } else if (res.status === 'engaged') {
    // handleEngagedOrBusyStatus(res);
  } else if (res.status === 'ended') {
    ended(res);
  } else if (res.status === 'reconnecting') {
    // reconnecting(res);
  } else if (res.status === 'userstatus') {
    userStatus(res);
  } else if (res.status === 'hold') {
    // hold(res);
  }
};

export const callBacks = {
  connectionListener: response => {
    const connStatus = response.status || '';
    uikitCallbackListeners()?.callBack?.(response);
    console.log('connectionListener', response);
    store.dispatch(setXmppStatus(response.status));
    store.dispatch(resetChatTypingStatus());
    AsyncStorage.setItem('connection_status', connStatus);
    if (response.status === 'CONNECTED') {
      console.log('Connection Established');
    } else if (response.status === 'DISCONNECTED') {
      console.log('Disconnected');
    } else if (response.status === 'LOGOUT') {
      console.log('LOGOUT');
      store.dispatch(navigate({ screen: REGISTERSCREEN }));
      RootNav.reset(REGISTERSCREEN);
    }
  },
  dbListener: res => {
    console.log('dbListener', JSON.stringify(res));
  },
  messageListener: async res => {
    await nextFrame();
    if (res.chatType === 'chat') {
      switch (res.msgType) {
        case 'sentMessage':
        case 'carbonSentMessage':
        case 'receiveMessage':
        case 'carbonReceiveMessage':
          updateRecentChatMessage(res, store.getState());
          updateConversationMessage(res, store.getState());
          pushNotify(
            res.msgId,
            getNotifyNickName(res),
            getNotifyMessage(res),
            res?.publisherJid,
          );
          break;
      }
    }
    switch (res.msgType) {
      case 'carbonDelivered':
      case 'delivered':
      case 'seen':
      case 'carbonSeen':
        store.dispatch(updateRecentChatMessageStatus(res));
        store.dispatch(updateChatConversationHistory(res));
        break;
      case 'composing':
      case 'carbonComposing':
        store.dispatch(updateChatTypingStatus(res?.groupId || res?.fromUserId));
        break;
      case 'carbonGone':
      case 'gone':
        store.dispatch(
          updateChatTypingGoneStatus(res?.groupId || res?.fromUserId),
        );
        break;
    }
    if (
      res.msgType === MSG_CLEAR_CHAT ||
      res.msgType === MSG_CLEAR_CHAT_CARBON
    ) {
      store.dispatch(clearLastMessageinRecentChat(res.fromUserId));
      store.dispatch(ClearChatHistoryAction(res.fromUserId));
    }
    if (
      /* res.msgType === MSG_DELETE_CHAT || */
      res.msgType === MSG_DELETE_CHAT_CARBON
    ) {
      store.dispatch(deleteActiveChatAction(res));
      store.dispatch(DeleteChatHistoryAction(res));
    }
    if (
      res.msgType === MSG_DELETE_STATUS ||
      res.msgType === MSG_DELETE_STATUS_CARBON ||
      res.msgType === 'carbonMessageClear' ||
      res.msgType === 'messageClear' ||
      res.msgType === 'clear_message'
    ) {
      store.dispatch(deleteMessageForMe(res));
      store.dispatch(recentRemoveMessageUpdate(res));

      if (
        (res.msgType === MSG_DELETE_STATUS ||
          res.msgType === MSG_DELETE_STATUS_CARBON) &&
        res.lastMsgId
      ) {
        SDK.getMessageById(res.lastMsgId);
      }
    }

    if (
      res.msgType === 'recallMessage' ||
      res.msgType === 'carbonRecallMessage' ||
      res.msgType === 'carbonSentRecall' ||
      res.msgType === 'carbonReceiveRecall' ||
      (res.msgType === 'acknowledge' && res.type === 'recall')
    ) {
      store.dispatch(recentRecallUpdate(res));
      store.dispatch(deleteMessageForEveryone(res));
      if (res.msgId) {
        updateNotification(res.msgId);
      }
    }

    /**
        // if (res.msgType === "carbonDelivered" || res.msgType === "delivered" || res.msgType === "seen" || res.msgType === "carbonSeen") {
            // store.dispatch(updateRecentChatMessageStatus(res))
            // store.dispatch(updateChatConversationHistory(res))
            // store.dispatch(storeDeliveryStatus(res))
            // if (res.msgType === "seen" || res.msgType === "carbonSeen") {
            //     store.dispatch(storeSeenStatus(res))
            // }
            // store.dispatch(addMessageInfoUpdate(
            //     {
            //         id: uuidv4(),
            //         activeUserId: res.publisherId,
            //         time: res.timestamp,
            //         messageStatus:
            //             res.msgType === MSG_DELIVERED_STATUS_CARBON || res.msgType === MSG_DELIVERED_STATUS
            //                 ? MSG_DELIVERED_STATUS_ID
            //                 : MSG_SEEN_STATUS_ID
            //     }))
        // }
        */
    // When message is seen, then delete the seen messages from pending seen message list
    const pendingMessages =
      store?.getState().chatSeenPendingMsgData?.data || [];
    if (
      pendingMessages.length > 0 &&
      (res.msgType === MSG_SENT_SEEN_STATUS_CARBON ||
        (res.msgType === MSG_SEEN_ACKNOWLEDGE_STATUS &&
          res.type === MSG_SEEN_STATUS))
    ) {
      const { msgId: currentMsgId = null } = res;
      store.dispatch(deleteChatSeenPendingMsg(currentMsgId));
    }

    if (res.msgType === 'acknowledge' && res.type === 'acknowledge') {
      store.dispatch(updateRecentChatMessageStatus(res));
      store.dispatch(updateChatConversationHistory(res));
    }
  },
  presenceListener: res => {
    store.dispatch(updateUserPresence(res));
  },
  userProfileListener: res => {
    console.log('User Profile updated', JSON.stringify(res, null, 2));
    store.dispatch(updateProfileDetail(res));
    updateUserProfileDetails(res);
  },
  replyMessageListener: res => {
    console.log('replyMessageListener', res);
  },
  favouriteMessageListener: res => {
    console.log('favouriteMessageListener', res);
  },
  groupProfileListener: res => {
    console.log('groupProfileListener = (res) => { }', res);
  },
  groupMsgInfoListener: res => {
    console.log('groupMsgInfoListener = (res) => { }', res);
  },
  mediaUploadListener: res => {
    store.dispatch(updateMediaUploadData(res));
  },
  mediaDownloadListener: res => {
    store.dispatch(updateDownloadData(res));
  },
  blockUserListener: res => {
    console.log('blockUserListener = (res) => { }', res);
  },
  singleMessageDataListener: res => {
    store.dispatch(updateMsgByLastMsgId(res));
  },
  muteChatListener: res => {
    console.log('muteChatListener = (res) => { }', res);
  },
  archiveChatListener: res => {
    console.log('archiveChatListener = (res) => { }', res);
  },
  userDeletedListener: res => {
    console.log('userDeletedListener = (res) => { }', res);
  },
  adminBlockListener: res => {
    console.log('adminBlockListener = (res) => { }', res);
  },
  incomingCallListener: function (res) {
    console.log(JSON.stringify(res, null, 2), 'incomingCallListener');
    // web reference code ------------------------
    // strophe = true;
    remoteStream = [];
    localStream = null;
    let callMode = 'onetoone';
    if (res.toUsers.length === 1 && res.groupId === null) {
      res.from = res.toUsers[0];
      res.to = res.userJid;
      if (res.callType === 'audio') {
        localVideoMuted = true;
      }
    } else {
      callMode = 'onetomany';
      res.from = res.userJid;
      res.to = res.groupId ? res.groupId : res.userJid;
      res.userList = res.allUsers.join(',');
      if (res.callType === 'audio') {
        localVideoMuted = true;
      }
    }
    res.callMode = callMode;
    // -------- Storing the below data in store instead
    // encryptAndStoreInLocalStorage(
    //   'call_connection_status',
    //   JSON.stringify(res),
    // );

    let roomId = getCurrentCallRoomId();

    if (roomId === '' || roomId === null || roomId === undefined) {
      resetPinAndLargeVideoUser();
      // TODO: store the below details in callData reducer
      // encryptAndStoreInLocalStorage('roomName', res.roomId);
      // encryptAndStoreInLocalStorage('callType', res.callType);
      // encryptAndStoreInLocalStorage('callFrom', res.from);
      if (res.callType === 'audio') {
        localVideoMuted = true;
      }
      batch(() => {
        Store.dispatch(CallConnectionState(res));
        Store.dispatch(opneCallModal());
      });
      // TODO: update the below store data based on new reducer structure
      Store.dispatch(
        showConfrence({
          // showComponent: false,
          // showStreamingComponent: false,
          // showCalleComponent: true,
          screenName: INCOMING_CALL_SCREEN,
        }),
      );
      updatingUserStatusInRemoteStream(res.usersStatus);
      // TODO: show call local notification
      // browserNotify.sendCallNotification(res);
      startMissedCallNotificationTimer();
    } else {
      SDK.callEngaged();
    }

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
    startCallingTimer();
  },
  callStatusListener: function (res) {
    callStatus(res);
    // if (res.status === 'ended') {
    //   Store.dispatch(clearStreamData());
    //   Store.dispatch(clearStatusData());
    // }
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
      const { getState, dispatch } = Store;
      const showConfrenceData = getState().showConfrenceData;
      const { data } = showConfrenceData;
      const usersStatus = res.usersStatus;
      usersStatus.map(user => {
        const index = remoteStream.findIndex(
          item => item.fromJid === user.userJid,
        );
        if (index > -1) {
          remoteStream[index] = {
            ...remoteStream[index],
            status: user.status,
          };
          remoteVideoMuted[user.userJid] = user.videoMuted;
          remoteAudioMuted[user.userJid] = user.audioMuted;
        } else {
          let streamObject = {
            id: Date.now(),
            fromJid: user.userJid,
            status: user.status,
          };
          remoteStream.push(streamObject);
          remoteVideoMuted[user.userJid] = user.videoMuted;
          remoteAudioMuted[user.userJid] = user.audioMuted;
        }
      });
      // const roomName = getFromLocalStorageAndDecrypt('roomName');
      // if (roomName === '' || roomName == null || roomName == undefined) {
      //   const { roomId = '' } = SDK.getCallInfo();
      //   console.log('localStorage roomId :>> ', roomId);
      //   encryptAndStoreInLocalStorage('roomName', roomId);
      // }

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
      // encryptAndStoreInLocalStorage('callingComponent', false);
      const streamType = res.trackType;
      let mediaStream = null;
      if (res.track) {
        mediaStream = new MediaStream();
        mediaStream.addTrack(res.track);
      }
      const streamUniqueId = `stream${
        streamType.charAt(0).toUpperCase() + streamType.slice(1)
      }Id`;
      updatingUserStatusInRemoteStream(res.usersStatus);
      const userIndex = remoteStream.findIndex(
        item => item.fromJid === res.userJid,
      );
      if (userIndex > -1) {
        let { stream } = remoteStream[userIndex];
        stream = stream || {};
        stream[streamType] = mediaStream;
        stream['id'] = Date.now();
        stream[streamUniqueId] = Date.now();
        remoteStream[userIndex]['stream'] = stream;
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
        remoteStream.push(streamObject);
      }

      // When remoteStream user length is one, set that user as large video user
      if (remoteStream.length === 2) {
        // Store.dispatch(selectLargeVideoUser(res.userJid));
      } else {
        remoteStream.forEach(item => {
          // return Store.dispatch(selectLargeVideoUser(item.userJid));
        });
      }

      const { showConfrenceData, callConversionData } = Store.getState();
      const { data } = showConfrenceData;
      Store.dispatch(
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
          callConversionData &&
          callConversionData.status === CALL_CONVERSION_STATUS_REQ_WAITING
            ? {
                status: CALL_CONVERSION_STATUS_CANCEL,
              }
            : undefined;
        // Store.dispatch(callConversion(status));
        status && SDK.callConversion(CALL_CONVERSION_STATUS_CANCEL);
      }
    }
  },
  mediaErrorListener: res => {
    console.log(res, 'userProfileListener');
  },
  callSpeakingListener: res => {},
  callUsersUpdateListener: res => {
    console.log(res, 'userProfileListener');
  },
  helper: {
    getDisplayName: () => {},
    getImageUrl: () => {},
  },
  inviteUsersListener: res => {},
  callUserJoinedListener: function (res) {},
  callUserLeftListener: function (res) {},
  missedCallListener: res => {
    console.log(res, 'missedCallListener');
  },
  callSwitchListener: function (res) {},
  muteStatusListener: res => {},
  adminBlockListener: function (res) {},
};
