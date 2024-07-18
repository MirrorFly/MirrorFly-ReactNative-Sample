import React from 'react';
import { View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import ArchiveToggle from '../components/ArchiveToggle';
import commonStyles from '../styles/commonStyles';

function ChatsScreen() {
   return (
      <>
         <ScreenHeader isSearchable={false} title="Chats" />
         <View style={[commonStyles.flex1, commonStyles.bg_white, { padding: 20 }]}>
            <View style={[commonStyles.hstack, commonStyles.justifyContentSpaceEvenly, commonStyles.alignItemsCenter]}>
               <ArchiveToggle />
            </View>
            <View style={commonStyles.dividerLine} />
         </View>
      </>
   );
}

export default ChatsScreen;
