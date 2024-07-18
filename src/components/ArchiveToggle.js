import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SDK from '../SDK/SDK';
import CustomSwitch from '../common/CustomSwitch';
import ApplicationColors from '../config/appColors';
import { useArchive } from '../redux/reduxHook';

function ArchiveToggle() {
   const archive = useArchive();

   const handleSwitchToggle = value => {
      SDK.updateUserSettings(value);
   };

   return (
      <>
         <View style={styles.contentContainer}>
            <Text style={{ fontSize: 15, color: ApplicationColors.black, lineHeight: 18, marginBottom: 5 }}>
               Archive Settings
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 18 }}>
               Archived chats will remain archived when you receive a new message
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
