import {
  ADD_CHAT_SEEN_PENDING_MSG,
  DELETE_CHAT_SEEN_PENDING_MSG,
  RESET_STORE,
} from '../Actions/Constants';
import { StateToObj, getObjectDeepClone } from '../reduxHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  id: Date.now(),
  data: [],
};

const initialStateClone = getObjectDeepClone(initialState);

const deleteData = (data, payload) => {
  const msgIndex = data.findIndex(msg => msg.msgId === payload);
  if (msgIndex > -1) {
    data.splice(msgIndex, 1);
  }
  return data;
};

const chatSeenPendingMsgReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case ADD_CHAT_SEEN_PENDING_MSG:
      const addedSeen = {
        ...state,
        id: Date.now(),
        data: [...StateToObj(state.data), action.payload],
      };
      AsyncStorage.setItem('pendingSeenStatus', JSON.stringify(addedSeen));
      return addedSeen;
    case DELETE_CHAT_SEEN_PENDING_MSG:
      const deleteSeen = {
        ...state,
        id: Date.now(),
        data: deleteData(StateToObj(state.data), action.payload),
      };
      AsyncStorage.setItem('pendingSeenStatus', JSON.stringify(deleteSeen));
      return deleteSeen;
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default chatSeenPendingMsgReducer;
