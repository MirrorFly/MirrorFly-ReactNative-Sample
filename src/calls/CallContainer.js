import React from 'react';
import { View, Modal } from 'react-native';
import IncomingCall from './screens/IncomingCall';
import { useSelector } from 'react-redux';

const CallContainer = () => {
  const { showCallModal, connectionState } =
    useSelector(state => state.callData) || {};

  const callStatus = 'incoming';

  const renderCallscreenBasedOnCallStatus = () => {
    switch (callStatus) {
      case 'incoming':
        return (
          <IncomingCall userId={connectionState.userId || '919094237501'} />
        );
    }
  };

  return (
    <Modal visible={showCallModal} animationType="slide">
      {renderCallscreenBasedOnCallStatus()}
    </Modal>
  );
};

export default CallContainer;
