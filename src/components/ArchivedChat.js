import React from 'react';
import { Text, View } from 'react-native';
import { ArchiveIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { handleRoute } from '../helpers/chatHelpers';
import { ARCHIVED_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

function ArchivedChat() {
   return (
      <>
         <Pressable
            onPress={handleRoute(ARCHIVED_SCREEN)}
            contentContainerStyle={[commonStyles.container, commonStyles.p_15]}>
            <View style={[commonStyles.contentContainer, commonStyles.hstack, commonStyles.marginLeft_20]}>
               <ArchiveIcon />
               <Text style={[commonStyles.marginLeft_20, { color: '#000' }]}>Archived</Text>
            </View>
            <Text>1</Text>
         </Pressable>
         <View style={commonStyles.dividerLine} />
      </>
   );
}

export default ArchivedChat;
