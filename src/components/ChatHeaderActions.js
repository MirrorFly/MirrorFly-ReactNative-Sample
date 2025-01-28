import React from 'react';
import { Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import IconButton from '../common/IconButton';
import { ReplyIcon } from '../common/Icons';
import { resetMessageSelections } from '../redux/chatMessageDataSlice';
import { setReplyMessage } from '../redux/draftSlice';
import { useBlockedStatus, useSelectedChatMessages } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { chatInputRef } from './ChatInput';

export function RenderReplyIcon({ userId }) {
   const dispatch = useDispatch();
   const filtered = useSelectedChatMessages(userId) || [];
   const blockedStaus = useBlockedStatus(userId);

   const _handleReplyMessage = () => {
      Keyboard.dismiss();
      dispatch(resetMessageSelections(userId));

      dispatch(setReplyMessage({ userId, message: filtered[0] }));
      setTimeout(() => {
         chatInputRef?.current?.focus();
      }, 10);
   };

   if (blockedStaus) {
      return null;
   }

   return (
      <IconButton style={[commonStyles.padding_10_15]} onPress={_handleReplyMessage}>
         <ReplyIcon />
      </IconButton>
   );
}
