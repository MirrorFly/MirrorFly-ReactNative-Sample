import React from 'react';
import { Modal, Text, View } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import {
   ONGOING_CALL_SCREEN,
   INCOMING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
   CALL_AGAIN_SCREEN,
} from '../Helper/Calls/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import commonStyles from '../common/commonStyles';
import IncomingCall from './screens/IncomingCall';
import OutGoingCall from './screens/OutGoingCall';
import OnGoingCall from './screens/OnGoingCall';
import CallAgain from './screens/CallAgain';

const CallContainer = () => {
   const { showCallModal, connectionState } = useSelector(state => state.callData) || {};
   const { data: confrenceData = {} } = useSelector(state => state.showConfrenceData) || {};
   const insets = initialWindowMetrics.insets;

   const renderCallscreenBasedOnCallStatus = () => {
      const _screenName = confrenceData.screenName;
      console.log('_screenName', _screenName);
      switch (_screenName) {
         case INCOMING_CALL_SCREEN:
            const _userId = getUserIdFromJid(connectionState?.userJid);
            return <IncomingCall userId={_userId} />;
         case ONGOING_CALL_SCREEN:
            return <OnGoingCall />;
         case OUTGOING_CALL_SCREEN:
            return <OutGoingCall />;
         case CALL_AGAIN_SCREEN:
            return <CallAgain userId={'919094237501'} />;
      }
   };

   return (
      <Modal visible={showCallModal} animationType="slide" statusBarTranslucent>
         <View style={[commonStyles.flex1, { marginTop: insets.top }]}>{renderCallscreenBasedOnCallStatus()}</View>
      </Modal>
   );
};

export default CallContainer;
