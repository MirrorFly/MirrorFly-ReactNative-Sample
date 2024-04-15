const {
   ADD_CHAT_CONVERSATION_MESSAGE,
   UPDATE_CHAT_CONVERSATION_MESSAGE,
   RESET_STORE,
   TOGGLE_SELECT_CHAT_CONVERSATION_MESSAGE,
   RESET_SELECT_CHAT_CONVERSATION_MESSAGE,
} = require('../Actions/Constants');
const { getObjectDeepClone } = require('../reduxHelper');

const initialState = {
   id: Date.now(),
};

const initialStateClone = getObjectDeepClone(initialState);

const chatMessageReducer = (state = initialStateClone, action) => {
   switch (action.type) {
      case ADD_CHAT_CONVERSATION_MESSAGE:
         const payload = action.payload;
         // Constructing the new state object with msgId as keys and empty objects as values
         const newState = { ...state }; // Create a shallow copy of the current state
         payload.forEach(message => {
            newState[message.msgId] = message; // Add each msgId as a key with an empty object as its value
         });
         return {
            ...newState,
            id: Date.now(),
         };
      case UPDATE_CHAT_CONVERSATION_MESSAGE:
         console.log('action.payload ==>', JSON.stringify(action.payload, null, 2));
         const obj = action.payload;
         const { msgId, msgStatus } = obj;

         const updatedMessage = {
            ...state[msgId], // Shallow copy of the existing message object
            msgStatus: msgStatus, // Update only the properties specified in updatedData
         };
         return {
            ...state, // Update the message object corresponding to msgId
            [msgId]: updatedMessage,
         };
      case TOGGLE_SELECT_CHAT_CONVERSATION_MESSAGE:
         const _msgId = action.payload;
         const _updatedMessage = {
            ...state[_msgId],
            isSelected: state[_msgId]?.isSelected ? 0 : 1, // Toggle isSelected property
         };
         return {
            ...state,
            [_msgId]: _updatedMessage,
         };
      case RESET_SELECT_CHAT_CONVERSATION_MESSAGE:
         const resetState = { ...state };
         Object.keys(resetState).forEach(msgId => {
            resetState[msgId].isSelected = 0;
         });
         return resetState;
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default chatMessageReducer;
