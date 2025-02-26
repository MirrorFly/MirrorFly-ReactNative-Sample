import React from 'react';
import { StyleSheet, View } from 'react-native';
import SDK from '../SDK/SDK';
import CustomSwitch from '../common/CustomSwitch';
import Text from '../common/Text';
import { getStringSet } from '../localization/stringSet';
import { useArchive, useThemeColorPalatte } from '../redux/reduxHook';

function ArchiveToggle() {
   const archive = useArchive();
   const themeColorPalatte = useThemeColorPalatte();
   const stringSet = getStringSet();

   const handleSwitchToggle = value => {
      SDK.updateUserSettings(value);
   };

   return (
      <>
         <View style={[styles.contentContainer]}>
            <Text
               style={{
                  fontSize: 15,
                  color: themeColorPalatte.primaryTextColor,
                  lineHeight: 18,
                  marginBottom: 5,
               }}>
               {stringSet.SETTING_CHAT_SCREEN.ARCHIVE_SETTINGS_LABEL}
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 18, color: themeColorPalatte.secondaryTextColor }}>
               {stringSet.SETTING_CHAT_SCREEN.ARCHIVE_SETTINGS_DES_LABEL}
            </Text>
         </View>
         <CustomSwitch value={archive} onToggle={handleSwitchToggle} />
      </>
   );
}

export default ArchiveToggle;

const styles = StyleSheet.create({
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
      padding: 4,
   },
});
