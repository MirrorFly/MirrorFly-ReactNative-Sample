import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import RootNavigation from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import { fetchGroupParticipants } from '../SDK/utils';
import LoadingModal from '../common/LoadingModal';
import { useNetworkStatus } from '../common/hooks';
import GrpCollapsibleToolbar from '../components/GrpCollapsibleToolbar';
import {
   getUserIdFromJid,
   handleImagePickerOpenCamera,
   handleImagePickerOpenGallery,
   showNetWorkToast,
   showToast,
} from '../helpers/chatHelpers';
import { getUserNameFromStore, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const GroupInfo = () => {
   const {
      params: { chatUser = '' },
   } = useRoute();
   const themeColorPalatte = useThemeColorPalatte();
   const chatUserId = getUserIdFromJid(chatUser);
   const isNetworkconneted = useNetworkStatus();
   const [modelOpen, setModelOpen] = React.useState(false);
   const groupParticipants = useSelector(state => state.groupData.participantsList[chatUserId]);

   const handleBackBtn = () => {
      RootNavigation.goBack();
   };

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
               const { statusCode, message } = await SDK.setGroupProfile(
                  chatUser,
                  getUserNameFromStore(chatUserId),
                  _image,
               );
               if (statusCode !== 200) {
                  showToast(message);
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
               const { statusCode, message } = await SDK.setGroupProfile(
                  chatUser,
                  getUserNameFromStore(chatUserId),
                  _image,
               );
               if (statusCode !== 200) {
                  showToast(message);
               }
            }
            toggleModel();
         }, 1000);
      }, 1000);
   };

   const handleRemovePhoto = async () => {
      if (!isNetworkconneted) {
         return showNetWorkToast();
      }
      const { statusCode, message } = await SDK.setGroupProfile(chatUser, getUserNameFromStore(chatUserId));
      if (statusCode !== 200) {
         showToast(message);
      }
   };

   return (
      <>
         {modelOpen && <LoadingModal />}
         <View style={[styles.container, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}>
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
