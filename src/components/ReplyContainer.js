import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { setReplyMessage } from '../redux/draftSlice';
import ReplyAudio from './ReplyAudio';
import ReplyContact from './ReplyContact';
import ReplyDeleted from './ReplyDeleted';
import ReplyDocument from './ReplyDocument';
import ReplyImage from './ReplyImage';
import ReplyLocation from './ReplyLocation';
import ReplyText from './ReplyText';
import ReplyVideo from './ReplyVideo';

function ReplyContainer({ chatUser, replyMessage }) {
   const stringSet = getStringSet();
   const userId = getUserIdFromJid(chatUser);
   const dispatch = useDispatch();
   const { msgBody = {}, deleteStatus = 0, recallStatus = 0, msgBody: { message_type = '' } = {} } = replyMessage;
   const handleCloseReplyContainer = () => {
      dispatch(setReplyMessage({ userId, message: {} }));
   };

   const renderReplyMessageTemplateAboveInput = () => {
      switch (true) {
         case Object.keys(msgBody).length === 0 || deleteStatus !== 0 || recallStatus !== 0:
            return <ReplyDeleted replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'text':
            return <ReplyText replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'image':
            return (
               <ReplyImage
                  replyMsgItems={replyMessage}
                  handleRemove={handleCloseReplyContainer}
                  stringSet={stringSet}
               />
            );
         case message_type === 'video':
            return (
               <ReplyVideo
                  replyMsgItems={replyMessage}
                  handleRemove={handleCloseReplyContainer}
                  stringSet={stringSet}
               />
            );
         case message_type === 'audio':
            return (
               <ReplyAudio
                  replyMsgItems={replyMessage}
                  handleRemove={handleCloseReplyContainer}
                  stringSet={stringSet}
               />
            );
         case message_type === 'file':
            return <ReplyDocument replyMsgItems={replyMessage} handleRemove={handleCloseReplyContainer} />;
         case message_type === 'contact':
            return (
               <ReplyContact
                  replyMsgItems={replyMessage}
                  handleRemove={handleCloseReplyContainer}
                  stringSet={stringSet}
               />
            );
         case message_type === 'location':
            return (
               <ReplyLocation
                  replyMsgItems={replyMessage}
                  handleRemove={handleCloseReplyContainer}
                  stringSet={stringSet}
               />
            );
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
