import React, { createRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
   CALL_CONVERSION_STATUS_ACCEPT,
   CALL_CONVERSION_STATUS_CANCEL,
   CALL_CONVERSION_STATUS_DECLINE,
   CALL_CONVERSION_STATUS_REQUEST,
   CALL_CONVERSION_STATUS_REQUEST_INIT,
   CALL_CONVERSION_STATUS_REQ_WAITING,
   CALL_STATUS_DISCONNECTED,
   CALL_STATUS_PERMISSION,
} from '../../Helper/Calls/Constant';
import { showCallModalToast } from '../../Helper/Calls/Utility';
import SDK from '../../SDK/SDK';
import IconButton from '../../common/IconButton';
import Modal, { ModalCenteredContent } from '../../common/Modal';
import ApplicationColors from '../../config/appColors';
import { getUserIdFromJid } from '../../helpers/chatHelpers';
import { callConversion } from '../../redux/callStateSlice';
import { useRoasterData } from '../../redux/reduxHook';
import { useRoasterData, useThemeColorPalatte } from '../../redux/reduxHook';
import commonStyles, { modelStyles } from '../../styles/commonStyles';

export let callConverisonInterval = createRef().current;
const CallConversionPopUp = props => {
   const {
      callConversionData,
      callConversionData: { status },
      remoteUserRequestingCallSwitch,
      currentUserRequestingCallSwitch,
      resetCallConversionRequestData,
      isPipMode,
   } = props;
   const {
      data: { callStatusText },
   } = useSelector(state => state.showConfrenceData, shallowEqual);
   const themeColorPalatte = useThemeColorPalatte();

   const [popUpData, setPopUpData] = React.useState({
      visible: false,
      title: '',
      cancelBtnLabel: '',
      confirmBtnLabel: '',
      confirmStatusToUpdate: '',
      cancelStatusToUpdate: '',
      permissionEnableSettings: '',
   });

   const prevCallConversionDataRef = React.useRef();
   const dispatch = useDispatch();
   let userID = getUserIdFromJid(callConversionData.fromUser);
   const userProfile = useRoasterData(userID);
   const nickName = userProfile?.nickName || userID || '';

   React.useEffect(() => {
      if (status === CALL_CONVERSION_STATUS_REQUEST_INIT) {
         // Request initiator
         setPopUpData({
            visible: true,
            title: 'Are you sure you want to switch to Video call?',
            cancelBtnLabel: 'CANCEL',
            confirmBtnLabel: 'SWITCH',
            confirmStatusToUpdate: CALL_CONVERSION_STATUS_REQ_WAITING,
         });
      } else if (status === CALL_CONVERSION_STATUS_REQ_WAITING) {
         // Request initiator
         setPopUpData({
            visible: true,
            title: 'Requesting to switch to video call.',
            cancelBtnLabel: 'CANCEL',
            cancelStatusToUpdate: CALL_CONVERSION_STATUS_CANCEL,
         });
         if (remoteUserRequestingCallSwitch) {
            handleAction(CALL_CONVERSION_STATUS_ACCEPT);
         }
      } else if (status === CALL_CONVERSION_STATUS_REQUEST) {
         // Request receiver
         setPopUpData({
            visible: true,
            title: `${nickName} Requesting to switch to video call`,
            cancelBtnLabel: 'DECLINE',
            confirmBtnLabel: 'ACCEPT',
            cancelStatusToUpdate: CALL_CONVERSION_STATUS_DECLINE,
            confirmStatusToUpdate: CALL_CONVERSION_STATUS_ACCEPT,
         });

         if (currentUserRequestingCallSwitch) {
            handleAction(CALL_CONVERSION_STATUS_ACCEPT);
         }
      } else if (status === CALL_CONVERSION_STATUS_ACCEPT) {
         resetCallConversionRequestData();
      } else if (status === CALL_STATUS_PERMISSION) {
         setPopUpData({
            visible: true,
            title: `Video Permission are needed for calling. Please enable it in Settings.`,
            permissionEnableSettings: 'OK',
         });
      }
   }, [status]);

   React.useEffect(() => {
      if (Platform.OS === 'android' && prevCallConversionDataRef.current) {
         if (!isPipMode) {
            setTimeout(() => {
               setPopUpData({
                  ...popUpData,
                  visible: !isPipMode,
               });
            }, 500);
         } else {
            setPopUpData({
               ...popUpData,
               visible: !isPipMode,
            });
         }
      }
   }, [isPipMode]);

   const handleAction = async statusToUpdate => {
      if (!statusToUpdate) {
         dispatch(callConversion());
         return;
      }
      let callConversionRes = null;
      if (statusToUpdate === CALL_CONVERSION_STATUS_ACCEPT) {
         if (callStatusText === CALL_STATUS_DISCONNECTED) return;
         resetConversionPopUp();
         SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
         callConversionRes = await SDK.acceptVideoCallSwitchRequest();
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         resetCallConversionRequestData();
         if (callConversionRes.statusCode === 200) return;
      } else if (statusToUpdate === CALL_CONVERSION_STATUS_REQUEST_INIT) {
         callConversionRes = await SDK.requestVideoCallSwitch();
      } else if (statusToUpdate === CALL_CONVERSION_STATUS_REQ_WAITING) {
         callConversionRes = await SDK.requestVideoCallSwitch();
      }
      if (callConversionRes && callConversionRes.statusCode === 500) {
         dispatch(callConversion({ status: CALL_STATUS_PERMISSION }));
         // When user accept the request & If camera access thrown error, then send the decline request.
         if (statusToUpdate === CALL_CONVERSION_STATUS_ACCEPT) {
            await SDK.declineVideoCallSwitchRequest();
         }
         return;
      }
      dispatch(callConversion({ ...callConversionData, status: statusToUpdate }));
      if (statusToUpdate === CALL_CONVERSION_STATUS_REQ_WAITING) {
         let timeLeft = 20;
         clearInterval(callConverisonInterval);
         callConverisonInterval = setInterval(async () => {
            if (timeLeft === 0) {
               clearInterval(callConverisonInterval);
               dispatch(callConversion({ status: CALL_CONVERSION_STATUS_CANCEL }));
               await SDK.cancelVideoCallSwitchRequest();
               resetCallConversionRequestData();
               showCallModalToast(`No response from ${nickName}`, 2500);
            } else {
               timeLeft = timeLeft - 1;
            }
         }, 1000);
      }
      if (statusToUpdate === CALL_CONVERSION_STATUS_DECLINE) {
         clearInterval(callConverisonInterval);
         await SDK.declineVideoCallSwitchRequest();
      }
      if (statusToUpdate === CALL_CONVERSION_STATUS_CANCEL) {
         clearInterval(callConverisonInterval);
         resetCallConversionRequestData();
         await SDK.cancelVideoCallSwitchRequest();
      }
   };

   const resetConversionPopUp = () => {
      clearInterval(callConverisonInterval); // Ensure callConverisonInterval is accessible in this scope
      dispatch(callConversion());
   };

   React.useEffect(() => {
      const prevCallConversionData = prevCallConversionDataRef.current;
      if (
         callConversionData &&
         prevCallConversionData?.status !== callConversionData.status &&
         [CALL_CONVERSION_STATUS_DECLINE, CALL_CONVERSION_STATUS_CANCEL, CALL_CONVERSION_STATUS_ACCEPT].includes(
            callConversionData.status,
         )
      ) {
         if (
            prevCallConversionData?.status === CALL_CONVERSION_STATUS_REQ_WAITING &&
            callConversionData.status === CALL_CONVERSION_STATUS_DECLINE
         ) {
            showCallModalToast(`Request declined`, 2500);
            resetCallConversionRequestData();
         }
         resetConversionPopUp();
      }
      prevCallConversionDataRef.current = callConversionData;
   }, [callConversionData]);

   const handlePermissionError = () => {
      dispatch(callConversion());
      openSettings();
   };

   return (
      <Modal visible={popUpData.visible} onRequestClose={() => {}}>
         <ModalCenteredContent onPressOutside={() => {}}>
            <View
               style={[
                  modelStyles.inviteFriendModalContentContainer,
                  commonStyles.bg_color(themeColorPalatte.screenBgColor),
               ]}>
               <Text style={styles.optionTitleText}>{popUpData.title}</Text>
               <View style={styles.buttonContainer}>
                  {popUpData.cancelBtnLabel && (
                     <IconButton
                        containerStyle={[
                           styles.containerStyle,
                           popUpData.confirmBtnLabel ? commonStyles.px_6 : commonStyles.px_12,
                        ]}
                        onPress={() => handleAction(popUpData.cancelStatusToUpdate)}>
                        <Text style={[styles.pressableText, commonStyles.typingText]}>{popUpData.cancelBtnLabel}</Text>
                     </IconButton>
                  )}
                  {popUpData.confirmBtnLabel && (
                     <IconButton
                        containerStyle={[styles.containerStyle, { marginRight: 12 }]}
                        onPress={() => handleAction(popUpData.confirmStatusToUpdate)}>
                        <Text style={[styles.pressableText, commonStyles.typingText]}>{popUpData.confirmBtnLabel}</Text>
                     </IconButton>
                  )}
                  {popUpData.permissionEnableSettings && (
                     <IconButton
                        containerStyle={[styles.containerStyle, { marginRight: 16 }]}
                        onPress={handlePermissionError}>
                        <Text style={[styles.pressableText, commonStyles.typingText]}>
                           {popUpData.permissionEnableSettings}
                        </Text>
                     </IconButton>
                  )}
               </View>
            </View>
         </ModalCenteredContent>
      </Modal>
   );
};

const styles = StyleSheet.create({
   optionTitleText: { fontSize: 16, color: '#000', marginVertical: 5, marginHorizontal: 20, lineHeight: 20 },
   buttonContainer: {
      flexDirection: 'row',
      flexGrow: 1,
      justifyContent: 'flex-end',
      paddingBottom: 6,
      marginTop: 10,
   },
   containerStyle: {
      borderRadius: 0,
   },
   pressableText: {
      fontWeight: '500',
      color: ApplicationColors.mainColor,
      paddingVertical: 2,
   },
});

export default CallConversionPopUp;
