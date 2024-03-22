import React, { useRef } from 'react';
import { ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { startIncomingCallTimer } from '../../Helper/Calls/Call';
import {
   answerIncomingCall,
   closeCallModalActivity,
   declineIncomingCall
} from '../../Helper/Calls/Utility';
import { capitalizeFirstLetter } from '../../Helper/Chat/Utility';
import CallsBg from '../../assets/calls-bg.png';
import Avathar from '../../common/Avathar';
import commonStyles from '../../common/commonStyles';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import CloseCallModalButton from '../components/CloseCallModalButton';
import GestureAnimationScreen from './GestureAnimationScreen';

const IncomingCall = ({ userId, userJid, callStatus }) => {
   const {
      connectionState: { callType },
      callerUUID: activeCallUUID = '',
   } = useSelector(state => state.callData) || {};
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userProfile.userId;
   const acceptButtonRef = useRef(false);
   const declineButtonRef = useRef(false);
   let userCallStatus = React.useMemo(() => {
      return capitalizeFirstLetter(callStatus) || '';
   }, [callStatus]);

   React.useEffect(() => {
      startIncomingCallTimer();
   }, []);

   const handleClosePress = () => {
      if (Platform.OS === 'android') {
         // dispatch(closeCallModal());
         closeCallModalActivity();
      }
   };

   // when user manually declined the call from the action buttons or swiping to decline the call
   const declineCall = async () => {
      if (!declineButtonRef.current) {
         declineButtonRef.current = true;
         declineIncomingCall();
      }
   };

   const acceptCall = async () => {
      if (!acceptButtonRef.current) {
         acceptButtonRef.current = true;
         answerIncomingCall(activeCallUUID);
      }
   };

   return (
      <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
         <View>
            {/* down arrow to close the modal */}
            <CloseCallModalButton onPress={handleClosePress} />
            {/* call status */}
            <View style={styles.callStatusWrapper}>
               <Text style={styles.callStatusText}> {userCallStatus} </Text>
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
         {callStatus?.includes('Incoming') && (
            <GestureHandlerRootView style={styles.actionButtonWrapper}>
               <GestureAnimationScreen acceptCall={acceptCall} declineCall={declineCall} callType={callType} />

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
      marginBottom: 20,
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
