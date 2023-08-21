import { getMsgStatusInOrder } from '../../Helper/Chat/ChatHelper';
import {
  ADD_RECENT_CHAT,
  DELETE_SINGLE_CHAT,
  RESET_STORE,
  UPDATE_RECENT_CHAT,
  UPDATE_RECENT_CHAT_MESSAGE_STATUS,
  UPDATE_ROSTER_LAST_MESSAGE,
} from '../Actions/Constants';
import { StateToObj } from '../reduxHelper';

const initialState = {
  id: Date.now(),
  data: [],
};

const updateRecentChatFunc = (filterBy, newMessage, _state) => {
  const { data: recentChatArray = [] } = _state;
  const checkalreadyExist = recentChatArray.find(
    message => message.fromUserId === filterBy,
  );
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
    if (
      element.fromUserId === data.fromUserId &&
      element.msgId === data.msgId
    ) {
      element.msgStatus = getMsgStatusInOrder(
        element.msgStatus,
        data.msgStatus,
      );
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

const deletedChatList = (deleteData, currentArray) => {
  const { fromUserId } = deleteData;
  return currentArray.filter(
    (element, id) => element.fromUserId !== fromUserId,
  );
};

const recentChatReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_RECENT_CHAT:
      const { filterBy, ...rest } = action.payload;
      return {
        ...state,
        id: Date.now(),
        data: updateRecentChatFunc(filterBy, rest, state),
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
        data: updateRecentChatMessageStatusFunc(
          action.payload,
          StateToObj(state).data,
        ),
      };
    case UPDATE_ROSTER_LAST_MESSAGE:
      return {
        ...state,
        id: Date.now(),
        data: clearMessageInRecentChat(state.data, action.payload),
      };
    case DELETE_SINGLE_CHAT:
      return {
        ...state,
        id: Date.now(),
        data: deletedChatList(action.payload, StateToObj(state).data),
      };
    case RESET_STORE:
      return initialState;
    default:
      return state;
  }
};

export default recentChatReducer;
