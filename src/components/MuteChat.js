import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import IconButton from '../common/IconButton';
import { ChatMuteIcon, ChatUnMuteIcon } from '../common/Icons';
import { getUserIdFromJid, toggleMuteChat } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { useArchive, useMuteStatus } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const MuteChat = ({ filteredChats }) => {
   const archiveChatSetting = useArchive();
   const [isChatMuted, setIsChatMuted] = useState(false);

   const isExists = filteredChats.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType !== '' : true));

   // Subscribe to rosterData using useSelector
   const rosterData = useSelector(state => state.rosterData.data);

   const selectedUserJids = useMemo(() => {
      return filteredChats.filter(item => item.isSelected === 1).map(item => item.userJid);
   }, [filteredChats]);

   useEffect(() => {
      const muteStatuses = selectedUserJids.map(jid => {
         const userId = getUserIdFromJid(jid);
         return rosterData[userId]?.muteStatus === 1;
      });
      const areAllMuted = muteStatuses.every(status => status === true);
      setIsChatMuted(areAllMuted);
   }, [selectedUserJids, rosterData]);

   if (!isExists) {
      return null;
   }

   return (
      Boolean(archiveChatSetting !== 1) && (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={toggleMuteChat}>
               {!isChatMuted ? <ChatMuteIcon width={17} height={17} /> : <ChatUnMuteIcon width={17} height={17} />}
            </IconButton>
         </View>
      )
   );
};
export default MuteChat;

export const MuteChatRecentItem = props => {
   const {
      recentChatItem: { userId },
      isRecentChatComponent = false,
   } = props;
   const letArchive = useArchive();
   const muteStatus = useMuteStatus(userId);
   const archiveChatSetting = !isRecentChatComponent ? letArchive : false;
   return Boolean(muteStatus === 1) && Boolean(archiveChatSetting !== 1) && <ChatMuteIcon width={13} height={13} />;
};
