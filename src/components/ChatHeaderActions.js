import React from 'react';
import { Keyboard, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import RootNavigation from '../Navigation/rootNavigation';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { DeleteIcon, ForwardIcon, ReplyIcon } from '../common/Icons';
import MenuContainer from '../common/MenuContainer';
import config from '../config/config';
import {
   copyToClipboard,
   handelResetMessageSelection,
   handleConversationClear,
   handleMessageDelete,
   handleMessageDeleteForEveryOne,
   handleUpdateBlockUser,
   isAnyMessageWithinLast30Seconds,
   isLocalUser,
} from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { getStringSet } from '../localization/stringSet';
import { resetMessageSelections, toggleEditMessage } from '../redux/chatMessageDataSlice';
import { setReplyMessage, setTextMessage } from '../redux/draftSlice';
import {
   getSelectedChatMessages,
   getUserNameFromStore,
   useBlockedStatus,
   useSelectedChatMessages,
} from '../redux/reduxHook';
import { FORWARD_MESSSAGE_SCREEN, MESSAGE_INFO_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { chatInputRef } from './ChatInput';

export const RenderMessageSelectionCount = ({ userId }) => {
   const filtered = useSelectedChatMessages(userId) || [];
   return (
      <Text style={[commonStyles.fontSize_18, commonStyles.colorBlack, commonStyles.pl_10]}>{filtered.length}</Text>
   );
};

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

   if (blockedStaus || filtered?.length > 1) {
      return null;
   }

   return (
      <IconButton style={[commonStyles.padding_10_15]} onPress={_handleReplyMessage}>
         <ReplyIcon />
      </IconButton>
   );
}

export const RenderDeleteIcon = ({ userId, chatUser }) => {
   const [modalContent, setModalContent] = React.useState(null);
   const stringSet = getStringSet();

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const _handleMessageDelete = () => {
      Keyboard.dismiss();
      const selectedMessages = getSelectedChatMessages(userId);
      const deleteForEveryOne = isAnyMessageWithinLast30Seconds(selectedMessages);
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title:
            selectedMessages?.length > 1
               ? stringSet.CHAT_SCREEN.DELETE_MULTIPLE_MESSAGE
               : stringSet.CHAT_SCREEN.DELETE_SINGLE_MESSAGE,
         noButton: stringSet.BUTTON_LABEL.CANCEL_BUTTON,
         yesButton: stringSet.CHAT_SCREEN.DELETE_FOR_ME,
         yesAction: handleMessageDelete(chatUser),
         ...(deleteForEveryOne && {
            optionalButton: stringSet.CHAT_SCREEN.DELETE_FOR_EVERYONE,
            optionalAction: handleMessageDeleteForEveryOne(chatUser),
         }),
      });
   };

   return (
      <>
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={_handleMessageDelete}>
               <DeleteIcon />
            </IconButton>
         </View>
         {modalContent && <AlertModal {...modalContent} />}
      </>
   );
};

export const RenderForwardIcon = ({ userId }) => {
   const filtered = useSelectedChatMessages(userId) || [];

   const _handleForwardMessage = () => {
      Keyboard.dismiss();
      RootNavigation.navigate(FORWARD_MESSSAGE_SCREEN, { forwardMessages: filtered });
   };

   const isAllowForward = filtered.every(
      _message =>
         _message?.msgStatus !== 3 &&
         _message?.deleteStatus === 0 &&
         _message?.recallStatus === 0 &&
         (_message?.msgBody?.media
            ? _message?.msgBody?.media?.is_uploading === 2 && _message?.msgBody?.media?.is_downloaded === 2
            : true), // If no media, skip these checks
   );

   return isAllowForward ? (
      <IconButton style={[commonStyles.padding_10_15]} onPress={_handleForwardMessage}>
         <ForwardIcon />
      </IconButton>
   ) : null;
};

