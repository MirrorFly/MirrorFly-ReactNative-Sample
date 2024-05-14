import React from 'react';
import ReplyDeleted from './ReplyDeleted';
import ReplyText from './ReplyText';
import ReplyImage from './ReplyImage';
import ReplyVideo from './ReplyVideo';
import ReplyAudio from './ReplyAudio';
import ReplyDocument from './ReplyDocument';
import ReplyContact from './ReplyContact';
import ReplyLocation from './ReplyLocation';
import { StyleSheet, View } from 'react-native';
import { useChatMessage } from '../hooks/useChatMessage';

function ReplyContainer({ replyMessage, handleCloseReplyContainer }) {
   const { msgId } = replyMessage;
   const message = useChatMessage(msgId);
   const renderReplyMessageTemplateAboveInput = () => {
      const {
         msgBody,
         deleteStatus = 0,
         recallStatus = 0,
         msgBody: { message_type },
      } = message;
      switch (true) {
         case Object.keys(msgBody).length === 0 || deleteStatus !== 0 || recallStatus !== 0:
            return <ReplyDeleted replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'text':
            return <ReplyText replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'image':
            return <ReplyImage replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'video':
            return <ReplyVideo replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'audio':
            return <ReplyAudio replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'file':
            return <ReplyDocument replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'contact':
            return <ReplyContact replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'location':
            return <ReplyLocation replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         default:
            return null;
      }
   };
   return (
      <View style={styles.replyingMessageContainer}>
         <View style={styles.replyingMessageContainer}>{renderReplyMessageTemplateAboveInput()}</View>
      </View>
   );
}

const styles = StyleSheet.create({
   replyingMessageContainer: {
      paddingHorizontal: 4,
      paddingVertical: 8,
      backgroundColor: '#E2E8F9',
   },
   replyingMessageWrapper: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      justifyContent: 'center',
      backgroundColor: '#0000001A',
   },
});

export default ReplyContainer;
