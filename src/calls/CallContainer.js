import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Modal, Platform, View } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { batch, useDispatch, useSelector } from 'react-redux';
import {
   CALL_AGAIN_SCREEN,
   INCOMING_CALL_SCREEN,
   ONGOING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import { closeCallModalActivity, resetCallModalActivity } from '../Helper/Calls/Utility';
import commonStyles from '../common/commonStyles';
import { resetCallAgainData } from '../redux/Actions/CallAgainAction';
import CallModalToastContainer from './components/CallModalToastContainer';
import CallAgain from './screens/CallAgain';
import IncomingCall from './screens/IncomingCall';
import OnGoingCall from './screens/OnGoingCall';
import OutGoingCall from './screens/OutGoingCall';
import PipViewIos from './screens/PipViewIos';
import { getUserIdFromJid } from '../Helper/Chat/Utility';

const CallContainer = ({ hasNativeBaseProvider }) => {
   const { showCallModal, connectionState = {}, screenName = '' } = useSelector(state => state.callData) || {};
   const _userId = getUserIdFromJid(connectionState.to || connectionState.userJid);
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const insets = initialWindowMetrics.insets;
   const dispatch = useDispatch();

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
         <View style={[commonStyles.flex1, { marginTop: insets?.top, overflow: 'hidden' }]}>
            {renderCallscreenBasedOnCallStatus()}
            <CallModalToastContainer />
         </View>
      );
      return hasNativeBaseProvider ? content : <NativeBaseProvider>{content}</NativeBaseProvider>;
   };

   const handleModalRequestClose = () => {
      if (screenName === CALL_AGAIN_SCREEN) {
         batch(() => {
            resetCallModalActivity();
            // dispatch(resetCallStateData());
            dispatch(resetCallAgainData());
         });
      }
   };

   return (
      <>
         {Platform.OS === 'ios' &&
            !showCallModal &&
            Object.keys(connectionState).length !== 0 &&
            screenName !== INCOMING_CALL_SCREEN && <PipViewIos userId={_userId} />}
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
