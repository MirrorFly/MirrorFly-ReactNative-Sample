import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import { dispatchDisconnected, stopRingingCallTone } from '../../Helper/Calls/Call';
import { CALL_AGAIN_SCREEN, DISCONNECTED_SCREEN_DURATION } from '../../Helper/Calls/Constant';
import { capitalizeFirstLetter, getUserIdFromJid } from '../../Helper/Chat/Utility';
import { resetCallData } from '../../SDKActions/callbacks';
import OutgoingCallBg from '../../assets/OutgoingCallBg.png';
import Avathar from '../../common/Avathar';
import commonStyles from '../../common/commonStyles';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import { closeCallModal, setCallModalScreen } from '../../redux/Actions/CallAction';
import { updateCallAgainData } from '../../redux/Actions/CallAgainAction';
import Store from '../../redux/store';
import CallControlButtons from '../components/CallControlButtons';
import CloseCallModalButton from '../components/CloseCallModalButton';
import ProfilePictureWithPulse from '../components/ProfilePictureWithPulse';

const OutGoingCall = () => {
   const { showCallModal, connectionState } = useSelector(state => state.callData) || {};
   const { to: userJid = '', callType } = connectionState;
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const { callStatusText: callStatus = '' } = confrenceData;
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
            callingUiStatus: 'Unavailable',
         });
      }, 10000);
      timer = setTimeout(() => {
         endCall(true);
      }, 30000);

      return () => {
         clearTimeout(timer);
         clearTimeout(uiChangetimer);
         // stopRingingCallTone();
      };
   }, []);

   const endCall = async (isFromTimeout = false) => {
      const callConnectionDataEndCall = connectionState?.data;
      SDK.endCall();
      // endCallAction();
      dispatchDisconnected();
      // callLogs.update(callConnectionDataEndCall.roomId, {
      //     "endTime": callLogs.initTime(),
      //     "sessionStatus": CALL_SESSION_STATUS_CLOSED
      // });
      if (isFromTimeout) {
         resetCallData();
         const _userID = userID;
         const _callType = callType;
         updateCallAgainScreenData(_userID, _callType);
      } else {
         setTimeout(() => {
            resetCallData();
            Store.dispatch(closeCallModal());
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
      }
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
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.userNameText}>
                  {nickName}
               </Text>
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
   avathar: {
      width: 90,
      height: 90,
      borderRadius: 50,
      backgroundColor: '#9D9D9D',
      justifyContent: 'center',
      alignItems: 'center',
   },
   animatedStyle: {
      width: 90,
      height: 90,
      position: 'absolute',
   },
});
