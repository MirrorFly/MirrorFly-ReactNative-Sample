import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  "id": uuidv4(),
  "data": []
}

const getNames = (data = []) => {
  return data.map((ele) => (
    ele.fromUserId
  ))
}

const updateRecentChatFunc = (filterBy, newMessage, _state) => {
  const {   data : recentChatArray = []  } = _state
  const checkalreadyExist = recentChatArray.find((message) => message.fromUserId === filterBy);
  if (!checkalreadyExist) {
    newMessage.archiveStatus = 0;
    return [...recentChatArray, newMessage];
  }
  let value =  recentChatArray.map((recentItem) => {
    if (recentItem.fromUserId === filterBy) {
      return {
        ...recentItem,
        ...newMessage,
        deleteStatus: 0
      };
    }
    return recentItem;
  });
  return value
};

const recentChatData = createSlice({
  name: 'recentChatData',
  initialState,
  reducers: {
    addRecentChat: (_state, payload) => {
      return {
        "id": uuidv4(),
        "data": payload.payload,
        "rosterData": {
          "recentChatNames": getNames(payload.payload)
        }
      }
    }, updateRecentChat: (_state, payload) => {
      const { filterBy, ...rest } = payload.payload
      return {
        ..._state,
        "id": uuidv4(),
        "data": updateRecentChatFunc(filterBy, rest,_state)
      }
    }
  }
});

export default recentChatData.reducer
export const addRecentChat = recentChatData.actions.addRecentChat
export const updateRecentChat = recentChatData.actions.updateRecentChat
