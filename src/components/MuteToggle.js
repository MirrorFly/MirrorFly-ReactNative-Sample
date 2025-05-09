import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomSwitch from '../common/CustomSwitch';
import Text from '../common/Text';
import ApplicationColors from '../config/appColors';
import { useArchive, useArchiveStatus, useMuteStatus, useUserType } from '../redux/reduxHook';
import store from '../redux/store';
import SDK from '../SDK/SDK';
import { MIX_BARE_JID } from '../helpers/constants';
import { showToast } from '../helpers/chatHelpers';
import { toggleMute } from '../redux/rosterDataSlice';

const MuteToggle = ({ chatUser }) => {
   const archive = useArchive(); // Global archive setting
   const muteStatus = useMuteStatus(chatUser);
   const archiveStatus = useArchiveStatus(chatUser);
   const userType = useUserType(chatUser); // null or undefined if not in group
   const isGroup = MIX_BARE_JID.test(chatUser);
   const isArchived = archiveStatus === 1 && archive;

   // Disable if group and user not in group, or archived
   const isDisabled = (isGroup && !userType) || !!isArchived;

   const handleSwitchToggle = async value => {
      const res = await SDK.updateMuteNotification([chatUser], value);
      if (res.statusCode === 200) {
         store.dispatch(
            toggleMute({
               userJids: [chatUser],
               muteStatus: value ? 1 : 0,
            }),
         );
      } else {
         showToast(res.message);
      }
   };

   return (
      <>
         <View style={styles.contentContainer}>
            <Text style={styles.text}>Mute Notification</Text>
         </View>
         <CustomSwitch
            value={isArchived ? 0 : muteStatus}
            onToggle={handleSwitchToggle}
            disabled={isDisabled}
            networkDisabled={true}
         />
      </>
   );
};

export default MuteToggle;

const styles = StyleSheet.create({
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
      padding: 4,
   },
   text: {
      fontSize: 15,
      color: ApplicationColors.black,
      marginBottom: 5,
      fontWeight: '500',
   },
});
