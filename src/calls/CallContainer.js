import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Modal, View } from 'react-native';
import { usePipModeListener } from '../customModules/PipModule';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
   CALL_AGAIN_SCREEN,
   INCOMING_CALL_SCREEN,
   ONGOING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import { closeCallModalActivity, resetCallModalActivity } from '../Helper/Calls/Utility';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import commonStyles from '../common/commonStyles';
import { resetCallAgainData } from '../redux/Actions/CallAgainAction';
import CallModalToastContainer from './components/CallModalToastContainer';
import CallAgain from './screens/CallAgain';
import IncomingCall from './screens/IncomingCall';
import OnGoingCall from './screens/OnGoingCall';
import OutGoingCall from './screens/OutGoingCall';
import { enablePipModeIfCallConnected } from '../Helper';

const CallContainer = ({ hasNativeBaseProvider }) => {
   const { showCallModal, connectionState, screenName = '' } = useSelector(state => state.callData) || {};
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const insets = initialWindowMetrics.insets;
   const dispatch = useDispatch();

   const isPipMode = usePipModeListener();

   React.useLayoutEffect(() => {
      if (Object.keys(connectionState).length === 0) {
         closeCallModalActivity();
      }
   }, []);

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
      <Modal
         visible={showCallModal}
         animationType="none"
         statusBarTranslucent
         transparent
         onRequestClose={handleModalRequestClose}>
         {renderModalContent()}
      </Modal>
   );
};

export default CallContainer;
