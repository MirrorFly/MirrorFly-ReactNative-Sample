import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { showToast } from '../Helper';
import {
   handleImagePickerOpenCamera,
   handleImagePickerOpenGallery,
   showInternetconnectionToast,
} from '../Helper/Chat/ChatHelper';
import { fetchGroupParticipants } from '../Helper/Chat/Groups';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import SDK from '../SDK/SDK';
import Modal, { ModalCenteredContent } from '../common/Modal';
import commonStyles from '../common/commonStyles';
import GrpCollapsibleToolbar from '../components/GrpCollapsibleToolbar';
import ApplicationColors from '../config/appColors';
import { useNetworkStatus } from '../hooks';
import { getUserName } from '../hooks/useRosterData';
import { CONVERSATION_SCREEN } from '../constant';

const GroupInfo = () => {
   const {
      params: { chatUser = '' },
   } = useRoute();
   const chatUserId = getUserIdFromJid(chatUser);
   const navigation = useNavigation();
   const isNetworkconneted = useNetworkStatus();
   const [modelOpen, setModelOpen] = React.useState(false);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, []);

   const handleBackBtn = () => {
      navigation.navigate(CONVERSATION_SCREEN);
      return true;
   };

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   const groupParticipants = useSelector(
      state => state?.groupsMemberParticipantsListData?.groupParticipants[chatUser] || [],
   );

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
