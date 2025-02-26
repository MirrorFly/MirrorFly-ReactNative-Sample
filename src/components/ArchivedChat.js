import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ArchiveIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { handleRoute } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useArchive, useArchivedChatData, useThemeColorPalatte } from '../redux/reduxHook';
import { ARCHIVED_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

function ArchivedChat() {
   const archive = useArchive();
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const recentArchiveChatData = useArchivedChatData() || [];
   const count = recentArchiveChatData.filter(d => d.unreadCount > 0).length;

   return (
      <>
         <Pressable
            onPress={handleRoute(ARCHIVED_SCREEN)}
            contentContainerStyle={[styles.container, commonStyles.p_15]}>
            <View style={[styles.contentContainer, commonStyles.hstack, commonStyles.marginLeft_20]}>
               <ArchiveIcon color={themeColorPalatte.iconColor} />
               <Text style={[commonStyles.marginLeft_20, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                  {stringSet.COMMON_TEXT.RECENT_ARCHIVED_LABEL}
               </Text>
            </View>
            {Boolean(count) && !!archive && <Text>{count}</Text>}
            {!archive && <Text>{recentArchiveChatData.length}</Text>}
         </Pressable>
         <View style={commonStyles.dividerLine(themeColorPalatte.dividerBg)} />
      </>
   );
}

export default ArchivedChat;

const styles = StyleSheet.create({
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
   },
   container: {
      flexDirection: 'row',
      alignItems: 'center',
   },
});
