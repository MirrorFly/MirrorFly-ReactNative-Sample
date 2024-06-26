import { emptyMessage, updateRecall } from '../../components/Recall';
import { getMsgStatusInOrder } from '../../Helper/Chat/ChatHelper';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import {
   ADD_RECENT_CHAT,
   DELETE_SINGLE_CHAT,
   RECENT_RECALL_UPDATE,
   RECENT_REMOVE_MESSAGE_UPDATE,
   RESET_STORE,
   RESET_UNREAD_COUNT,
   UPDATE_MSG_BY_LAST_MSGID,
   UPDATE_RECENT_CHAT,
   UPDATE_RECENT_CHAT_MESSAGE_STATUS,
   UPDATE_ROSTER_LAST_MESSAGE,
} from '../Actions/Constants';
import { StateToObj, getObjectDeepClone } from '../reduxHelper';

const initialState = {
   id: Date.now(),
   data: [],
};

const initialStateClone = getObjectDeepClone(initialState);

const updateRecentChatFunc = (filterBy, newMessage, _state) => {
   const { data: recentChatArray = [] } = _state;
   const checkalreadyExist = recentChatArray.find(message => message.fromUserId === filterBy);
   if (!checkalreadyExist) {
      newMessage.archiveStatus = 0;
      return [...recentChatArray, newMessage];
   }
   let value = recentChatArray.map(recentItem => {
      if (recentItem.fromUserId === filterBy) {
         return {
            ...recentItem,
            ...newMessage,
            deleteStatus: 0,
         };
      }
      return recentItem;
   });
   return value;
};

const getNames = (data = []) => {
   return data.map(ele => ele.fromUserId);
};

const updateRecentChatMessageStatusFunc = (data, stateData) => {
   return stateData.map(element => {
      if (element.fromUserId === data.fromUserId && element.msgId === data.msgId) {
         element.msgStatus = getMsgStatusInOrder(element.msgStatus, data.msgStatus);
      }
      return element;
   });
};

const clearMessageInRecentChat = (data, id) => {
   const recentData = data;
   return recentData.map(element => {
      if (element.fromUserId === id) {
         return {
            ...element,
            msgBody: {},
            msgType: '',
            createdAt: '',
            msgStatus: 4,
         };
      }
      return element;
   });
};

const updateMsgByLastMsgId = (newMessage, recentChatList = []) => {
   const msgIndex = recentChatList.findIndex(msg => msg.lastMsgId === newMessage.msgId);
   if (msgIndex > -1) {
      recentChatList[msgIndex] = { ...recentChatList[msgIndex], ...newMessage };
      recentChatList[msgIndex].msgType = newMessage?.msgBody?.message_type || newMessage.msgType;
   }
   return recentChatList.sort((a, b) => (b.msgId > a.msgId ? 1 : -1));
};

const deletedChatList = (deleteData, currentArray) => {
   const { fromUserId } = deleteData;
   return currentArray.filter((element, id) => element.fromUserId !== fromUserId);
};

const updateUnradCountForChat = (data, chatId) => {
   chatId = getUserIdFromJid(chatId);
   return data.map(chat => {
      if (chat?.fromUserId === chatId) {
         chat.isUnread = 0;
         chat.unreadCount = 0;
      }
      return chat;
   });
};

const recentChatReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case UPDATE_RECENT_CHAT:
         const { filterBy, ...rest } = action.payload;
         const updatedRecentChatData = updateRecentChatFunc(filterBy, rest, state);
         return {
            ...state,
            id: Date.now(),
            data: updatedRecentChatData,
            rosterData: {
               recentChatNames: getNames(updatedRecentChatData),
            },
         };
      case ADD_RECENT_CHAT:
         return {
            id: Date.now(),
            data: action.payload,
            rosterData: {
               recentChatNames: getNames(action.payload),
            },
         };
      case UPDATE_RECENT_CHAT_MESSAGE_STATUS:
         return {
            ...state,
            id: Date.now(),
            data: updateRecentChatMessageStatusFunc(action.payload, StateToObj(state.data)),
         };
      case UPDATE_ROSTER_LAST_MESSAGE:
         return {
            ...state,
            id: Date.now(),
            data: clearMessageInRecentChat(state.data, action.payload),
         };
      case DELETE_SINGLE_CHAT:
         const deletedRecentChatData = deletedChatList(action.payload, StateToObj(state.data));
         return {
            ...state,
            id: Date.now(),
            data: deletedRecentChatData,
            rosterData: {
               recentChatNames: getNames(deletedRecentChatData),
            },
         };
      case RECENT_REMOVE_MESSAGE_UPDATE:
         return {
            ...state,
            id: Date.now(),
            data: emptyMessage(action.payload, StateToObj(state.data)),
         };
      case UPDATE_MSG_BY_LAST_MSGID:
         return {
            ...state,
            id: Date.now(),
            data: updateMsgByLastMsgId(action.payload, StateToObj(state.data)),
         };
      case RECENT_RECALL_UPDATE:
         return {
            ...state,
            id: Date.now(),
            data: updateRecall(action.payload, StateToObj(state.data)),
         };
      case RESET_UNREAD_COUNT:
         return {
            ...state,
            id: Date.now(),
            data: updateUnradCountForChat(StateToObj(state.data), action.payload),
         };
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default recentChatReducer;
