import React from 'react';
import { View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import ArchiveToggle from '../components/ArchiveToggle';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function ChatsScreen() {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();

   return (
      <>
         <ScreenHeader isSearchable={false} title={stringSet.SETTING_CHAT_SCREEN.CHAT_HEADER_LABEL} />
         <View style={[commonStyles.flex1, commonStyles.bg_color(themeColorPalatte.screenBgColor), { padding: 20 }]}>
            <View style={[commonStyles.hstack, commonStyles.justifyContentSpaceEvenly, commonStyles.alignItemsCenter]}>
               <ArchiveToggle />
            </View>
            <View style={commonStyles.dividerLine(themeColorPalatte.dividerBg)} />
         </View>
      </>
   );
}

export default ChatsScreen;
