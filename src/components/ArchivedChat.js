import React from 'react';
import { Text, View } from 'react-native';
import { ArchiveIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { handleRoute } from '../helpers/chatHelpers';
import { useArchivedChatData } from '../redux/reduxHook';
import { ARCHIVED_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

function ArchivedChat() {
   const recentArchiveChatData = useArchivedChatData() || [];
   const count = recentArchiveChatData.filter(d => d.unreadCount > 0).length;

   return (
      <>
         <Pressable
            onPress={handleRoute(ARCHIVED_SCREEN)}
            contentContainerStyle={[commonStyles.container, commonStyles.p_15]}>
            <View style={[commonStyles.contentContainer, commonStyles.hstack, commonStyles.marginLeft_20]}>
               <ArchiveIcon />
               <Text style={[commonStyles.marginLeft_20, { color: '#000' }]}>Archived</Text>
            </View>
            {Boolean(count) && <Text>{count}</Text>}
         </Pressable>
         <View style={commonStyles.dividerLine} />
      </>
   );
}

export default ArchivedChat;
