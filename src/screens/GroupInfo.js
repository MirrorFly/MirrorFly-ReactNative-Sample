import { useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import SDK from '../SDK/SDK';
import { fetchGroupParticipants } from '../SDK/utils';
import Modal, { ModalCenteredContent } from '../common/Modal';
import { useNetworkStatus } from '../common/hooks';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid } from '../helpers/chatHelpers';

const GroupInfo = () => {
   const {
      params: { chatUser = '' },
   } = useRoute();
   const chatUserId = getUserIdFromJid(chatUser);
   const isNetworkconneted = useNetworkStatus();
   const [modelOpen, setModelOpen] = React.useState(false);
   const groupParticipants = [];

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   const getGroupParticipants = time => {
      toggleModel();
      setTimeout(() => {
         fetchGroupParticipants(chatUser);
         toggleModel();
      }, time);
   };

   const handleFromGallery = async () => {
      toggleModel();
      setTimeout(async () => {
         const _image = await handleImagePickerOpenGallery();
         setTimeout(async () => {
            if (Object.keys(_image).length) {
               const { statusCode, message } = await SDK.setGroupProfile(chatUser, getUserName(chatUserId), _image);
               if (statusCode !== 200) {
                  showToast(message, { id: message });
               }
            }
            toggleModel();
         }, 1000);
      }, 1000);
   };

   const handleTakePhoto = async () => {
      toggleModel();
      setTimeout(async () => {
         const _image = await handleImagePickerOpenCamera();
         setTimeout(async () => {
            if (Object.keys(_image).length) {
               const { statusCode, message } = await SDK.setGroupProfile(chatUser, getUserName(chatUserId), _image);
               if (statusCode !== 200) {
                  showToast(message, { id: message });
               }
            }
            toggleModel();
         }, 1000);
      }, 1000);
   };

   const handleRemovePhoto = async () => {
      if (!isNetworkconneted) {
         return showInternetconnectionToast();
      }
      const { statusCode, message } = await SDK.setGroupProfile(chatUser, getUserName(chatUserId));
      if (statusCode !== 200) {
         showToast(message, { id: message });
      } else {
         showToast('');
      }
   };

   return (
      <>
         <Modal visible={modelOpen}>
            <ModalCenteredContent>
               <View style={[commonStyles.bg_white, commonStyles.borderRadius_5]}>
                  <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} />
               </View>
            </ModalCenteredContent>
         </Modal>
         <View style={styles.container}>
            <GrpCollapsibleToolbar
               chatUser={chatUser}
               handleBackBtn={handleBackBtn}
               participants={groupParticipants}
               getGroupParticipants={getGroupParticipants}
               handleFromGallery={handleFromGallery}
               handleRemovePhoto={handleRemovePhoto}
               handleTakePhoto={handleTakePhoto}
            />
         </View>
      </>
   );
};
export default GroupInfo;
const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
});
