import React from 'react';
import AlertModal from './AlertModal';
import { useAlertModalContent } from '../redux/reduxHook';

function AlertModalRoot() {
   const modalContent = useAlertModalContent();
   console.log('modalContent ==> ', modalContent);
   return modalContent && <AlertModal {...modalContent} />;
}

export default AlertModalRoot;
