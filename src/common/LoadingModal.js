import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ApplicationColors from '../config/appColors';
import commonStyles from '../styles/commonStyles';
import Modal, { ModalCenteredContent } from './Modal';

function LoadingModal({ visible, message }) {
   const styles = {
      ...commonStyles.bg_white,
      ...(Boolean(message) ? commonStyles.borderRadius_5 : commonStyles.borderRadius_50),
      ...commonStyles.hstack,
      ...commonStyles.alignItemsCenter,
      ...(Boolean(message) && { paddingHorizontal: 15, minWidth: 300, minHeight: 70 }), // Include paddingHorizontal only when message is available
   };

   return (
      <Modal visible={visible}>
         <ModalCenteredContent>
            <View style={styles}>
               <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} />
               {Boolean(message) && (
                  <Text
                     style={{
                        color: 'black',
                        paddingHorizontal: 15,
                        fontWeight: '500',
                     }}>
                     {message}
                  </Text>
               )}
            </View>
         </ModalCenteredContent>
      </Modal>
   );
}

export default LoadingModal;
