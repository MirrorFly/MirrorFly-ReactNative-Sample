import React from 'react';
import Modal, { ModalCenteredContent } from './Modal';
import { ActivityIndicator, View } from 'react-native';
import commonStyles from './commonStyles';
import ApplicationColors from '../config/appColors';

function LoadingModal({ visible }) {
   return (
      <Modal visible={visible}>
         <ModalCenteredContent>
            <View style={[commonStyles.bg_white, commonStyles.borderRadius_5]}>
               <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} />
            </View>
         </ModalCenteredContent>
      </Modal>
   );
}

export default LoadingModal;
