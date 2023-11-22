import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { AudioUnMuteIcon, EndCallIcon, SpeakerEnableIcon, VideoMuteIcon } from '../../common/Icons';

const CallControlButtons = (props = {}) => {
   const { handleAudioMute, handleEndCall } = props;

   const [speakerToggle, setSpeakerToggle] = React.useState(false);
   let videoMute = true;

   const speakerOn = () => {
      setSpeakerToggle(!speakerToggle);
   };

   return (
      <>
         <View style={styles.container}>
            <GestureHandlerRootView style={styles.actionButtonWrapper}>
               <RectButton onPress={handleAudioMute} style={[styles.actionButton]}>
                  <AudioUnMuteIcon />
               </RectButton>
               <RectButton onPress={handleAudioMute} style={[styles.actionButton, videoMute && styles.activeButton]}>
                  <VideoMuteIcon />
               </RectButton>
               <RectButton onPress={speakerOn} style={[styles.actionButton]}>
                  <SpeakerEnableIcon />
               </RectButton>
            </GestureHandlerRootView>
         </View>
         {/* call action buttons (Accept & Reject) */}
         <GestureHandlerRootView style={styles.actionEndButtonWrapper}>
            <RectButton onPress={handleEndCall} style={[styles.actionEndButton, styles.redButton]}>
               <EndCallIcon />
            </RectButton>
         </GestureHandlerRootView>
      </>
   );
};

export default CallControlButtons;

const styles = StyleSheet.create({
   container: {
      width: '100%',
      maxWidth: 500,
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   actionButtonWrapper: {
      width: '100%',
      marginBottom: 40,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
   },
   actionButton: {
      width: 55,
      height: 55,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 28,
   },
   activeButton: {
      width: 55,
      height: 55,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 28,
   },
   actionEndButtonWrapper: {
      marginBottom: 30,
      flexDirection: 'row',
      justifyContent: 'space-around',
   },
   actionEndButton: {
      width: 200,
      height: 50,
      backgroundColor: 'salmon',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
   },
   redButton: {
      backgroundColor: '#FB2B48',
   },
});
