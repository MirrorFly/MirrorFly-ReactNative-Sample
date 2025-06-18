import { debounce } from 'lodash-es';
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSelector } from 'react-redux';
import { setSelectedAudioRoute } from '../../Helper/Calls/Call';
import {
   AUDIO_ROUTE_BLUETOOTH,
   AUDIO_ROUTE_HEADSET,
   AUDIO_ROUTE_PHONE,
   AUDIO_ROUTE_SPEAKER,
   CALL_STATUS_DISCONNECTED,
   CALL_TYPE_VIDEO,
} from '../../Helper/Calls/Constant';
import { audioRouteNameMap, switchCamera, updateAudioRouteTo, updateCallAudioMute } from '../../Helper/Calls/Utility';
import {
   AudioMuteIcon,
   AudioUnMuteIcon,
   BluetoothIcon,
   CallHeadsetIcon,
   CameraDisabledIcon,
   CameraEnabledIcon,
   EndCallIcon,
   SpeakerEnableIcon,
   VideoMuteIcon,
   VideoUnMuteIcon,
} from '../../common/Icons';
import Pressable from '../../common/Pressable';
import RNCallKeep from '../../customModules/CallKitModule';
import PropTypes from 'prop-types';

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

const CallControlButtons = ({ callStatus, handleEndCall, callType, handleVideoMute }) => {
   let endActionButtonRef = useRef(false);
   const RBSheetRef = useRef(null);

   const [audioRoutes, setAudioRoutes] = React.useState([]);
   const audioRouteUpdateNeeded = React.useRef(true);

   const { isAudioMuted, isVideoMuted, selectedAudioRoute, isFrontCameraEnabled, currentDeviceAudioRouteState } =
      useSelector(state => state.callControlsData);

   const { callerUUID } = useSelector(state => state.callData) || {};

   const audioRouteIcon = React.useMemo(() => {
      switch (selectedAudioRoute) {
         case '': // receiver
            return <SpeakerEnableIcon color={'#fff'} />;
         case AUDIO_ROUTE_SPEAKER:
            return <SpeakerEnableIcon color={'#000'} />;
         case AUDIO_ROUTE_HEADSET:
            return <CallHeadsetIcon />;
         case AUDIO_ROUTE_BLUETOOTH:
            return <BluetoothIcon />;
         default:
            return <SpeakerEnableIcon />;
      }
   }, [selectedAudioRoute]);

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
               _routes.sort(sortAudioRoutes);
               setAudioRoutes(_routes);
            } else if (_routes.length > 2) {
               const filteredRoutes = _routes.filter(r => r.type !== AUDIO_ROUTE_PHONE);
               filteredRoutes.sort(sortAudioRoutes);
               setAudioRoutes(filteredRoutes);
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
      handleVideoMute(_videoMuted, callerUUID);
   };

   const handleSelectedRoutes = () => {
      if (audioRouteUpdateNeeded.current && RBSheetRef?.current?.state?.modalVisible) {
         RNCallKeep.getAudioRoutes().then(_routes => {
            /** sample data from 'getAudioRoutes' method
             * const sampleAudioRoutes = [
               { "name": "Speaker", "type": "Speaker" },
               { "name": "iPhone Microphone", "type": "Phone" },
               { "name": "Headset Microphone", "selected": true, "type": "Headset" }
            ]; */
            if (Array.isArray(_routes)) {
               if (_routes.length === 2) {
                  _routes.sort(sortAudioRoutes);
                  setAudioRoutes(_routes);
               } else if (_routes.length > 2) {
                  const filteredRoutes = _routes.filter(r => r.type !== AUDIO_ROUTE_PHONE);
                  filteredRoutes.sort(sortAudioRoutes);
                  setAudioRoutes(filteredRoutes);
               }
            }
         });
      }
      audioRouteUpdateNeeded.current = true;
   };

   React.useEffect(() => {
      //for changing the popup route values when headset and blutooth value changes automatically
      const debouncedHandleSelectedPopupRoutes = debounce(handleSelectedRoutes, 180);
      debouncedHandleSelectedPopupRoutes();
   }, [selectedAudioRoute, currentDeviceAudioRouteState]);

   const handleSelectAudioRoute = _audioRoute => () => {
      audioRouteUpdateNeeded.current = false;
      RBSheetRef.current?.close?.();
      setSelectedAudioRoute(_audioRoute.name);
      updateAudioRouteTo(_audioRoute.name, _audioRoute.type, callerUUID);
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
                  style={[styles.actionButton, selectedAudioRoute && styles.activeButton]}>
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
            animationType="none"
            ref={RBSheetRef}
            closeOnDragDown={true}
            closeOnPressMask={true}
            customStyles={{
               container: {
                  height: audioRoutes.length * 50 + 50,
               },
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
                     contentContainerStyle={[
                        styles.audioRouteItem,
                        selectedAudioRoute === audioRouteNameMap[route.type] && styles.selectedAudioRouteItem,
                     ]}
                     onPress={handleSelectAudioRoute(route)}>
                     <Text style={styles.audioRouteItemText}>{route.type}</Text>
                  </Pressable>
               ))}
            </View>
         </RBSheet>
      </>
   );
};

CallControlButtons.propTypes = {
   callStatus: PropTypes.string,
   handleEndCall: PropTypes.func,
   callType: PropTypes.string,
   handleVideoMute: PropTypes.func,
};

export default React.memo(CallControlButtons);

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
