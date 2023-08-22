export const emptyMessage = (newMessage, messageArray = []) => {
  const { msgIds = [] } = newMessage;
  return messageArray.map(messageObject => {
    if (msgIds.indexOf(messageObject.msgId) !== -1) {
      return {
        ...messageObject,
        MessageType: 'text',
        deleteStatus: 0,
        createdAt: '',
        msgbody: {
          message_type: 'text',
          message: '',
        },
        msgType: newMessage.msgType,
        lastMsgId: newMessage.lastMsgId,
      };
    }
    return messageObject;
  });
};
