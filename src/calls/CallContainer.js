import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Modal, Platform, View } from 'react-native';
import { RINGER_MODE, getRingerMode } from 'react-native-ringer-mode';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { subscribe } from 'react-native-silentmode-detector';
import { batch, useDispatch, useSelector } from 'react-redux';
import { startVibration, stopVibration } from '../Helper/Calls/Call';
import {
   CALL_AGAIN_SCREEN,
   INCOMING_CALL_SCREEN,
   ONGOING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import commonStyles from '../common/commonStyles';
import { DISCONNECTED } from '../constant';
import { resetCallStateData } from '../redux/Actions/CallAction';
import { resetCallAgainData } from '../redux/Actions/CallAgainAction';
import CallModalToastContainer from './components/CallModalToastContainer';
import CallAgain from './screens/CallAgain';
import IncomingCall from './screens/IncomingCall';
import OnGoingCall from './screens/OnGoingCall';
import OutGoingCall from './screens/OutGoingCall';

const CallContainer = ({ hasNativeBaseProvider }) => {
   const { showCallModal, connectionState, screenName = '' } = useSelector(state => state.callData) || {};
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const insets = initialWindowMetrics.insets;
   const [silent, setSilent] = React.useState(false);

   React.useEffect(() => {
      if (Platform.OS === 'android') {
         if (screenName === INCOMING_CALL_SCREEN && silent === RINGER_MODE.silent) {
            stopVibration();
         } else if (
            screenName === INCOMING_CALL_SCREEN &&
            silent !== RINGER_MODE.silent &&
            Object.keys(connectionState).length !== 0 &&
            getIncomingCallStatus() !== DISCONNECTED
         ) {
            startVibration();
         }
      }
   }, [silent]);

   React.useEffect(() => {
      if (Platform.OS === 'android') {
         const unsubscribe = subscribe(async () => {
            const currentMode = await getRingerMode();
            setSilent(currentMode);
         });
         return () => {
            unsubscribe();
         };
      }
   }, []);

   const dispatch = useDispatch();

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
         <View style={[commonStyles.flex1, { marginTop: insets.top, overflow: 'hidden' }]}>
            {renderCallscreenBasedOnCallStatus()}
            <CallModalToastContainer />
         </View>
      );
      return hasNativeBaseProvider ? content : <NativeBaseProvider>{content}</NativeBaseProvider>;
   };

   const handleModalRequestClose = () => {
      if (screenName === CALL_AGAIN_SCREEN) {
         batch(() => {
            dispatch(resetCallStateData());
            dispatch(resetCallAgainData());
         });
      }
   };

   return (
      <Modal
         visible={showCallModal}
         animationType="slide"
         statusBarTranslucent
         transparent
         onRequestClose={handleModalRequestClose}>
         {renderModalContent()}
      </Modal>
   );
};

export default CallContainer;
