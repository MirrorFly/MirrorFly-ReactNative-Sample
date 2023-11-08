import React from 'react';
import { View, Modal } from 'react-native';
import IncomingCall from './screens/IncomingCall';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import {
  ONGOING_CALL_SCREEN,
  INCOMING_CALL_SCREEN,
  OUTGOING_CALL_SCREEN,
} from '../Helper/Calls/Constant';
import OutGoingCall from './screens/OutGoingCall';
import OnGoingCall from './screens/OnGoingCall';

const CallContainer = () => {
  const { showCallModal, connectionState } =
    useSelector(state => state.callData) || {};
  const { data: confrenceData = {} } =
    useSelector(state => state.showConfrenceData) || {};

  const renderCallscreenBasedOnCallStatus = () => {
    const _screenName = confrenceData.screenName;
    console.log(_screenName, '_screenName');
    switch (_screenName) {
      case INCOMING_CALL_SCREEN:
        const _userId = getUserIdFromJid(connectionState?.userJid);
        return <IncomingCall userId={_userId} />;
      case ONGOING_CALL_SCREEN:
        return <OnGoingCall />;
      case OUTGOING_CALL_SCREEN:
        return <OutGoingCall userId={_userId} />;
    }
  };

  return (
    <Modal visible={showCallModal} animationType="slide">
      {renderCallscreenBasedOnCallStatus()}
    </Modal>
  );
};

export default CallContainer;
