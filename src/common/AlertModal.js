import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles, { modelStyles } from '../styles/commonStyles';
import IconButton from './IconButton';
import Modal, { ModalCenteredContent } from './Modal';
import Text from './Text';

const propTypes = {
   title: PropTypes.string,
   visible: PropTypes.bool,
   onRequestClose: PropTypes.func,
   noButton: PropTypes.string,
   yesButton: PropTypes.string,
   yesAction: PropTypes.func,
};

function AlertModal({ title, visible, onRequestClose, noButton, noAction, yesButton, yesAction }) {
   const themeColorPalatte = useThemeColorPalatte();
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
            <View
               style={[
                  modelStyles.inviteFriendModalContentContainer,
                  commonStyles.bg_color(themeColorPalatte.screenBgColor),
               ]}>
               <Text style={[styles.optionTitleText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                  {title}
               </Text>
               <View style={styles.buttonContainer}>
                  <IconButton
                     style={{ paddingHorizontal: 10, paddingVertical: 5, marginRight: 5 }}
                     onPress={noActionPress}>
                     <Text style={[styles.pressableText, commonStyles.textColor(themeColorPalatte.primaryColor)]}>
                        {noButton}
                     </Text>
                  </IconButton>
                  <IconButton style={{ paddingHorizontal: 10, paddingVertical: 5 }} onPress={onPress}>
                     <Text style={[styles.pressableText, commonStyles.textColor(themeColorPalatte.primaryColor)]}>
                        {yesButton}
                     </Text>
                  </IconButton>
               </View>
            </View>
         </ModalCenteredContent>
      </Modal>
   );
}

const styles = StyleSheet.create({
   optionTitleText: {
      fontSize: 16,
      marginVertical: 5,
      marginHorizontal: 20,
      lineHeight: 25,
   },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingRight: 15,
      paddingVertical: 5,
   },
   pressableText: {
      fontWeight: '600',
   },
});

AlertModal.propTypes = propTypes;

export default AlertModal;
