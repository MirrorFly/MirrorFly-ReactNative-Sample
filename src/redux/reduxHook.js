import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { selectArchivedChatData, selectFilteredRecentChatData } from './recentChatDataSlice';
import store from './store';

export const useRecentChatData = () => useSelector(state => state.recentChatData.recentChats);
export const useRecentChatSearchText = () => useSelector(state => state.recentChatData.searchText);
export const useFilteredRecentChatData = () => useSelector(selectFilteredRecentChatData);
export const useArchivedChatData = () => useSelector(selectArchivedChatData);
export const useRoasterData = userId => useSelector(state => state.rosterData.data[userId]);
export const useChatMessages = userId => useSelector(state => state.chatMessagesData?.[userId]);
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

export const useGroupParticipantsList = groupId => useSelector(state => state.groupData.participantsList[groupId]);

export const getRecentChatData = () => store.getState().recentChatData.recentChats;
export const getSelectedChats = () => store.getState().recentChatData.recentChats.filter(item => item.isSelected === 1);
export const getArchiveSelectedChats = () =>
   store.getState().recentChatData.recentChats.filter(item => item.isSelected === 1 && item.archiveStatus === 1);
export const getChatMessages = userId => store.getState().chatMessagesData?.[userId];
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
