import { shallowEqual, useSelector } from 'react-redux';
import { getUserIdFromJid, isValidUrl } from '../helpers/chatHelpers';
import { selectArchivedChatData, selectFilteredRecentChatData } from './recentChatDataSlice';
import store from './store';
import { selectFilteredThemeData } from './themeColorDataSlice';

export const useRecentChatData = () => useSelector(state => state.recentChatData.recentChats);
export const useUserType = chatUser =>
   useSelector(state => state.recentChatData.recentChats.find(item => item.userJid === chatUser)?.userType);
export const useRecentChatSearchText = () => useSelector(state => state.recentChatData.searchText);
export const useFilteredRecentChatData = () => useSelector(selectFilteredRecentChatData);
export const useArchivedChatData = () => useSelector(selectArchivedChatData);
export const useRoasterList = () => useSelector(state => state.rosterData.data);
export const useRoasterData = userId => useSelector(state => state.rosterData.data[userId]);
export const useBlockedStatus = userId => useSelector(state => state.rosterData.data[userId]?.isBlocked);
export const useIsBlockedMeStatus = userId => useSelector(state => state.rosterData.data[userId]?.isBlockedMe);
export const useChatMessages = userId => useSelector(state => state.chatMessagesData?.[userId]);
export const useChatSearchText = () => useSelector(state => state.chatMessagesData?.searchText);
export const useIsChatSearching = () => useSelector(state => state.chatMessagesData?.isChatSearching);
export const useChatSearchLoading = userId =>
   useSelector(state => state.chatMessagesData?.isSearchChatLoading?.[userId]) || '';
export const useAnySelectedChatMessages = userId => {
   return useSelector(state => {
      const messages = state.chatMessagesData?.[userId] || [];
      // Return true if at least one message is selected
      return messages.some(item => item.isSelected === 1);
   });
};
// Selector for fetching only selected messages
export const useSelectedChatMessages = userId => {
   return useSelector(
      state => {
         const messages = state.chatMessagesData?.[userId] || [];
         // Memoize the filtered array based on selection status
         return messages.reduce((acc, message) => {
            if (message.isSelected === 1) {
               acc.push(message);
            }
            return acc;
         }, []);
      },
      // Custom equality function to prevent unnecessary rerenders
      shallowEqual,
   );
};

export const useMediaMessages = (userId, mediaTypeArr = []) => {
   return useSelector(state => {
      const messages = state.chatMessagesData?.[userId] || [];

      return messages.filter(
         ({ msgBody: { message_type = '', media } = {}, deleteStatus, recallStatus }) =>
            mediaTypeArr.includes(message_type) &&
            deleteStatus === 0 &&
            recallStatus === 0 &&
            media?.is_downloaded === 2 &&
            media?.is_uploading === 2,
      );
   }, shallowEqual);
};

export const useLinkMessages = userId => {
   return useSelector(
      state => {
         const messages = state.chatMessagesData?.[userId] || [];

         // Memoize the filtered array based on message type and URL validity
         return messages.filter(message => {
            const { msgBody: { message_type = '', message: _message } = {} } = message || {};

            // Check the condition: message is of type 'text' and textMessage is a valid URL
            return ['text'].includes(message_type) && isValidUrl(_message);
         });
      },
      // Custom equality function to prevent unnecessary rerenders
      shallowEqual,
   );
};
export const useChatMessage = (userId, msgId) =>
   useSelector(state => state.chatMessagesData?.[userId]?.find(msg => msg.msgId === msgId));
export const useXmppConnectionStatus = () => useSelector(state => state.loggedInUserData.xmppStatus);
export const usePresenceData = userId => useSelector(state => state.presenceData[userId]);
export const useTypingData = userId => useSelector(state => state.typingData[userId]);
export const useMediaProgress = msgId => useSelector(state => state.progressData[msgId]);
export const useArchive = () => useSelector(state => state.settingsData?.archive);
export const useNotificationSound = () => useSelector(state => state.settingsData?.notificationSound);
export const useNotificationVibration = () => useSelector(state => state.settingsData?.notificationVibrate);
export const useNotificationDisable = () => useSelector(state => state.settingsData?.muteNotification);
export const useMuteStatus = userJid =>
   useSelector(state => state.recentChatData?.recentChats.find(item => item.userJid === userJid)?.muteStatus) || 0;