export const RenderMenuItems = ({ userId, chatUser }) => {
   const menuItems = [];

   const filtered = useSelectedChatMessages(userId) || [];
   const dispatch = useDispatch();
   const blockedStaus = useBlockedStatus(userId);

   const [modalContent, setModalContent] = React.useState(null);
   const stringSet = getStringSet();

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const handleClearAction = () => {
      handleConversationClear(chatUser);
      setModalContent(null);
   };

   const handleClear = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: stringSet.POPUP_TEXT.ARE_YOU_SURE_YOU_WANT_TO_CLEAR_THE_CHAT,
         noButton: stringSet.BUTTON_LABEL.NO_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.YES_BUTTON,
         yesAction: handleClearAction,
      });
   };

   const handleGoMessageInfoScreen = () => {
      RootNavigation.navigate(MESSAGE_INFO_SCREEN, { chatUser, msgId: filtered[0].msgId });
      handelResetMessageSelection(userId)();
   };

   const handleEditMessage = () => {
      handelResetMessageSelection(userId)();
      dispatch(toggleEditMessage(filtered[0].msgId));
      dispatch(
         setTextMessage({ userId, message: filtered[0]?.msgBody?.media?.caption || filtered[0]?.msgBody?.message }),
      );
      setTimeout(() => {
         chatInputRef?.current?.focus();
      }, 10);
   };

   const hadleBlockUser = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: `${
            blockedStaus ? stringSet.CHAT_SCREEN.UNBLOCK_LABEL : stringSet.CHAT_SCREEN.BLOCK_LABEL
         } ${getUserNameFromStore(userId)}`,
         noButton: stringSet.BUTTON_LABEL.CANCEL_BUTTON,
         yesButton: blockedStaus
            ? stringSet.CHAT_SCREEN.UNBLOCK_LABEL.toUpperCase()
            : stringSet.CHAT_SCREEN.BLOCK_LABEL.toUpperCase(),
         yesAction: handleUpdateBlockUser(userId, blockedStaus ? 0 : 1, chatUser),
      });
   };

   /**
   const toggleSearch = () => {
      dispatch(toggleIsChatSearching(!getIsChatSearching()));
   };
   */

   if (
      (filtered[0]?.msgBody?.message_type === 'text' || filtered[0]?.msgBody?.media?.caption) &&
      filtered[0]?.deleteStatus === 0 &&
      filtered[0]?.recallStatus === 0
   ) {
      menuItems.push({
         label: stringSet.CHAT_SCREEN.COPY_TEXT_MENU_LABEL,
         formatter: copyToClipboard(filtered, userId),
      });
   }

   if (
      filtered.length === 1 &&
      isLocalUser(filtered[0]?.publisherJid) &&
      filtered[0]?.msgStatus !== 3 &&
      filtered[0]?.deleteStatus === 0 &&
      filtered[0]?.recallStatus === 0
   ) {
      menuItems.push({
         label: stringSet.CHAT_SCREEN.MESSAGE_INFO,
         formatter: handleGoMessageInfoScreen,
      });
      const now = Date.now();
      if (
         now - filtered[0]?.timestamp <= config.editMessageTime &&
         (filtered[0]?.msgBody.message_type === 'text' || filtered[0]?.msgBody?.media?.caption)
      ) {
         menuItems.push({
            label: stringSet.CHAT_SCREEN.EDIT_MESSAGE,
            formatter: handleEditMessage,
         });
      }
   }

   if (!filtered.length) {
      menuItems.push({
         label: stringSet.CHAT_SCREEN.CLEAR_CHAT,
         formatter: handleClear,
      });
      /**
      menuItems.push({
         label: 'Search',
         formatter: toggleSearch,
      });
       */
   }

   if (!filtered.length && !MIX_BARE_JID.test(chatUser)) {
      menuItems.push({
         label: blockedStaus ? stringSet.CHAT_SCREEN.UNBLOCK_LABEL : stringSet.CHAT_SCREEN.BLOCK_LABEL,
         formatter: hadleBlockUser,
      });
   }

   if (menuItems.length === 0) {
      return null;
   }

   return (
      <>
         {filtered.length < 2 ? <MenuContainer menuItems={menuItems} /> : null}
         {modalContent && <AlertModal {...modalContent} />}
      </>
   );
};
