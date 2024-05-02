const {
   ADD_CHAT_CONVERSATION_MESSAGE,
   UPDATE_CHAT_CONVERSATION_MESSAGE,
   RESET_STORE,
   TOGGLE_SELECT_CHAT_CONVERSATION_MESSAGE,
   RESET_SELECT_CHAT_CONVERSATION_MESSAGE,
   CANCEL_MEDIA_UPLOAD,
   RETRY_MEDIA_UPLOAD,
   CANCEL_MEDIA_DOWNLOAD,
   UPDATE_UPLOAD_STATUS,
   DELETE_MESSAGE_FOR_ME,
   DELETE_MESSAGE_FOR_EVERYONE,
   UPDATE_SENT_SEEN_STATUS,
   MESSAGE_HIGHLIGHT,
   UPDATE_MESSAGE_BODY_OBJECT,
} = require('../Actions/Constants');
const { getObjectDeepClone, StateToObj } = require('../reduxHelper');

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
      case UPDATE_MESSAGE_BODY_OBJECT:
         const { messageId, updatedData } = action.payload;
         return {
            ...state,
            [messageId]: {
               ...state[messageId],
               msgBody: {
                  ...state[messageId].msgBody,
                  media: {
                     ...state[messageId].msgBody.media, // Keep the existing media keys intact
                     ...updatedData.msgBody.media, // Merge the updated media object into the existing media
                  },
               },
            },
         };

      case UPDATE_SENT_SEEN_STATUS:
         const { msgId: seenMsgId } = action.payload;
         // Constructing the new state object with msgId as keys and empty objects as values
         const seenState = { ...state }; // Create a shallow copy of the current state
         seenState[seenMsgId] = { ...seenState[seenMsgId], msgStatus: 2 }; // Add each msgId as a key with an empty object as its value
         return {
            ...seenState,
            id: Date.now(),
         };
      case UPDATE_CHAT_CONVERSATION_MESSAGE:
         const obj = action.payload;
         const { msgId, msgStatus, msgType = '', type = '' } = obj;

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
            id: Date.now(),
            [_msgId]: _updatedMessage,
         };
      case RESET_SELECT_CHAT_CONVERSATION_MESSAGE:
         const resetState = { ...state };
         Object.keys(resetState).forEach(__msgId => {
            resetState[__msgId].isSelected = 0;
         });
         return resetState;
      case MESSAGE_HIGHLIGHT:
         const { msgId: highlightMessageId, shouldHighlight } = action.payload;
         // Create a new state object to avoid mutating the original state
         const highlightMessageNewState = { ...state };
         // Check if the highlightMessageId exists in the state and update the corresponding message object
         if (highlightMessageNewState[highlightMessageId]) {
            highlightMessageNewState[highlightMessageId] = {
               ...highlightMessageNewState[highlightMessageId],
               shouldHighlight,
            };
         }
         // Return the updated state
         return highlightMessageNewState;
      case CANCEL_MEDIA_UPLOAD:
      case RETRY_MEDIA_UPLOAD:
      case CANCEL_MEDIA_DOWNLOAD:
         const { msgId: mediaStatusMsgId, downloadStatus, uploadStatus: mediaUploadStatus } = action.payload;
         const mediaStatusObj = {
            ...state[mediaStatusMsgId],
            msgBody: {
               ...state[mediaStatusMsgId].msgBody,
               media: {
                  ...state[mediaStatusMsgId].msgBody.media,
                  is_downloaded: downloadStatus,
                  is_uploading: mediaUploadStatus,
               },
            },
         };
         return {
            ...state,
            [mediaStatusMsgId]: mediaStatusObj,
            id: Date.now(),
         };
      case UPDATE_UPLOAD_STATUS:
         const { msgId: updateMsgId, is_downloaded, uploadStatus, local_path } = action.payload;
         return {
            ...state,
            [updateMsgId]: {
               ...state[updateMsgId],
               msgBody: {
                  ...state[updateMsgId].msgBody,
                  media: {
                     ...state[updateMsgId].msgBody.media,
                     is_downloaded,
                     is_uploading: uploadStatus,
                     local_path,
                  },
               },
            },
            id: Date.now(),
         };
      case DELETE_MESSAGE_FOR_ME:
      case DELETE_MESSAGE_FOR_EVERYONE:
         const updatedState = { ...state };
         if (action.type === DELETE_MESSAGE_FOR_ME) {
            const { msgIds: deleteMsgIds } = action.payload;
            deleteMsgIds.forEach(lmsgId => {
               if (updatedState[lmsgId]) {
                  updatedState[lmsgId].deleteStatus = 1;
                  Object.keys(updatedState).forEach(key => {
                     if (
                        key !== 'id' &&
                        updatedState[key]?.msgBody?.replyTo === lmsgId &&
                        !updatedState[key]?.msgBody?.replyToMsg
                     ) {
                        updatedState[key].msgBody.replyToMsg = 1;
                     }
                  });
               }
            });
         } else if (action.type === DELETE_MESSAGE_FOR_EVERYONE) {
            const messageIds = action.payload.msgId.split(',');
            messageIds.forEach(lmsgId => {
               if (updatedState[lmsgId]) {
                  updatedState[lmsgId].recallStatus = 1;
                  Object.keys(updatedState).forEach(key => {
                     if (
                        key !== 'id' &&
                        updatedState[key]?.msgBody?.replyTo === lmsgId &&
                        !updatedState[key]?.msgBody?.replyToMsg
                     ) {
                        updatedState[key].msgBody.replyToMsg = 1;
                     }
                  });
               }
            });
         }
         return {
            ...updatedState,
            id: Date.now(),
         };
      case RESET_STORE:
         return getObjectDeepClone(initialState);
      default:
         return state;
   }
};

export default chatMessageReducer;
