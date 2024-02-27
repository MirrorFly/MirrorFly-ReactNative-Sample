import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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
import useRosterData from '../hooks/useRosterData';

const GroupInfo = () => {
   const {
      params: { chatUser = '' },
   } = useRoute();
   const naviagation = useNavigation();
   const chatUserId = getUserIdFromJid(chatUser);
   const isNetworkconneted = useNetworkStatus();
   const [modelOpen, setModelOpen] = React.useState(false);

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   let {
      nickName = '',
      colorCode = '',
      status = '',
      mobileNumber = '',
      email = '',
      image = '',
   } = useRosterData(chatUserId);
   // updating default values
   nickName = nickName || chatUserId || '';
   colorCode = colorCode || '';
   status = status || '';
   mobileNumber = mobileNumber || '';
   email = email || '';
   image = image || '';
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
      const _image = await handleImagePickerOpenGallery();
      toggleModel();
      setTimeout(async () => {
         const { statusCode, message } = await SDK.setGroupProfile(chatUser, nickName, _image);
         if (!statusCode === 200) {
            showToast(message, { id: message });
         }
         toggleModel();
      }, 1000);
   };

   const handleTakePhoto = async () => {
      const _image = await handleImagePickerOpenCamera();
      toggleModel();
      setTimeout(async () => {
         const { statusCode, message } = await SDK.setGroupProfile(chatUser, nickName, _image);
         if (!statusCode === 200) {
            showToast(message, { id: message });
         }
         toggleModel();
      }, 1000);
   };

   const handleRemovePhoto = async () => {
      if (!isNetworkconneted) {
         return showInternetconnectionToast();
      }
      const { statusCode, message } = await SDK.setGroupProfile(chatUser, nickName);
      if (!statusCode === 200) {
         showToast(message, { id: message });
      } else {
         showToast('');
      }
   };

   useFocusEffect(
      React.useCallback(() => {
         fetchGroupParticipants(chatUser);
      }, [chatUser]),
   );

   const handleBackBtn = React.useCallback(() => {
      naviagation.goBack();
      return true;
   }, [naviagation]);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [handleBackBtn]);

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
               bgColor={colorCode}
               title={nickName}
               titleColor={colorCode}
               titleStatus={status}
               mobileNo={mobileNumber || chatUserId}
               imageToken={image}
               email={email}
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
