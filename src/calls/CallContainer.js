import { initialWindowMetrics } from 'react-native-safe-area-context';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Modal, Platform, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { enablePipModeIfCallConnected } from '../Helper';
import {
   CALL_AGAIN_SCREEN,
   INCOMING_CALL_SCREEN,
   ONGOING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import { closeCallModalActivity, resetCallModalActivity } from '../Helper/Calls/Utility';
import commonStyles from '../common/commonStyles';
import { usePipModeListener } from '../customModules/PipModule';
import { resetCallAgainData } from '../redux/Actions/CallAgainAction';
import CallModalToastContainer from './components/CallModalToastContainer';
import CallAgain from './screens/CallAgain';
import IncomingCall from './screens/IncomingCall';
import OnGoingCall from './screens/OnGoingCall';
import OutGoingCall from './screens/OutGoingCall';
import PipViewIos from './screens/PipViewIos';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { openCallModal } from '../redux/Actions/CallAction';
import { requestBluetoothConnectPermission } from '../common/utils';

const CallContainer = ({ hasNativeBaseProvider }) => {
   const {
      showCallModal,
      connectionState = {},
      screenName = '',
      largeVideoUser = {},
   } = useSelector(state => state.callData) || {};
   const _userId = getUserIdFromJid(connectionState.to || connectionState.userJid);
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const insets = initialWindowMetrics.insets;
   const dispatch = useDispatch();

   const isPipMode = usePipModeListener();

   React.useLayoutEffect(() => {
      // requesting for Bluetooth connect permission for android
      if (Platform.OS) {
         requestBluetoothConnectPermission();
      }
      dispatch(openCallModal());
      if (Object.keys(connectionState).length === 0) {
         closeCallModalActivity();
      }
   }, []);

   const largeUserId = React.useMemo(() => {
      return getUserIdFromJid(largeVideoUser?.userJid);
   }, [largeVideoUser?.userJid]);

   const getIncomingCallStatus = () => {
      return confrenceData?.callStatusText;
   };

   const renderCallscreenBasedOnCallStatus = () => {
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
   };

   const renderModalContent = () => {
      const content = (
         <View style={[commonStyles.flex1, { marginTop: isPipMode ? 0 : insets?.top, overflow: 'hidden' }]}>
            {renderCallscreenBasedOnCallStatus()}
            <CallModalToastContainer />
         </View>
      );
      return hasNativeBaseProvider ? content : <NativeBaseProvider>{content}</NativeBaseProvider>;
   };

   const handleModalRequestClose = () => {
      if (screenName === CALL_AGAIN_SCREEN) {
         resetCallModalActivity();
         // dispatch(resetCallStateData());
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
