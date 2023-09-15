import React from 'react';
import {
  StyleSheet,
  // View,
  Modal as RNModal,
  // eslint-disable-next-line no-unused-vars
  ModalProps,
  Pressable,
  View,
} from 'react-native';
import ApplicationColors from '../config/appColors';

export const ModalCenteredContent = ({ children, onPressOutside }) => {
  return (
    <>
      <Pressable onPress={onPressOutside} style={styles.modalOverlay} />
      <View style={styles.modalCeneteredContentContainer}>{children}</View>
    </>
  );
};

export const ModalBottomContent = ({ children, onPressOutside }) => {
  return (
    <>
      <Pressable onPress={onPressOutside} style={styles.modalOverlay} />
      <View style={styles.modalBottomContentContainer}>{children}</View>
    </>
  );
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ApplicationColors.modalBg,
  },
  modalCeneteredContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBottomContentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
