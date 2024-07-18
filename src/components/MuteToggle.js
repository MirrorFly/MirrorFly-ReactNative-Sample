import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SDK from '../SDK/SDK';
import CustomSwitch from '../common/CustomSwitch';
import ApplicationColors from '../config/appColors';
import { toggleChatMute } from '../redux/recentChatDataSlice';
import { useMuteStatus } from '../redux/reduxHook';
import store from '../redux/store';

function MuteToggle({ chatUser }) {
   const muteStatus = useMuteStatus(chatUser);

   const handleSwitchToggle = value => {
      SDK.updateMuteNotification(chatUser, value);
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
         <CustomSwitch value={muteStatus} onToggle={handleSwitchToggle} />
      </>
   );
}

export default MuteToggle;

const styles = StyleSheet.create({
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
      padding: 4,
   },
});
