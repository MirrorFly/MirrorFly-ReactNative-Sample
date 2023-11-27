import {
  formatUserIdToJid,
  getChatHistoryMessagesData,
  isActiveConversationUserOrGroup,
  isGroupChat,
  isLocalUser,
  isSingleChat,
} from '../../../Helper/Chat/ChatHelper';
import {
  GROUP_UPDATE_ACTIONS,
  MSG_RECEIVE_STATUS,
  MSG_RECEIVE_STATUS_CARBON,
} from '../../../Helper/Chat/Constant';
import {
  getMessageObjReceiver,
  getUserIdFromJid,
} from '../../../Helper/Chat/Utility';
import SDK from '../../../SDK/SDK';
import { changeTimeFormat } from '../../../common/TimeStamp';
import { addChatConversationHistory } from '../../../redux/Actions/ConversationAction';
import { updateRecentChat } from '../../../redux/Actions/RecentChatAction';
import { addchatSeenPendingMsg } from '../../../redux/Actions/chatSeenPendingMsgAction';
import store from '../../../redux/store';

export const updateRecentChatMessage = (messgeObject, stateObject) => {
  const { recentChatData, navigation } = stateObject;
  const { rosterData: { recentChatNames } = {}, data: recentChatArray = [] } =
    recentChatData;
  const { fromUserJid: activeChatJid } = navigation || {};
  if (!recentChatNames) {
    return;
  }
  const {
    msgType,
    fromUserId,
    toUserId,
    msgId,
    timestamp,
    chatType,
    msgBody,
    publisherId,
    profileDetails,
  } = messgeObject;

  const newChatTo = msgType === 'carbonSentMessage' ? toUserId : fromUserId;
  const newChatFrom = chatType === 'groupchat' ? publisherId : fromUserId;
  const updateTime = changeTimeFormat(timestamp);
  const leftGroup = !msgType && msgType === 'receiveMessage' && msgBody === '3';
  const x = new Date();
  let UTCseconds = x.getTime() + x.getTimezoneOffset() * 60 * 1000;

  // Temp - Reorder Issue Fix
  if (Number(UTCseconds).toString().length > 13) {
    UTCseconds = UTCseconds / 1000;
  }

  const isActiveChatMsg = getUserIdFromJid(activeChatJid) === newChatTo;
  /**
   * update the chat message if message alredy exist in recent chat
   */
  if (recentChatNames.indexOf(newChatTo) !== -1) {
    const constructNewMessage = {
      ...messgeObject,
      MessageType: msgType ? msgType : msgBody.message_type || '',
      msgType: msgBody.message_type ? msgBody.message_type : msgType,
      publisher: newChatFrom,
      publisherId: newChatFrom,
      leftGroup: leftGroup,
      filterBy: newChatTo,
      fromUserId: newChatTo,
      chatType: chatType,
      createdAt: updateTime,
      timestamp: parseInt(UTCseconds),
    };
    // if the message received chat is not opened, then incrementing the unread count
    if (!isActiveChatMsg) {
      const existingUnReadCount =
        recentChatArray.find(i => i.fromUserId === newChatTo)?.unreadCount || 0;
      constructNewMessage.unreadCount = existingUnReadCount + 1;
      constructNewMessage.isUnread = 1;
    }
    store.dispatch(updateRecentChat(constructNewMessage));
  } else {
    /**
     * New chat that is not alreay exist in recent chat
     */
    const newMessage = {
      archiveStatus: 0,
      chatType: chatType,
      msgBody: msgBody,
      msgId: msgId,
      msgStatus: 0,
      muteStatus: 0,
      msgType: msgBody.message_type ? msgBody.message_type : msgType,
      deleteStatus: 0,
      unreadCount: 1,
      isUnread: 1,
      fromUserId: newChatTo,
      timestamp: parseInt(UTCseconds),
      publisher: newChatFrom,
      publisherId: newChatFrom,
      toUserId: toUserId,
      createdAt: updateTime,
      filterBy: newChatTo,
      profileDetails: {
        ...profileDetails,
      },
    };
    store.dispatch(updateRecentChat(newMessage));
  }
};

/**
 * Update all delivered message seen status
 */
export const updateMsgSeenStatus = async () => {
  const state = store.getState();
  if (state?.navigation?.fromUserJid) {
    const pendingMessages = state?.chatSeenPendingMsgData?.data || [];
    pendingMessages.forEach(message => {
      const fromUserId = isGroupChat(message.chatType)
        ? message.publisherId
        : message.fromUserId;
      const groupId = isGroupChat(message.chatType) ? message.fromUserId : '';
      if (isActiveConversationUserOrGroup(message.fromUserId)) {
        if (
          !(GROUP_UPDATE_ACTIONS.indexOf(message?.profileUpdatedStatus) >= 0) //NOSONAR Changed from -1 to 0 due to sonar issue
        ) {
          SDK.sendSeenStatus(
            formatUserIdToJid(fromUserId),
            message.msgId,
            groupId,
          );
        }
      }
    });
  }
};

export const updateConversationMessage = (messgeObject, currentState) => {
  const newChatTo =
    messgeObject.msgType === 'carbonSentMessage'
      ? messgeObject.toUserId
      : messgeObject.fromUserId;
  const singleChat = isSingleChat(messgeObject.chatType);
  if (isActiveConversationUserOrGroup(newChatTo)) {
    const publisherId = singleChat ? newChatTo : messgeObject.publisherId;
    if (
      [MSG_RECEIVE_STATUS, MSG_RECEIVE_STATUS_CARBON].indexOf(
        messgeObject.msgType,
      ) > -1
    ) {
      const groupId = singleChat ? '' : newChatTo;
      SDK.sendSeenStatus(
        formatUserIdToJid(publisherId),
        messgeObject.msgId,
        groupId,
      );
    }
  } else if (!isLocalUser(messgeObject.publisherId)) {
    // If the Chat is Already Opened but if it is Not Currently Active, Store the Messages for Sending Seen Status
    store.dispatch(addchatSeenPendingMsg(messgeObject));
  }
  const conversationHistory = getChatHistoryMessagesData();
  if (Object.keys(conversationHistory).includes(newChatTo)) {
    const conversationChatObj = getMessageObjReceiver(
      messgeObject,
      messgeObject.fromUserId,
    );
    const dispatchData = {
      data: [conversationChatObj],
      ...{ userJid: formatUserIdToJid(newChatTo) },
    };
    store.dispatch(addChatConversationHistory(dispatchData));
  }
};
