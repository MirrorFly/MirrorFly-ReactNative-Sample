import { createRef } from 'react';
import { showToast } from '../Helper';
import { getChatMessage } from './useChatMessage';
import Store from '../redux/store';
import { highlightMessage } from '../redux/Actions/ChatMessageAction';

export const conversationFlatListRef = createRef(),
   conversationFlatListScrollPositionRef = createRef();

conversationFlatListRef.current = null;
conversationFlatListScrollPositionRef.current = { x: 0, y: 0 };

export const handleReplyPress = msgId => {
   const scrollIndex = findConversationMessageIndex(msgId);
   if (scrollIndex < 0) {
      return;
   }
   Store.dispatch(highlightMessage({ msgId, shouldHighlight: 1 }));
   conversationFlatListRef.current.scrollToIndex({
      index: scrollIndex,
      animated: true,
      viewPosition: 0.5,
   });
   setTimeout(() => {
      Store.dispatch(highlightMessage({ msgId, shouldHighlight: 0 }));
   }, 500);
};

export const findConversationMessageIndex = msgId => {
   const data = conversationFlatListRef.current.props.data;
   const index = data.findIndex(item => item.msgId === msgId);
   const { deleteStatus, recallStatus } = getChatMessage(msgId);
   if (deleteStatus !== 0 || recallStatus !== 0) {
      showToast('This message is no longer available', {
         id: 'message_no_longer_available',
      });
   } else {
      return index;
   }
   return -1; // Return -1 if message not found or unavailable
};
