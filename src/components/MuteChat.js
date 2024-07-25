import React from 'react';
import { View } from 'react-native';
import IconButton from '../common/IconButton';
import { ChatMuteIcon, ChatUnMuteIcon } from '../common/Icons';
import { toggleMuteChat } from '../helpers/chatHelpers';
import { useArchive } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const MuteChat = props => {
   const { filteredChats } = props;
   const archiveChatSetting = useArchive();
   const isChatMuted = filteredChats.some(res => res.muteStatus === 1);
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
      recentChatItem: { muteStatus },
      isRecentChatComponent = false,
   } = props;
   const archiveChatSetting = !isRecentChatComponent ? useArchive() : false;
   return Boolean(muteStatus === 1) && Boolean(archiveChatSetting !== 1) && <ChatMuteIcon width={13} height={13} />;
};
