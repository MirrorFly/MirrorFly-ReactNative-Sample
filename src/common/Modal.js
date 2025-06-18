import React from 'react';
import {
   ModalProps, // NOSONAR
   Pressable,
   Modal as RNModal,
   StyleSheet,
   View,
} from 'react-native';
import PropTypes from 'prop-types';

export const ModalCenteredContent = ({ children, onPressOutside }) => {
   return (
      <View style={styles.modalCeneteredContentContainer}>
         <Pressable onPress={onPressOutside} style={styles.modalOverlay} />
         {children}
      </View>
   );
};

ModalCenteredContent.propTypes = {
   children: PropTypes.node,
   onPressOutside: PropTypes.func,
};

export const ModalBottomContent = ({ children, onPressOutside }) => {
   return (
      <View style={styles.modalBottomContentContainer}>
         <Pressable onPress={onPressOutside} style={styles.modalOverlay} />
         {children}
      </View>
   );
};

ModalBottomContent.propTypes = {
   children: PropTypes.node,
   onPressOutside: PropTypes.func,
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

Modal.propTypes = {
   visible: PropTypes.bool,
   transparent: PropTypes.bool,
   animationType: PropTypes.oneOf(['none', 'slide', 'fade']),
   statusBarTranslucent: PropTypes.bool,
   children: PropTypes.node,
};

export default Modal;

const styles = StyleSheet.create({
   modalOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,.5)',
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
