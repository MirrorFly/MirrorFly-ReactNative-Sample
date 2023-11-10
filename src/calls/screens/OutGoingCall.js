import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { dispatchDisconnected, stopRingingCallTone } from '../../Helper/Calls/Call';
import { DISCONNECTED_SCREEN_DURATION } from '../../Helper/Calls/Constant';
import { batch, useDispatch, useSelector } from 'react-redux';
import { dispatchDisconnected } from '../../Helper/Calls/Call';
import { CALL_AGAIN_SCREEN, DISCONNECTED_SCREEN_DURATION } from '../../Helper/Calls/Constant';
import { capitalizeFirstLetter, getUserIdFromJid } from '../../Helper/Chat/Utility';
import { resetCallData } from '../../SDKActions/callbacks';
import OutgoingCallBg from '../../assets/OutgoingCallBg.png';
import Avathar from '../../common/Avathar';
import { EndCallIcon } from '../../common/Icons';
import commonStyles from '../../common/commonStyles';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import { closeCallModal, setCallModalScreen, updateConference } from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import CallControlButtons from '../components/CallControlButtons';
import CloseCallModalButton from '../components/CloseCallModalButton';
import ProfilePictureWithPulse from '../components/ProfilePictureWithPulse';
import { updateCallAgainData } from '../../redux/Actions/CallAgainAction';

const OutGoingCall = () => {
   const { showCallModal, connectionState } = useSelector(state => state.callData) || {};
   const { to: userJid = '', callType } = connectionState;
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const { callStatusText: callStatus = '' } = confrenceData;
   console.log(confrenceData, 'confrenceData');
   console.log(connectionState, 'connectionState');
   let timer = null;
   let uiChangetimer = null;

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
      uiChangetimer = setTimeout(() => {
         setOutGoingCalls({
            ...outGoingCalls,
            callingUiStatus: 'User seems to be offline, Trying to connect',
         });
      }, 10000);
      timer = setTimeout(() => {
         endCall(true);
      }, 30000);

      return () => {
         // stopAudio();
         clearTimeout(timer);
         clearTimeout(uiChangetimer);
         stopRingingCallTone();
      };
   }, []);

   const endCall = async (isFromTimeout = false) => {
      // stopAudio();
      const callConnectionDataEndCall = connectionState?.data;
      SDK.endCall();
      // endCallAction();
      dispatchDisconnected();
      // callLogs.update(callConnectionDataEndCall.roomId, {
      //     "endTime": callLogs.initTime(),
      //     "sessionStatus": CALL_SESSION_STATUS_CLOSED
      // });
      setTimeout(() => {
         // encryptAndStoreInLocalStorage('callingComponent',false)
         // deleteItemFromLocalStorage('roomName')
         // deleteItemFromLocalStorage('callType')
         // deleteItemFromLocalStorage('call_connection_status')
         // encryptAndStoreInLocalStorage("hideCallScreen", false);
         resetCallData();
         if (isFromTimeout) {
            const _userID = userID;
            const _callType = callType;
            updateCallAgainScreenData(_userID, _callType);
         } else {
            Store.dispatch(closeCallModal());
         }
         // batch(()=>{
         //     Store.dispatch(showConfrence({
         //         showComponent: false,
         //         screenName:'',
         //         showCalleComponent:false,
         //         stopSound: true,
         //         callStatusText: null
         //     }))
         // })
      }, DISCONNECTED_SCREEN_DURATION);
   };

   const updateCallAgainScreenData = (userID, callType) => {
      batch(() => {
         dispatch(
            updateCallAgainData({
               callType,
               userId: userID,
            }),
         );
         dispatch(setCallModalScreen(CALL_AGAIN_SCREEN));
      });
   };

   const handleEndCall = () => {
      endCall();
   };

   const handleClosePress = () => {};

   const handleAudioMute = () => {};

   let localVideoMuted = confrenceData.localVideoMuted;

   return (
      <ImageBackground style={styles.container} source={getImageSource(OutgoingCallBg)}>
         <View>
            {/* down arrow to close the modal */}
            <CloseCallModalButton onPress={handleClosePress} />
            {/* call status */}
            <View style={styles.callStatusWrapper}>
               <Text style={styles.callStatusText}>
                  {callStatus === 'Calling' ? outGoingCalls.callingUiStatus : capitalizeFirstLetter(callStatus)}
               </Text>
            </View>
            {/* user profile details */}
            <View style={styles.userDetailsContainer}>
               <Text style={styles.userNameText}>{nickName}</Text>
               <View style={[commonStyles.marginTop_30, commonStyles.positionRelative]}>
                  <Avathar
                     width={90}
                     height={90}
                     backgroundColor={userProfile.colorCode}
                     data={nickName}
                     profileImage={userProfile.image}
                  />
                  <ProfilePictureWithPulse baseStyle={styles.animatedStyle} startDelay={1000} iterations={1} />
               </View>
            </View>
         </View>
         <View>
            {/* Call Control buttons (Mute & End & speaker) */}
            <CallControlButtons
               // handleEndCall={endCall}
               handleAudioMute={handleAudioMute}
               // handleVideoMute={handleVideoMute}
               videoMute={!!localVideoMuted}
               // audioMute={true}
               // audioControl={audioControl}
               // videoControl={videoControl}
            />
            {/* call action buttons (Accept & Reject) */}
            <GestureHandlerRootView style={styles.actionButtonWrapper}>
               <RectButton onPress={handleEndCall} style={[styles.actionButton, styles.redButton]}>
                  <EndCallIcon />
               </RectButton>
            </GestureHandlerRootView>
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
      marginBottom: 30,
      flexDirection: 'row',
      justifyContent: 'space-around',
   },
   actionButton: {
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
   animatedStyle: {
      width: 90,
      height: 90,
      position: 'absolute',
   },
});
