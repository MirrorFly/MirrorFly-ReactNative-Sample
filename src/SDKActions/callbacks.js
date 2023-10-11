import nextFrame from 'next-frame';
import {
  MSG_CLEAR_CHAT,
  MSG_CLEAR_CHAT_CARBON,
  MSG_DELETE_CHAT,
  MSG_DELETE_CHAT_CARBON,
  MSG_DELETE_STATUS,
  MSG_DELETE_STATUS_CARBON,
  MSG_SEEN_ACKNOWLEDGE_STATUS,
  MSG_SEEN_STATUS,
  MSG_SENT_SEEN_STATUS_CARBON,
} from '../Helper/Chat/Constant';
import * as RootNav from '../Navigation/rootNavigation';
import {
  updateConversationMessage,
  updateRecentChatMessage,
} from '../components/chat/common/createMessage';
import { REGISTERSCREEN } from '../constant';
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
import { deleteChatSeenPendingMsg } from '../redux/Actions/chatSeenPendingMsgAction';
import { setXmppStatus } from '../redux/Actions/connectionAction';
import { updateUserPresence } from '../redux/Actions/userAction';
import store from '../redux/store';
import { updateUserProfileDetails } from '../Helper/index';
import SDK from '../SDK/SDK';
import { pushNotify, updateNotification } from '../Service/remoteNotifyHandle';
import {
  getNotifyMessage,
  getNotifyNickName,
} from '../components/RNCamera/Helper';
import Store from '../redux/store';
import { clearStreamData, setStreamData } from '../redux/Actions/streamAction';
import { MediaStream } from 'react-native-webrtc';
import { clearStatusData, setStatusData } from '../redux/Actions/statusAction';
let localStream = null;
let remoteStream = [];

export const callBacks = {
  connectionListener: response => {
    console.log('connectionListener', response);
    store.dispatch(setXmppStatus(response.status));
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
    }
    if (
      res.msgType === MSG_CLEAR_CHAT ||
      res.msgType === MSG_CLEAR_CHAT_CARBON
    ) {
      store.dispatch(clearLastMessageinRecentChat(res.fromUserId));
      store.dispatch(ClearChatHistoryAction(res.fromUserId));
    }
    if (
      res.msgType === MSG_DELETE_CHAT ||
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
    console.log('presenceListener', res);
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
    console.log(res, 'incomingCallListener');
    Store.dispatch(setStatusData(res));
  },
  callStatusListener: function (res) {
    if (res.status === 'ended') {
      Store.dispatch(clearStreamData());
      Store.dispatch(clearStatusData());
    }
  },
  userTrackListener: (res, check) => {
    if (res.localUser) {
      let mediaStream = null;
      localStream = localStream || {};
      if (res.track) {
        mediaStream = new MediaStream();
        mediaStream.addTrack(res.track);
      }
      localStream[res.trackType] = mediaStream;
      const streamData = Store.getState().streamData;
      const { data } = streamData;
      Store.dispatch(
        setStreamData({
          ...(data || {}),
          localStream: localStream,
          remoteStream,
          status: 'LOCALSTREAM',
        }),
      );
    } else {
      let mediaStream = null;
      if (res.track) {
        mediaStream = new MediaStream();
        mediaStream.addTrack(res.track);
      }
      const streamType = res.trackType;
      const userIndex = remoteStream.findIndex(
        item => item.fromJid === res.userJid,
      );
      if (userIndex > -1) {
        let { stream } = remoteStream[userIndex];
        stream = stream || {};
        stream[streamType] = mediaStream;
        remoteStream[userIndex]['stream'] = stream;
      } else {
        let streamObject = {
          fromJid: res.userJid,
          stream: {
            [streamType]: mediaStream,
          },
        };
        remoteStream.push(streamObject);
      }
      const streamData = Store.getState().streamData;
      const { data } = streamData;
      Store.dispatch(
        setStreamData({
          ...(data || {}),
          localStream,
          remoteStream: remoteStream,
          status: 'RemoteStream',
        }),
      );
    }
  },
  mediaErrorListener: res => {
    console.log(res, 'userProfileListener');
  },
  callSpeakingListener: res => { },
  callUsersUpdateListener: res => {
    console.log(res, 'userProfileListener');
  },
  helper: {
    getDisplayName: () => { },
    getImageUrl: () => { },
  },
  inviteUsersListener: res => { },
  callUserJoinedListener: function (res) { },
  callUserLeftListener: function (res) { },
  missedCallListener: res => { },
  callSwitchListener: function (res) { },
  muteStatusListener: res => { },
  adminBlockListener: function (res) { },
};
