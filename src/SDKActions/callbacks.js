import {
  updateConversationMessage,
  updateRecentChatMessage,
} from '../components/chat/common/createMessage';
import { REGISTERSCREEN } from '../constant';
import { setXmppStatus } from '../redux/Actions/connectionAction';
import { updateChatConversationHistory } from '../redux/Actions/ConversationAction';
import { navigate } from '../redux/Actions/NavigationAction';
import { updateProfileDetail } from '../redux/Actions/ProfileAction';
import { updateRecentChatMessageStatus } from '../redux/Actions/RecentChatAction';
import store from '../redux/store';
import { updateUserPresence } from '../redux/Actions/userAction';
import * as RootNav from '../Navigation/rootNavigation';
import {
  MSG_SEEN_ACKNOWLEDGE_STATUS,
  MSG_SEEN_STATUS,
  MSG_SENT_SEEN_STATUS_CARBON,
} from '../Helper/Chat/Constant';
import { deleteChatSeenPendingMsg } from '../redux/Actions/chatSeenPendingMsgAction';
import { updateMediaUploadData } from '../redux/Actions/MediaUploadAction';
import nextFrame from 'next-frame';
import { updateDownloadData } from '../redux/Actions/MediaDownloadAction';

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
      RootNav.navigate(REGISTERSCREEN);
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
    console.log('userProfileListener', res);
    store.dispatch(updateProfileDetail(res));
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
    console.log('singleMessageDataListener = (res) => { }', res);
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
};
