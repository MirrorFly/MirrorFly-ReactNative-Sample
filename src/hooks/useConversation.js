import { createRef } from 'react';
import { showToast } from '../Helper';
import { highlightMessage } from '../redux/Actions/ChatMessageAction';
import Store from '../redux/store';

export const conversationFlatListRef = createRef(),
   conversationFlatListScrollPositionRef = createRef();

conversationFlatListRef.current = null;
conversationFlatListScrollPositionRef.current = { x: 0, y: 0 };

export const handleReplyPress = (msgId, message) => {
   const scrollIndex = findConversationMessageIndex(msgId, message);
   if (!scrollIndex || scrollIndex < 0) {
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

export const findConversationMessageIndex = (msgId, message) => {
   const data = conversationFlatListRef.current.props.data;
   const index = data.findIndex(item => item.msgId === msgId);
   const { deleteStatus, recallStatus } = message;
   if (deleteStatus !== 0 || recallStatus !== 0) {
      showToast('This message is no longer available', {
         id: 'message_no_longer_available',
      });
      return;
   } else if (index < 0) {
      return;
   } else {
      return index;
   }
};
