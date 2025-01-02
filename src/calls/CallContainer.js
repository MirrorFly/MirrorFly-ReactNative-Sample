import React, { createRef } from 'react';
import { Modal, Platform, View } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { enablePipModeIfCallConnected } from '../Helper';
import {
   CALL_AGAIN_SCREEN,
   CALL_CONVERSION_STATUS_ACCEPT,
   CALL_CONVERSION_STATUS_CANCEL,
   CALL_CONVERSION_STATUS_DECLINE,
   CALL_CONVERSION_STATUS_REQUEST,
   CALL_CONVERSION_STATUS_REQ_WAITING,
   INCOMING_CALL_SCREEN,
   ONGOING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import { closeCallModalActivity, resetCallModalActivity } from '../Helper/Calls/Utility';
import { usePipModeListener } from '../customModules/PipModule';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { resetCallAgainData } from '../redux/callAgainSlice';
import { openCallModal } from '../redux/callStateSlice';
import commonStyles from '../styles/commonStyles';
import CallConversionPopUp from './components/CallConversionPopUp';
import CallModalToastContainer from './components/CallModalToastContainer';
import CallAgain from './screens/CallAgain';
import IncomingCall from './screens/IncomingCall';
import OnGoingCall from './screens/OnGoingCall';
import OutGoingCall from './screens/OutGoingCall';
import PipViewIos from './screens/PipViewIos';

let currentUserRequestingCallSwitch = createRef(false).current;
let remoteUserRequestingCallSwitch = createRef(false).current;
const CallContainer = () => {
   const insets = initialWindowMetrics.insets;
   const isPipMode = usePipModeListener();
   const showCallModal = useSelector(state => state.callData.showCallModal, shallowEqual);
   const screenName = useSelector(state => state.callData.screenName, shallowEqual);
   const connectionState = useSelector(state => state.callData.connectionState, shallowEqual);
   const largeVideoUser = useSelector(state => state.callData.largeVideoUser, shallowEqual);
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData, shallowEqual);
   const callConversionData = useSelector(state => state.callData.callConversionData, shallowEqual) || {};
   const dispatch = useDispatch();
   const _userId = getUserIdFromJid(connectionState.to || connectionState.userJid);

   React.useLayoutEffect(() => {
      if (Platform.OS === 'android' && Object.keys(connectionState).length !== 0) {
         dispatch(openCallModal());
      }
   }, []);

   const largeUserId = React.useMemo(() => {
      return getUserIdFromJid(largeVideoUser?.userJid);
   }, [largeVideoUser?.userJid]);

   const resetCallConversionRequestData = () => {
      currentUserRequestingCallSwitch = false;
      remoteUserRequestingCallSwitch = false;
   };

   const callConversionPopUp = React.useMemo(() => {
      if (callConversionData.status === CALL_CONVERSION_STATUS_ACCEPT) {
         if (remoteUserRequestingCallSwitch === true && currentUserRequestingCallSwitch === true) {
            currentUserRequestingCallSwitch = false;
         }
         remoteUserRequestingCallSwitch = false;
      } else if (callConversionData.status === CALL_CONVERSION_STATUS_REQ_WAITING) {
         currentUserRequestingCallSwitch = true;
      } else if (callConversionData.status === CALL_CONVERSION_STATUS_REQUEST) {
         remoteUserRequestingCallSwitch = true;
      } else if (callConversionData.status === CALL_CONVERSION_STATUS_CANCEL || CALL_CONVERSION_STATUS_DECLINE) {
         resetCallConversionRequestData();
      }
      return (
         <CallConversionPopUp
            callConversionData={callConversionData}
            remoteUserRequestingCallSwitch={remoteUserRequestingCallSwitch}
            currentUserRequestingCallSwitch={currentUserRequestingCallSwitch}
            resetCallConversionRequestData={resetCallConversionRequestData}
            isPipMode={isPipMode}
         />
      );
   }, [callConversionData.status, isPipMode]);

   const getIncomingCallStatus = () => {
      return confrenceData?.callStatusText;
   };

   const renderCallscreenBasedOnCallStatus = React.useMemo(() => {
      switch (screenName) {
         case INCOMING_CALL_SCREEN:
            const _userId = getUserIdFromJid(connectionState?.userJid);
            return (
               <IncomingCall userId={_userId} userJid={connectionState?.userJid} callStatus={getIncomingCallStatus()} />
            );
         case ONGOING_CALL_SCREEN:
            return <OnGoingCall />;
         case OUTGOING_CALL_SCREEN:
            return <OutGoingCall />;
         case CALL_AGAIN_SCREEN:
            return <CallAgain />;
      }
   }, [screenName, connectionState, confrenceData]);

   const renderModalContent = () => {
      const content = (
         <View style={[commonStyles.flex1, { marginTop: isPipMode ? 0 : insets?.top, overflow: 'hidden' }]}>
            {renderCallscreenBasedOnCallStatus}
            {callConversionData.status && callConversionPopUp}
            <CallModalToastContainer />
         </View>
      );
      return content;
   };

   const handleModalRequestClose = () => {
      if (screenName === CALL_AGAIN_SCREEN) {
         resetCallModalActivity();
         /**dispatch(resetCallStateData()); */
         dispatch(resetCallAgainData());
      } else {
         const pipEnabled = enablePipModeIfCallConnected();
         if (!pipEnabled) {
            closeCallModalActivity();
         }
      }
   };

   return (
      <>
         {Platform.OS === 'ios' &&
            !showCallModal &&
            Object.keys(connectionState).length !== 0 &&
            (screenName === ONGOING_CALL_SCREEN || screenName === OUTGOING_CALL_SCREEN) && (
               <PipViewIos userId={largeUserId || _userId} />
            )}
         <Modal
            visible={showCallModal}
            animationType={Platform.OS === 'ios' ? 'slide' : 'none'}
            statusBarTranslucent
            transparent
            onRequestClose={handleModalRequestClose}>
            {renderModalContent()}
         </Modal>
      </>
   );
};

export default CallContainer;
