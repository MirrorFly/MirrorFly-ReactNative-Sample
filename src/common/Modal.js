import React from 'react';
// eslint-disable-next-line no-unused-vars
import { StyleSheet, View, Modal as RNModal, ModalProps } from 'react-native';
import ApplicationColors from '../config/appColors';

export const ModalCenteredContent = ({ children }) => {
  return <View style={styles.modalcontainer}>{children}</View>;
};

/**
 *
 * @param {ModalProps} props
 */
const Modal = ({
  visible,
  transparent = true,
  animationType = 'fade',
  statusBarTranslucent = true,
  children,
  ...props
}) => {
  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      statusBarTranslucent={statusBarTranslucent}
      {...props}>
      {children}
    </RNModal>
  );
};

export default Modal;

const styles = StyleSheet.create({
  modalcontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ApplicationColors.modalBg,
  },
});
