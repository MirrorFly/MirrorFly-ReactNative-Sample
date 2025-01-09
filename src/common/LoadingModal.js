import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import Modal, { ModalCenteredContent } from './Modal';
import Text from './Text';

function LoadingModal({ visible, message }) {
   const themeColorPalatte = useThemeColorPalatte();

   const styles = {
      ...{ backgroundColor: themeColorPalatte.screenBgColor },
      ...(Boolean(message) ? commonStyles.borderRadius_5 : commonStyles.borderRadius_50),
      ...commonStyles.hstack,
      ...commonStyles.alignItemsCenter,
      ...(Boolean(message) && { paddingHorizontal: 15, minWidth: 300, minHeight: 70 }), // Include paddingHorizontal only when message is available
   };

   return (
      <Modal visible={visible}>
         <ModalCenteredContent>
            <View style={styles}>
               <ActivityIndicator size={'large'} color={themeColorPalatte.primaryColor} />
               {Boolean(message) && (
                  <Text
                     style={[
                        {
                           color: themeColorPalatte.primaryTextColor,
                           paddingHorizontal: 15,
                           fontWeight: '500',
                        },
                     ]}>
                     {message}
                  </Text>
               )}
            </View>
         </ModalCenteredContent>
      </Modal>
   );
}

export default LoadingModal;
