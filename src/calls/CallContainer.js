import React from 'react';
import { View, Modal } from 'react-native';
import IncomingCall from './screens/IncomingCall';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import {
  CALL_CONNECTED_SCREEN,
  INCOMING_CALL_SCREEN,
} from '../Helper/Calls/Constant';

const CallContainer = () => {
  const { showCallModal, connectionState } =
    useSelector(state => state.callData) || {};
  const { data: confrenceData = {} } =
    useSelector(state => state.showConfrenceData) || {};

  const renderCallscreenBasedOnCallStatus = () => {
    const _screenName = confrenceData.screenName;
    switch (_screenName) {
      case INCOMING_CALL_SCREEN:
      case CALL_CONNECTED_SCREEN:
        const _userId = getUserIdFromJid(connectionState?.userJid);
        return <IncomingCall userId={_userId} />;
    }
  };

  return (
    <Modal visible={showCallModal} animationType="slide">
      {renderCallscreenBasedOnCallStatus()}
    </Modal>
  );
};

export default CallContainer;