export const useArchiveStatus = jid =>
   useSelector(state => state.recentChatData.recentChats.find(item => item.userJid === jid)?.archiveStatus);

export const useGroupParticipantsList = groupId => useSelector(state => state.groupData.participantsList[groupId]);
export const useReplyMessage = userId => useSelector(state => state.draftData.data[userId]?.replyMessage);
export const useTextMessage = userId => useSelector(state => state.draftData.data[userId]?.text);
export const useThemeColorPalatte = () => useSelector(selectFilteredThemeData);
export const useThemeColor = () => useSelector(state => state.themeColorPalatte.theme);
export const useFontFamily = () => useSelector(state => state.themeColorPalatte.fontFamily) || {};
export const useEditMessageId = () => useSelector(state => state.chatMessagesData?.editMessage) || '';
export const useParentMessage = msgId => useSelector(state => state.chatMessagesData?.parentMessage[msgId]);
export const useAudioRecording = userId => useSelector(state => state.draftData.data[userId]?.audioRecord);
export const useAudioRecordTime = userId => useSelector(state => state.draftData.data[userId]?.audioRecordTime);
export const useRoomLink = () => useSelector(state => state.callData?.connectionState?.roomLink);

export const getReplyMessage = userId => store.getState().draftData.data[userId]?.replyMessage || {};
export const getRecentChatData = () => store.getState().recentChatData.recentChats;
export const getSelectedChats = () => store.getState().recentChatData.recentChats.filter(item => item.isSelected === 1);
export const getArchiveSelectedChats = () =>
   store.getState().recentChatData.recentChats.filter(item => item.isSelected === 1 && item.archiveStatus === 1);
export const getChatMessages = userId => store.getState().chatMessagesData?.[userId];
export const getChatSearchText = () => store.getState().chatMessagesData?.searchText;
export const getIsChatSearching = () => store.getState().chatMessagesData?.isChatSearching;
export const getChatSearchLoading = userId => store.getState().chatMessagesData?.isSearchChatLoading?.[userId] || '';
export const getUserNameFromStore = userId => store.getState().rosterData.data?.[userId]?.nickName;
export const getUserColorFromStore = userId => store.getState().rosterData.data?.[userId]?.colorCode;
export const getSelectedChatMessages = userId =>
   store.getState().chatMessagesData?.[userId].filter(item => item.isSelected === 1);
export const getMediaProgress = msgId => store.getState().progressData[msgId];
export const getRoasterData = userId => store.getState().rosterData.data[getUserIdFromJid(userId)] || {};
export const getArchive = () => store.getState().settingsData?.archive;
export const getUserImage = userId => {
   const { image } = store.getState().rosterData.data[userId] || {};
   return image;
};
export const getAudioRecording = userId => store.getState().draftData.data[userId]?.audioRecord;
export const getAudioRecordTime = userId => store.getState().draftData.data[userId]?.audioRecordTime;
export const getChatMessage = (userId, msgId) =>
   store.getState().chatMessagesData?.[userId]?.find(msg => msg.msgId === msgId);
export const getXmppConnectionStatus = () => store.getState().loggedInUserData.xmppStatus;
export const getBlockedStatus = userId => store.getState().rosterData.data[userId]?.isBlocked;
export const getAnySelectedChatMessages = userId => {
   const messages = store.getState().chatMessagesData?.[userId] || [];
   return messages.some(item => item.isSelected === 1);
};
export const getRoomLink = () => store.getState().callData?.connectionState?.roomLink;
export const getCurrentCallRoomId = () => store.getState().callData?.connectionState?.roomId;
export const getMediaMessages = (userId, mediaTypeArr = []) => {
   const state = store.getState();
   const messages = state.chatMessagesData?.[userId] || [];

   return messages.filter(
      ({ msgBody: { message_type = '', media } = {}, deleteStatus, recallStatus }) =>
         mediaTypeArr.includes(message_type) &&
         deleteStatus === 0 &&
         recallStatus === 0 &&
         media?.is_downloaded === 2 &&
         media?.is_uploading === 2,
   );
};
