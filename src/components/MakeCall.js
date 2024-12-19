import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { ALREADY_ON_CALL, CALL_TYPE_AUDIO, CALL_TYPE_VIDEO } from '../Helper/Calls/Constant';
import { initiateMirroflyCall, isRoomExist } from '../Helper/Calls/Utility';
import { RealmKeyValueStore } from '../SDK/SDK';
import IconButton from '../common/IconButton';
import { AudioCall, VideoCallIcon } from '../common/Icons';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import { useNetworkStatus } from '../common/hooks';
import {
   requestBluetoothConnectPermission,
   requestCameraMicPermission,
   requestMicroPhonePermission,
} from '../common/permissions';
import ApplicationColors from '../config/appColors';
import { MIX_BARE_JID, audioRecord } from '../helpers/constants';
import { closePermissionModal } from '../redux/permissionSlice';
import { useAudioRecording, useBlockedStatus } from '../redux/reduxHook';

function MakeCall({ chatUser, userId }) {
   const dispatch = useDispatch();
   const isNetworkConnected = useNetworkStatus();
   const permissionData = useSelector(state => state.permissionData.permissionStatus);
   const [permissionText, setPermissionText] = React.useState('');
   const [showRoomExist, setShowRoomExist] = React.useState(false);
   const blockedStaus = useBlockedStatus(userId);
   const isAudioRecording = useAudioRecording(userId);
   const isCallDisabled = Boolean(blockedStaus) || isAudioRecording === audioRecord.RECORDING;

   const makeOne2OneCall = async callType => {
      let isPermissionChecked = false;
      if (callType === CALL_TYPE_AUDIO) {
         isPermissionChecked = await RealmKeyValueStore.getItem('microPhone_Permission');
         RealmKeyValueStore.setItem('microPhone_Permission', 'true');
      } else {
         isPermissionChecked = await RealmKeyValueStore.getItem('camera_microPhone_Permission');
         RealmKeyValueStore.setItem('camera_microPhone_Permission', 'true');
      }
      // updating the SDK flag to keep the connection Alive when app goes background because of microphone permission popup
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
      try {
         const result =
            callType === CALL_TYPE_AUDIO ? await requestMicroPhonePermission() : await requestCameraMicPermission();
         const bluetoothPermission = await requestBluetoothConnectPermission();
         // updating the SDK flag back to false to behave as usual
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         if ((result === 'granted' || result === 'limited') && bluetoothPermission === 'granted') {
            // Checking If Room exist when user granted permission
            if (!isRoomExist()) {
               initiateMirroflyCall(callType, [userId]);
            } else {
               setShowRoomExist(true);
            }
         } else if (isPermissionChecked) {
            let cameraAndMic = await checkVideoCallPermission();
            let audioBluetoothPermission = await checkAudioCallpermission();
            let permissionStatus =
               callType === 'video'
                  ? `${cameraAndMic}${' are needed for calling. Please enable it in Settings'}`
                  : `${audioBluetoothPermission}${' are needed for calling. Please enable it in Settings'}`;
            setPermissionText(permissionStatus);
            dispatch(showPermissionModal());
         }
      } catch (error) {
         // updating the SDK flag back to false to behave as usual
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         console.log('makeOne2OneCall', error);
      }
   };

   const makeOne2OneAudioCall = () => {
      if (!isRoomExist() && isNetworkConnected) {
         makeOne2OneCall(CALL_TYPE_AUDIO);
      } else if (!isNetworkConnected) {
         showToast('Please check your internet connection');
      } else {
         setShowRoomExist(true);
      }
   };

   const closeIsRoomExist = () => {
      setShowRoomExist(false);
   };

   const makeOne2OneVideoCall = () => {
      if (!isRoomExist() && isNetworkConnected) {
         makeOne2OneCall(CALL_TYPE_VIDEO);
      } else if (!isNetworkConnected) {
         showToast('Please check your internet connection');
      } else {
         setShowRoomExist(true);
      }
   };

   const renderRoomExistModal = () => {
      return (
         <>
            {/* display modal already in the call */}
            <Modal visible={showRoomExist} onRequestClose={closeIsRoomExist}>
               <ModalCenteredContent onPressOutside={closeIsRoomExist}>
                  <View style={styles.callModalContentContainer}>
                     <Text style={styles.callModalContentText} numberOfLines={1}>
                        {ALREADY_ON_CALL}
                     </Text>
                     <View style={styles.callModalHorizontalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={styles.deleteModalHorizontalActionButton}
                           onPress={() => closeIsRoomExist()}>
                           <Text style={styles.deleteModalActionButtonText}>OK</Text>
                        </Pressable>
                     </View>
                  </View>
               </ModalCenteredContent>
            </Modal>
            {/* display permission Model */}
            {permissionData && (
               <Modal visible={permissionData}>
                  <ModalCenteredContent>
                     <View style={styles.callModalContentContainer}>
                        <Text style={styles.callModalContentText}>{permissionText}</Text>
                        <View style={styles.callModalHorizontalActionButtonsContainer}>
                           <Pressable
                              contentContainerStyle={styles.deleteModalHorizontalActionButton}
                              onPress={() => {
                                 openSettings();
                                 dispatch(closePermissionModal());
                              }}>
                              <Text style={styles.deleteModalActionButtonText}>OK</Text>
                           </Pressable>
                        </View>
                     </View>
                  </ModalCenteredContent>
               </Modal>
            )}
         </>
      );
   };

   return (
      <>
         {!MIX_BARE_JID.test(chatUser) && (
            <IconButton disabled={isCallDisabled} onPress={makeOne2OneVideoCall} containerStyle={{ marginRight: 6 }}>
               <VideoCallIcon fill={blockedStaus ? '#959595' : '#181818'} />
            </IconButton>
         )}
         {!MIX_BARE_JID.test(chatUser) && (
            <IconButton disabled={isCallDisabled} onPress={makeOne2OneAudioCall}>
               <AudioCall fill={blockedStaus ? '#959595' : '#181818'} />
            </IconButton>
         )}
         {renderRoomExistModal()}
      </>
   );
}

export default MakeCall;

const styles = StyleSheet.create({
   deleteModalContentContainer: {
      width: '88%',
      paddingHorizontal: 24,
      paddingVertical: 16,
      fontWeight: '300',
      backgroundColor: ApplicationColors.mainbg,
   },
   deleteModalContentText: {
      fontSize: 16,
      fontWeight: '400',
      color: ApplicationColors.modalTextColor,
      marginTop: 10,
   },
   deleteModalCheckboxLabel: {
      fontSize: 14,
      fontWeight: '400',
   },
   deleteModalVerticalActionButtonsContainer: {
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      paddingTop: 20,
   },
   deleteModalVerticalActionButton: {
      marginBottom: 16,
      paddingVertical: 4,
      paddingHorizontal: 8,
   },
   deleteModalActionButtonText: {
      color: ApplicationColors.mainColor,
      fontWeight: '600',
   },
   callModalContentText: {
      fontSize: 16,
      fontWeight: '400',
      marginBottom: 10,
      color: ApplicationColors.black,
   },
   callModalContentContainer: {
      width: '88%',
      paddingHorizontal: 24,
      paddingTop: 18,
      fontWeight: '300',
      backgroundColor: ApplicationColors.mainbg,
   },
   callModalHorizontalActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingVertical: 14,
   },
   deleteModalHorizontalActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingVertical: 12,
   },
   deleteModalHorizontalActionButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
   },
});
