import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { selectArchivedChatData, selectFilteredRecentChatData } from './recentChatDataSlice';
import store from './store';

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
export const useEditMessageId = () => useSelector(state => state.chatMessagesData?.editMessage) || '';
export const useParentMessage = msgId => useSelector(state => state.chatMessagesData?.parentMessage[msgId]);
export const useAudioRecording = userId => useSelector(state => state.draftData.data[userId]?.audioRecord);
export const useAudioRecordTime = userId => useSelector(state => state.draftData.data[userId]?.audioRecordTime);

export const getReplyMessage = userId => store.getState().draftData.data[userId]?.replyMessage || {};
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
export const getAudioRecording = userId => store.getState().draftData.data[userId]?.audioRecord;
export const getAudioRecordTime = userId => store.getState().draftData.data[userId]?.audioRecordTime;
export const getChatMessage = (userId, msgId) =>
   store.getState().chatMessagesData?.[userId]?.find(msg => msg.msgId === msgId);
export const getXmppConnectionStatus = () => store.getState().loggedInUserData.xmppStatus;
export const getBlockedStatus = userId => store.getState().rosterData.data[userId]?.isBlocked;
