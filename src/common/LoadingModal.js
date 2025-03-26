import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import Modal, { ModalCenteredContent } from './Modal';
import Text from './Text';

function LoadingModal({ visible, message, behavior }) {
   const themeColorPalatte = useThemeColorPalatte();

   const styles = {
      ...{ backgroundColor: themeColorPalatte.screenBgColor },
      ...(Boolean(message) ? commonStyles.borderRadius_5 : commonStyles.borderRadius_50),
      ...commonStyles.hstack,
      ...commonStyles.alignItemsCenter,
      ...(Boolean(message) && { paddingHorizontal: 15, minWidth: 300, minHeight: 70 }), // Include paddingHorizontal only when message is available
   };

   if (behavior === 'custom' && visible) {
      return (
         <View
            style={[
               commonStyles.positionAbsolute,
               commonStyles.alignItemsCenter,
               commonStyles.justifyContentCenter,
               { flex: 1, width: '100%', height: '100%', backgroundColor: themeColorPalatte.modalOverlayBg },
            ]}>
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
         </View>
      );
   }

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
