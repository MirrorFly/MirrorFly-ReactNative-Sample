import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import IconButton from '../common/IconButton';
import Modal, { ModalCenteredContent } from '../common/Modal';
import commonStyles, { modelStyles } from '../styles/commonStyles';

const propTypes = {
   title: PropTypes.string,
   visible: PropTypes.bool,
   onRequestClose: PropTypes.func,
   noButton: PropTypes.string,
   yesButton: PropTypes.string,
   yesAction: PropTypes.func,
};

function AlertModal({
   title,
   visible,
   onRequestClose,
   noButton,
   noAction,
   yesButton,
   yesAction,
   optionalButton,
   optionalAction,
}) {
   const onPress = () => {
      yesAction();
      onRequestClose();
   };

   const noActionPress = () => {
      onRequestClose();
      noAction?.();
   };
   return (
      <Modal visible={visible} onRequestClose={onRequestClose}>
         <ModalCenteredContent onPressOutside={onRequestClose}>
            <View style={modelStyles.inviteFriendModalContentContainer}>
               <Text style={styles.optionTitleText}>{title}</Text>
               <View style={optionalButton ? styles.deleteModalVerticalActionButtonsContainer : styles.buttonContainer}>
                  <IconButton
                     style={{ paddingHorizontal: 10, paddingVertical: optionalButton ? 10 : 5, marginRight: 5 }}
                     onPress={noActionPress}>
                     <Text style={[styles.pressableText, commonStyles.typingText]}>{noButton}</Text>
                  </IconButton>
                  <IconButton
                     style={{ paddingHorizontal: 10, paddingVertical: optionalButton ? 10 : 5 }}
                     onPress={onPress}>
                     <Text style={[styles.pressableText, commonStyles.typingText]}>{yesButton}</Text>
                  </IconButton>
                  {optionalButton && (
                     <IconButton
                        style={{ paddingHorizontal: 10, paddingVertical: optionalButton ? 10 : 5 }}
                        onPress={optionalAction}>
                        <Text style={[styles.pressableText, commonStyles.typingText]}>{optionalButton}</Text>
                     </IconButton>
                  )}
               </View>
            </View>
         </ModalCenteredContent>
      </Modal>
   );
}

const styles = StyleSheet.create({
   optionTitleText: { fontSize: 16, color: '#000', marginVertical: 5, marginHorizontal: 10, lineHeight: 25 },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingRight: 15,
      paddingVertical: 5,
   },
   deleteModalVerticalActionButtonsContainer: {
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      paddingTop: 20,
   },
   pressableText: {
      fontWeight: '600',
   },
});

AlertModal.propTypes = propTypes;

export default AlertModal;
