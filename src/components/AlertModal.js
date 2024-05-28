import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import IconButton from '../common/IconButton';
import Modal, { ModalCenteredContent } from '../common/Modal';
import commonStyles, { modelStyles } from '../common/commonStyles';

const propTypes = {
   title: PropTypes.string,
   visible: PropTypes.bool,
   onRequestClose: PropTypes.func,
   noButton: PropTypes.string,
   yesButton: PropTypes.string,
   yesAction: PropTypes.func,
};

function AlertModal({ title, visible, onRequestClose, noButton, yesButton, yesAction }) {
   const onPress = () => {
      yesAction();
      onRequestClose();
   };
   return (
      <Modal visible={visible} onRequestClose={onRequestClose}>
         <ModalCenteredContent onPressOutside={onRequestClose}>
            <View style={modelStyles.inviteFriendModalContentContainer}>
               <Text style={styles.optionTitleText}>{title}</Text>
               <View style={styles.buttonContainer}>
                  <IconButton onPress={onRequestClose}>
                     <Text style={[styles.pressableText, commonStyles.typingText]}>{noButton}</Text>
                  </IconButton>
                  <IconButton onPress={onPress}>
                     <Text style={[styles.pressableText, commonStyles.typingText]}>{yesButton}</Text>
                  </IconButton>
               </View>
            </View>
         </ModalCenteredContent>
      </Modal>
   );
}

const styles = StyleSheet.create({
   optionTitleText: { fontSize: 16, color: '#000', marginVertical: 5, marginHorizontal: 20, lineHeight: 25 },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingRight: 5,
   },
   pressableText: {
      marginHorizontal: 10,
      fontWeight: '600',
   },
});

AlertModal.propTypes = propTypes;

export default AlertModal;
