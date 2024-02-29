import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSelector } from 'react-redux';
import {
   AUDIO_ROUTE_HEADSET,
   AUDIO_ROUTE_SPEAKER,
   CALL_STATUS_DISCONNECTED,
   CALL_TYPE_VIDEO,
} from '../../Helper/Calls/Constant';
import {
   switchCamera,
   updateCallAudioMute,
   updateCallSpeakerEnabled,
   updateCallVideoMute,
} from '../../Helper/Calls/Utility';
import {
   AudioMuteIcon,
   AudioUnMuteIcon,
   CallHeadsetIcon,
   CameraDisabledIcon,
   CameraEnabledIcon,
   EndCallIcon,
   SpeakerEnableIcon,
   VideoMuteIcon,
   VideoUnMuteIcon,
} from '../../common/Icons';
import Pressable from '../../common/Pressable';

const sortAudioRoutes = (a, b) => {
   const nameA = a.name.toLowerCase();
   const nameB = b.name.toLowerCase();
   if (nameA < nameB) {
      return -1;
   } else if (nameA > nameB) {
      return 1;
   }
   return 0;
};

const CallControlButtons = ({ callStatus, handleEndCall, handleVideoMute, callType }) => {
   let endActionButtonRef = useRef(false);
   const RBSheetRef = useRef(null);

   const [audioRoutes, setAudioRoutes] = React.useState([]);

   const { isAudioMuted, isVideoMuted, isSpeakerEnabled, isWiredHeadsetConnected, isFrontCameraEnabled } = useSelector(
      state => state.callControlsData,
   );

   const { callerUUID } = useSelector(state => state.callData) || {};

   const audioRouteIcon = React.useMemo(() => {
      if (isSpeakerEnabled) {
         return <SpeakerEnableIcon color={'#000'} />;
      } else if (isWiredHeadsetConnected) {
         return <CallHeadsetIcon />;
      } else {
         return <SpeakerEnableIcon color={'#fff'} />;
      }
   }, [isSpeakerEnabled, isWiredHeadsetConnected]);

   const toggleCamera = () => {
      if (callStatus?.toLowerCase() === CALL_STATUS_DISCONNECTED) {
         return;
      }
      let cameraSwitch = !isFrontCameraEnabled;
      switchCamera(cameraSwitch);
   };

   const toggleSpeaker = () => {
      if (callStatus?.toLowerCase() === CALL_STATUS_DISCONNECTED) {
         return;
      }
      RNCallKeep.getAudioRoutes().then(_routes => {
         /** sample data from 'getAudioRoutes' method   
          * const sampleAudioRoutes = [
            { "name": "Speaker", "type": "Speaker" },
            { "name": "iPhone Microphone", "type": "Phone" },
            { "name": "Headset Microphone", "selected": true, "type": "Headset" }
         ]; */
         if (Array.isArray(_routes)) {
            if (_routes.length === 2) {
               setAudioRoutes(_routes.sort(sortAudioRoutes));
            } else if (_routes.length > 2) {
               const filteredRoutes = _routes
                  .filter(r => [AUDIO_ROUTE_HEADSET, AUDIO_ROUTE_SPEAKER].includes(r.type))
                  .map(r => ({
                     ...r,
                     selected: isSpeakerEnabled ? r.type === AUDIO_ROUTE_SPEAKER : r.type !== AUDIO_ROUTE_SPEAKER,
                  }));
               setAudioRoutes(filteredRoutes.sort(sortAudioRoutes));
            }
            RBSheetRef.current?.open?.();
         }
      });
   };

   const handleEndCallPress = () => {
      // Preventing end call action for 5 sec  using ref
      if (!endActionButtonRef.current) {
         endActionButtonRef.current = true;
         handleEndCall();
      }
   };

   const handleAudioMutePress = async () => {
      if (callStatus?.toLowerCase() === CALL_STATUS_DISCONNECTED) {
         return;
      }
      const _audioMuted = !isAudioMuted;
      updateCallAudioMute(_audioMuted, callerUUID);
   };

   const handleVideoMutePress = async () => {
      if (callStatus?.toLowerCase() === CALL_STATUS_DISCONNECTED) {
         return;
      }
      const _videoMuted = !isVideoMuted;
      updateCallVideoMute(_videoMuted, callerUUID);
   };

   const handleSelectAudioRoute = _audioRoute => () => {
      RBSheetRef.current?.close?.();
      updateCallSpeakerEnabled(_audioRoute.type === AUDIO_ROUTE_SPEAKER, _audioRoute.name, callerUUID);
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

               {callType === CALL_TYPE_VIDEO && !isVideoMuted && (
                  <RectButton
                     onPress={toggleCamera}
                     style={[styles.actionButton, !isFrontCameraEnabled && styles.activeButton]}>
                     {isFrontCameraEnabled ? <CameraEnabledIcon /> : <CameraDisabledIcon />}
                  </RectButton>
               )}

               <RectButton
                  onPress={handleVideoMutePress}
                  style={[styles.actionButton, isVideoMuted && styles.activeButton]}>
                  {isVideoMuted ? <VideoMuteIcon /> : <VideoUnMuteIcon color={'#f2f2f2'} />}
               </RectButton>
               <RectButton
                  onPress={toggleSpeaker}
                  style={[styles.actionButton, (isSpeakerEnabled || isWiredHeadsetConnected) && styles.activeButton]}>
                  {audioRouteIcon}
               </RectButton>
            </GestureHandlerRootView>
         </View>
         {/* call action buttons (END CALL) */}
         <GestureHandlerRootView style={styles.actionEndButtonWrapper}>
            <RectButton onPress={handleEndCallPress} style={[styles.actionEndButton, styles.redButton]}>
               <EndCallIcon />
            </RectButton>
         </GestureHandlerRootView>
         <RBSheet
            animationType="slide"
            height={150}
            ref={RBSheetRef}
            closeOnDragDown={true}
            closeOnPressMask={true}
            customStyles={{
               wrapper: {
                  backgroundColor: 'transparent',
               },
               draggableIcon: {
                  backgroundColor: '#000',
               },
            }}>
            <View style={styles.audioRoutesBottomSheetContainer}>
               {audioRoutes.map(route => (
                  <Pressable
                     key={route.name}
                     contentContainerStyle={[styles.audioRouteItem, route.selected && styles.selectedAudioRouteItem]}
                     onPress={handleSelectAudioRoute(route)}>
                     <Text style={styles.audioRouteItemText}>{route.name}</Text>
                  </Pressable>
               ))}
            </View>
         </RBSheet>
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
   audioRouteItem: {
      padding: 15,
   },
   selectedAudioRouteItem: {
      backgroundColor: '#a2ddff',
   },
   audioRouteItemText: {
      marginLeft: 20,
      fontSize: 15,
      fontWeight: '500',
   },
});
