import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { AudioUnMuteIcon, SpeakerEnableIcon, VideoMuteIcon, VideoUnMuteIcon } from '../../common/Icons';

const CallControlButtons = (props = {}) => {
   const { handleAudioMute } = props;
   let videoMute = true;
   console.log(videoMute, 'videoMute');
   return (
      <View style={styles.container}>
         <GestureHandlerRootView style={styles.actionButtonWrapper}>
            <RectButton onPress={handleAudioMute} style={[styles.actionButton]}>
               <AudioUnMuteIcon />
            </RectButton>
            <RectButton onPress={handleAudioMute} style={[styles.actionButton, videoMute && styles.activeButton]}>
               <VideoMuteIcon />
            </RectButton>
            <RectButton onPress={handleAudioMute} style={[styles.actionButton]}>
               <SpeakerEnableIcon />
            </RectButton>
         </GestureHandlerRootView>
      </View>
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
});
