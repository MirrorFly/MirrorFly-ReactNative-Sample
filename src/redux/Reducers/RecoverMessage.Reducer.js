import { DELETE_RECOVER_MESSAGE, RECOVER_MESSAGE } from '../Actions/Constants';

const initialState = {
   id: Date.now(),
   data: [],
};

const addRecoverMessage = (state, data) => {
   const { toUserJid } = data;
   let messages = {
      ...state,
      [toUserJid]: data,
   };
   return messages;
};

const deleteRecoverMessage = (state, toUserJid) => {
   const currentChatData = { ...state };
   delete currentChatData[toUserJid];
   return currentChatData;
};

const recoverMessageReducer = (state = initialState, action) => {
   switch (action.type) {
      case RECOVER_MESSAGE:
         return {
            ...state,
            id: Date.now(),
            data: addRecoverMessage(state.data, action.payload),
         };
      case DELETE_RECOVER_MESSAGE:
         return {
            ...state,
            id: Date.now(),
            data: deleteRecoverMessage(state.data, action.payload),
         };
      default:
         return state;
   }
};

export default recoverMessageReducer;
