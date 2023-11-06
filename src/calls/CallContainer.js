import React from 'react';
import { Modal } from 'react-native';

const CallContainer = () => {
  const renderCallscreenBasedOnCallStatus = () => {
    // switch(callStatus) {
    //   case '':
    //   case '':
    // }
    return null;
  };

  return (
    <Modal visible={false} animationType="slide">
      {renderCallscreenBasedOnCallStatus()}
    </Modal>
  );
};

export default CallContainer;
