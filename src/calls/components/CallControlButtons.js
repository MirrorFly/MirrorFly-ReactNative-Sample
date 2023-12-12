import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import {
   AudioMuteIcon,
   AudioUnMuteIcon,
   EndCallIcon,
   SpeakerEnableIcon,
   VideoMuteIcon,
   VideoUnMuteIcon,
} from '../../common/Icons';
import { useSelector } from 'react-redux';
import { updateCallAudioMute } from '../../Helper/Calls/Utility';

const CallControlButtons = ({ handleEndCall, handleVideoMute }) => {
   let endActionButtonRef = useRef(false);

   const { isAudioMuted, isVideoMuted, isSpeakerEnabled } = useSelector(state => state.callControlsData);
   const { callerUUID } = useSelector(state => state.callData) || {};

   const [speakerToggle, setSpeakerToggle] = React.useState(false);

   const speakerOn = () => {
      setSpeakerToggle(!speakerToggle);
   };

   const handleEndCallPress = () => {
      // Preventing end call action for 5 sec  using ref
      if (!endActionButtonRef.current) {
         endActionButtonRef.current = true;
         handleEndCall();
      }
   };

   const handleAudioMutePress = async () => {
      const _audioMuted = !isAudioMuted;
      updateCallAudioMute(_audioMuted, callerUUID);
   };

   return (
      <>
         <View style={styles.container}>
            <GestureHandlerRootView style={styles.actionButtonWrapper}>
               <RectButton
                  onPress={handleAudioMutePress}
                  style={[[styles.actionButton, isAudioMuted && styles.activeButton]]}>
                  {isAudioMuted ? <AudioMuteIcon /> : <AudioUnMuteIcon />}
               </RectButton>
               <RectButton onPress={handleVideoMute} style={[styles.actionButton, isVideoMuted && styles.activeButton]}>
                  {isVideoMuted ? <VideoMuteIcon /> : <VideoUnMuteIcon color={'#000'} />}
               </RectButton>
               <RectButton onPress={speakerOn} style={[styles.actionButton, isSpeakerEnabled && styles.activeButton]}>
                  <SpeakerEnableIcon color={isSpeakerEnabled ? '#000' : '#fff'} />
               </RectButton>
            </GestureHandlerRootView>
         </View>
         {/* call action buttons (Accept & Reject) */}
         <GestureHandlerRootView style={styles.actionEndButtonWrapper}>
            <RectButton onPress={handleEndCallPress} style={[styles.actionEndButton, styles.redButton]}>
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
      backgroundColor: '#fff',
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
