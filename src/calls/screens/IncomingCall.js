import React, { useRef } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { dispatchDisconnected } from '../../Helper/Calls/Call';
import { CALL_RINGING_DURATION, CALL_STATUS_INCOMING, DISCONNECTED_SCREEN_DURATION } from '../../Helper/Calls/Constant';
import { answerIncomingCall, declineIncomingCall } from '../../Helper/Calls/Utility';
import SDK from '../../SDK/SDK';
import { resetCallData } from '../../SDKActions/callbacks';
import CallsBg from '../../assets/calls-bg.png';
import Avathar from '../../common/Avathar';
import commonStyles from '../../common/commonStyles';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import { resetCallStateData } from '../../redux/Actions/CallAction';
import CloseCallModalButton from '../components/CloseCallModalButton';
import { capitalizeFirstLetter } from '../../Helper/Chat/Utility';

let autoCallEndInterval;

const IncomingCall = ({ userId, callStatus }) => {
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userProfile.userId;
   const acceptButtonRef = useRef(false);
   const declineButtonRef = useRef(false);
   const dispatch = useDispatch();

   let userCallStatus = React.useMemo(() => {
      return capitalizeFirstLetter(callStatus) || '';
   }, [callStatus]);

   React.useEffect(() => {
      autoCallEndInterval = setTimeout(() => {
         endCall();
      }, CALL_RINGING_DURATION);
      return () => {
         clearTimeout(autoCallEndInterval);
      };
   }, []);

   const handleClosePress = () => {
      // dispatch(closeCallModal());
   };

   // when user not attending the call and the timeout has been reached
   const endCall = async () => {
      clearTimeout(autoCallEndInterval);
      SDK.endCall();
      dispatchDisconnected('');
      // TODO: update the Call logs when implementing
      // callLogs.update(callConnectionDate.data.roomId, {
      //     "endTime": callLogs.initTime(),
      //     "sessionStatus": CALL_SESSION_STATUS_CLOSED
      // });
      setTimeout(() => {
         resetCallData();
         dispatch(resetCallStateData());
      }, DISCONNECTED_SCREEN_DURATION);
   };

   // when user manually declined the call from the action buttons or swiping to decline the call
   const declineCall = async () => {
      if (!declineButtonRef.current) {
         declineButtonRef.current = true;
         clearTimeout(autoCallEndInterval);
         declineIncomingCall();
      }
   };

   const acceptCall = async () => {
      if (!acceptButtonRef.current) {
         acceptButtonRef.current = true;
         clearTimeout(autoCallEndInterval);
         answerIncomingCall();
      }
   };

   return (
      <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
         <View>
            {/* down arrow to close the modal */}
            <CloseCallModalButton onPress={handleClosePress} />
            {/* call status */}
            <View style={styles.callStatusWrapper}>
               <Text style={styles.callStatusText}>{userCallStatus}</Text>
            </View>
            {/* user profile details */}
            <View style={styles.userDetailsContainer}>
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.userNameText}>
                  {nickName}
               </Text>
               <View style={commonStyles.marginTop_15}>
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
         {/* call action buttons (Accept & Reject) */}
         {callStatus === CALL_STATUS_INCOMING && (
            <GestureHandlerRootView style={styles.actionButtonWrapper}>
               <RectButton onPress={declineCall} style={[styles.actionButton, styles.redButton]}>
                  <Text style={styles.actionButtonText}>Reject</Text>
               </RectButton>
               <RectButton onPress={acceptCall} style={[styles.actionButton, styles.greenButton]}>
                  <Text style={styles.actionButtonText}>Accept</Text>
               </RectButton>
            </GestureHandlerRootView>
         )}
      </ImageBackground>
   );
};

export default IncomingCall;

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
   avathar: {
      width: 90,
      height: 90,
      borderRadius: 50,
      backgroundColor: '#9D9D9D',
      justifyContent: 'center',
      alignItems: 'center',
   },
   actionButtonWrapper: {
      marginBottom: 80,
      flexDirection: 'row',
      justifyContent: 'space-around',
   },
   actionButton: {
      width: 100,
      height: 50,
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
