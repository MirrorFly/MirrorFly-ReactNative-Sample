export const emptyMessage = (newMessage, messageArray = []) => {
   const { msgIds = [] } = newMessage;
   return messageArray.map(messageObject => {
      if (msgIds.indexOf(messageObject.msgId) !== -1) {
         return {
            ...messageObject,
            MessageType: 'text',
            deleteStatus: 0,
            createdAt: '',
            msgBody: {},
            msgType: newMessage.msgType,
            lastMsgId: newMessage.lastMsgId,
         };
      }
      return messageObject;
   });
};

export const updateRecall = (newMessage, messageArray = []) => {
   return messageArray.map(messageObject => {
      if (newMessage.msgId.includes(messageObject.msgId)) {
         messageObject.recallStatus = 1;
      }
      return messageObject;
   });
};
