import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { disconnectCallConnection } from '../../Helper/Calls/Call';
import { CALL_STATUS_DISCONNECTED, CALL_STATUS_RECONNECT } from '../../Helper/Calls/Constant';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import CallsBg from '../../assets/calls-bg.png';
import Avathar from '../../common/Avathar';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import { resetCallStateData } from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import CallControlButtons from '../components/CallControlButtons';
import CloseCallModalButton from '../components/CloseCallModalButton';
import PulseAnimatedView from '../components/PulseAnimatedView';
import { formatUserIdToJid, getLocalUserDetails } from '../../Helper/Chat/ChatHelper';
import Timer from '../components/Timer';

const OnGoingCall = () => {
   const isCallConnected = true;
   const { connectionState: callData = {} } = useSelector(state => state.callData) || {};
   const { data: showConfrenceData = {}, data: { remoteStream = [] } = {} } =
      useSelector(state => state.showConfrenceData) || {};

   const userId = getUserIdFromJid(callData.userJid || callData.to);
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userId || '';

   const handleClosePress = () => {
      // dispatch(closeCallModal());
   };

   const handleHangUp = async e => {
      await endCall();
   };

   const getCallStatus = userid => {
      const data = showConfrenceData || {};
      if (data.callStatusText === CALL_STATUS_DISCONNECTED || data.callStatusText === CALL_STATUS_RECONNECT)
         return data.callStatusText;
      let vcardData = getLocalUserDetails();
      let currentUser = vcardData.fromUser;
      if (!userid) {
         userid = formatUserIdToJid(currentUser);
      }
      const user = remoteStream.find(item => item.fromJid === userid);
      return user?.status;
   };

   const endCall = async () => {
      disconnectCallConnection(); //hangUp calls
      Store.dispatch(resetCallStateData());
   };

   let callStatus = getCallStatus();

   return (
      <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
         <View>
            {/* down arrow to close the modal */}
            <CloseCallModalButton onPress={handleClosePress} />
            {/* call status */}
            <View style={styles.callUsersWrapper}>
               {isCallConnected ? (
                  <Text style={styles.callUsersText}>{`You and ${nickName}`}</Text>
               ) : (
                  <Text style={styles.callUsersText}>Connecting...</Text>
               )}
            </View>
            {/* user profile details and call timer */}
            <View style={styles.userDetailsContainer}>
               {/* {callStatus && callStatus.toLowerCase() == CALL_STATUS_RECONNECT &&} */}
               <Timer callStatus={callStatus} />
               {/* <Text style={styles.callTimeText}>{callTime}</Text> */}
               <View style={styles.avatharWrapper}>
                  {/* Pulse animation view here */}
                  {/* <Animated.View
              style={[
                styles.avatharPulseAnimatedView,
                { transform: [{ scale: 1 }] }, // apply scale from 1 to 1.3
              ]}
            /> */}
                  <PulseAnimatedView animateToValue={1.3} baseStyle={styles.avatharPulseAnimatedView} />
                  <Avathar
                     width={90}
                     height={90}
                     backgroundColor={userProfile.colorCode}
                     data={nickName}
                     profileImage={userProfile.image}
                  />
               </View>
            </View>
         </View>
         <View>
            {/* Call Control buttons (Mute & End & speaker) */}
            <CallControlButtons
               handleEndCall={handleHangUp}
               // handleAudioMute={handleAudioMute}
               // handleVideoMute={handleVideoMute}
               // videoMute={!!localVideoMuted}
               // audioMute={true}
               // audioControl={audioControl}
               // videoControl={videoControl}
            />
         </View>
      </ImageBackground>
   );
};

export default OnGoingCall;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'gray',
      justifyContent: 'space-between',
   },
   callUsersWrapper: {
      marginTop: 30,
      alignItems: 'center',
   },
   callUsersText: {
      fontSize: 14,
      color: ApplicationColors.white,
   },
   userDetailsContainer: {
      marginTop: 10,
      alignItems: 'center',
   },
   callTimeText: {
      fontSize: 12,
      color: ApplicationColors.white,
   },
   avatharWrapper: {
      marginTop: 10,
      width: 90 + 27, // 90 is the width of actual avathar + 27 is the additional width of pulse animation for the scale size of 1.30 for width 90
      height: 90 + 27, // 90 is the height of actual avathar + 27 is the additional width of pulse animation for the scale size of 1.30 for height 90
      borderRadius: 70,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
   },
   avatharPulseAnimatedView: {
      position: 'absolute',
      top: 27 / 2, // additional width / 2 to make the animated view perfectly into the place
      width: 90,
      height: 90,
      borderRadius: 70,
      backgroundColor: '#9d9d9d5f',
   },
   actionButtonWrapper: {
      marginBottom: 80,
      flexDirection: 'row',
      justifyContent: 'space-around',
   },
   actionButton: {
      width: 100,
      height: 50,
      backgroundColor: 'salmon',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
   },
   greenButton: {
      backgroundColor: '#4DDB64',
   },
   redButton: {
      backgroundColor: '#FB2B48',
   },
   actionButtonText: {
      color: ApplicationColors.white,
   },
});
