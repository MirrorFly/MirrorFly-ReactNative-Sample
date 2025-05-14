import React from 'react';
import AlertModal from './AlertModal';
import { useAlertModalContent } from '../redux/reduxHook';

function AlertModalRoot() {
   const modalContent = useAlertModalContent();
   return modalContent && <AlertModal {...modalContent} />;
}

export default AlertModalRoot;
