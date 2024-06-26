import React from 'react';
import { StyleSheet, View } from 'react-native';
import Avathar from '../../common/Avathar';
import { AudioMuteIcon } from '../../common/Icons';
import Pressable from '../../common/Pressable';
import { CALL_STATUS_RECONNECT } from '../../helpers/constants';
import { useRoasterData } from '../../redux/reduxHook';
import PulseAnimatedView from './PulseAnimatedView';
import VideoComponent from './VideoComponent';

const BigVideoTile = ({
   userId,
   isAudioMuted,
   videoMuted,
   callStatus = '',
   stream,
   onPressAnywhere,
   isFrontCameraEnabled,
   localUserJid,
}) => {
   let reconnectStatus =
      callStatus && callStatus?.toLowerCase() === CALL_STATUS_RECONNECT && userId !== localUserJid ? true : false;
   const userProfile = useRoasterData(userId) || {};
   const nickName = userProfile.nickName || userId || '';

   const renderAudioMuted = React.useMemo(() => {
      return (
         isAudioMuted &&
         !reconnectStatus && (
            <View
               style={[
                  {
                     justifyContent: 'center',
                     alignItems: 'center',
                     position: 'absolute',
                     top: 0,
                     right: 0,
                     left: 0,
                     bottom: 0,
                  },
               ]}>
               <View style={styles.audioMuteIconWrapper}>
                  <AudioMuteIcon width={16} height={22} color={'#fff'} />
               </View>
            </View>
         )
      );
   }, [isAudioMuted]);

   return (
      <>
         {!videoMuted && stream && stream?.video && !reconnectStatus && (
            <Pressable
               onPress={onPressAnywhere}
               pressedStyle={{}}
               style={{
                  flex: 1,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
               }}
               contentContainerStyle={{ flex: 1 }}>
               <VideoComponent stream={stream} isFrontCameraEnabled={isFrontCameraEnabled} zIndex={0} />
               {renderAudioMuted}
            </Pressable>
         )}
         {(videoMuted || reconnectStatus || !stream || !stream.video) && (
            <View style={styles.avatharWrapper}>
               {/* Pulse animation view here */}
               <PulseAnimatedView animateToValue={1.3} baseStyle={styles.avatharPulseAnimatedView} />
               <Avathar
                  width={90}
                  height={90}
                  backgroundColor={userProfile.colorCode}
                  data={nickName}
                  profileImage={userProfile.image}
               />
               {isAudioMuted && (
                  <View style={styles.audioMuteIconContainer}>
                     <View style={styles.audioMuteIconWrapper}>
                        <AudioMuteIcon width={16} height={22} color={'#fff'} />
                     </View>
                  </View>
               )}
            </View>
         )}
      </>
   );
};

export default BigVideoTile;

const profilePulseAdditionalWidth = 27;

const styles = StyleSheet.create({
   avatharWrapper: {
      marginTop: 10,
      width: 90 + profilePulseAdditionalWidth, // 90 is the width of actual avathar + 27 is the additional width of pulse animation for the scale size of 1.30 for width 90
      height: 90 + profilePulseAdditionalWidth, // 90 is the height of actual avathar + 27 is the additional width of pulse animation for the scale size of 1.30 for height 90
      borderRadius: 70,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
   },
   avatharPulseAnimatedView: {
      position: 'absolute',
      top: profilePulseAdditionalWidth / 2, // additional width / 2 to make the animated view perfectly into the place
      width: 90,
      height: 90,
      borderRadius: 70,
      backgroundColor: '#9d9d9d5f',
   },
   audioMuteIconContainer: {
      position: 'absolute',
      top: profilePulseAdditionalWidth / 2,
      width: 90,
      height: 90,
      justifyContent: 'center',
      alignItems: 'center',
   },
   audioMuteIconWrapper: {
      width: 45,
      height: 45,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 30,
      backgroundColor: 'rgba(0,0,0,0.3)',
   },
});
