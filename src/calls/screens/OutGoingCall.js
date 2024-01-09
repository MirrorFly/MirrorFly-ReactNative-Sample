import React from 'react';
import { ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { endCall, startOutgoingcallTimer } from '../../Helper/Calls/Call';
import { closeCallModalActivity } from '../../Helper/Calls/Utility';
import { capitalizeFirstLetter, getUserIdFromJid } from '../../Helper/Chat/Utility';
import OutgoingCallBg from '../../assets/OutgoingCallBg.png';
import Avathar from '../../common/Avathar';
import commonStyles from '../../common/commonStyles';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import CallControlButtons from '../components/CallControlButtons';
import CloseCallModalButton from '../components/CloseCallModalButton';
import ProfilePictureWithPulse from '../components/ProfilePictureWithPulse';

const OutGoingCall = () => {
   const { connectionState } = useSelector(state => state.callData) || {};
   const { to: userJid = '', callType } = connectionState;
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const { callStatusText: callStatus = '' } = confrenceData;

   const [outGoingCalls, setOutGoingCalls] = React.useState({
      callConnectionData: '',
      showMemberNames: false,
      callingUiStatus: 'Trying to connect',
   });

   const dispatch = useDispatch();
   let userID = getUserIdFromJid(userJid);
   const userProfile = useRosterData(userID);
   const nickName = userProfile.nickName || userID;

   React.useEffect(() => {
      // startRingingCallTone();
      if (connectionState && connectionState) {
         setOutGoingCalls({
            ...outGoingCalls,
            callConnectionData: connectionState,
         });
      }
      startOutgoingcallTimer(userID, callType);
      // uiChangetimer = _BackgroundTimer.setTimeout(() => {
      //    dispatch(
      //       updateConference({
      //          callStatusText: 'Unavailable',
      //       }),
      //    );
      //    setOutGoingCalls({
      //       ...outGoingCalls,
      //       callingUiStatus: 'Unavailable',
      //    });
      // }, 10000);
      // timer = setTimeout(() => {
      //    endCall(true);
      // }, 30000);
   }, []);

   // React.useEffect(() => {
   //    const backGroundNotificationRemove = async () => {
   //       // BackgroundTimer.setTimeout(() => {
   //       //    console.log('679000');
   //       // }, 2000);
   //       if (appState === false && callStatus !== 'Disconnected') {
   //          handleBackGround();
   //          // BackgroundTimer.clearTimeout(backGroundInterval);
   //          // handleBackGround();
   //          // backGroundInterval = BackgroundTimer.setTimeout(() => {
   //          // }, 200);
   //       } else {
   //          // BackgroundTimer.clearTimeout(backGroundInterval);
   //          // let getDisplayedNotification = await notifee.getDisplayedNotifications();
   //          // let cancelIDS = getDisplayedNotification?.find(res => res.id === notificationData.id)?.id;
   //          // cancelIDS && stopForegroundServiceNotification(cancelIDS);
   //       }
   //    };
   //    showCallModal && backGroundNotificationRemove();
   // }, [appState, notificationData]);

   const handleClosePress = () => {
      if (Platform.OS === 'android') {
         closeCallModalActivity();
         // dispatch(closeCallModal());
         // callNotifyHandler(connectionState.roomId, connectionState, userJid, nickName, 'OUTGOING_CALL');
      }
   };

   const handleAudioMute = () => {};

   let localVideoMuted = confrenceData.localVideoMuted;

   return (
      <ImageBackground style={styles.container} source={getImageSource(OutgoingCallBg)}>
         <View>
            {/* down arrow to close the modal */}
            <CloseCallModalButton onPress={handleClosePress} />
            {/* call status */}
            <View style={styles.callStatusWrapper}>
               <Text style={styles.callStatusText}>{capitalizeFirstLetter(callStatus)}</Text>
            </View>
            {/* user profile details */}
            <View style={styles.userDetailsContainer}>
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.userNameText}>
                  {nickName}
               </Text>
               <View style={[commonStyles.marginTop_30, commonStyles.positionRelative]}>
                  <ProfilePictureWithPulse animateToValue={1.5} baseStyle={styles.avatharPulseAnimatedView} />
                  <View style={[styles.avathar]}>
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
         </View>
         <View>
            {/* Call Control buttons (Mute & End & speaker) */}
            <CallControlButtons
               handleEndCall={endCall}
               handleAudioMute={handleAudioMute}
               // handleVideoMute={handleVideoMute}
               videoMute={!!localVideoMuted}
               // audioMute={true}
               // audioControl={audioControl}
               // videoControl={videoControl}
            />
         </View>
      </ImageBackground>
   );
};

export default OutGoingCall;
const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'gray',
      justifyContent: 'space-between',
   },
   callStatusWrapper: {
      marginTop: 30,
      alignItems: 'center',
   },
   callStatusText: {
      fontSize: 14,
      color: '#DEDEDE',
   },
   userDetailsContainer: {
      marginTop: 14,
      alignItems: 'center',
   },
   userNameText: {
      fontSize: 18,
      color: ApplicationColors.white,
      width: '80%',
      textAlign: 'center',
   },
   avatharPulseAnimatedView: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 70,
      zIndex: 0,
      backgroundColor: 'rgba(255,255,255,0.7)',
   },
   avathar: {
      width: 90,
      height: 90,
      borderRadius: 50,
      zIndex: 10,
      elevation: 3,
      justifyContent: 'center',
      alignItems: 'center',
   },
   animatedStyle: {
      width: 90,
      height: 90,
      position: 'absolute',
   },
});
