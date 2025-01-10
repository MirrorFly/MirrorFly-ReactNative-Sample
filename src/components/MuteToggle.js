import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomSwitch from '../common/CustomSwitch';
import Text from '../common/Text';
import ApplicationColors from '../config/appColors';
import { toggleChatMute } from '../redux/recentChatDataSlice';
import { useArchive, useArchiveStatus } from '../redux/reduxHook';
import store from '../redux/store';
import SDK from '../SDK/SDK';
import { getMuteStatus } from '../SDK/utils';

const MuteToggle = ({ chatUser }) => {
   const [muteStatus, setMuteStatus] = React.useState(0);
   const archiveStatus = useArchiveStatus(chatUser);
   const archive = useArchive();
   const isDisabledMuteChat = archiveStatus === 1 && archive;

   const fetchMuteStatus = React.useCallback(async () => {
      try {
         const status = await getMuteStatus(chatUser);
         setMuteStatus(status);
      } catch (error) {
         console.error('Error fetching mute status:', error);
      }
   }, [chatUser]);

   React.useEffect(() => {
      fetchMuteStatus();
   }, []);

   const handleSwitchToggle = value => {
      SDK.updateMuteNotification(chatUser, value);
      setMuteStatus(value ? 1 : 0);
      store.dispatch(toggleChatMute({ userJid: chatUser, muteStatus: value ? 1 : 0 }));
   };

   return (
      <>
         <View style={styles.contentContainer}>
            <Text
               style={{
                  fontSize: 15,
                  color: ApplicationColors.black,
                  marginBottom: 5,
                  fontWeight: '500',
               }}>
               Mute Notification
            </Text>
         </View>
         <CustomSwitch value={muteStatus} onToggle={handleSwitchToggle} disabled={Boolean(isDisabledMuteChat)} />
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
});
