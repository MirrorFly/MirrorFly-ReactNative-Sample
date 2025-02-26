import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, Image, Keyboard, StyleSheet, View } from 'react-native';
import CameraIcon from '../assets/camera.png';
import Avathar from '../common/Avathar';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import LoadingModal from '../common/LoadingModal';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { useNetworkStatus } from '../common/hooks';
import EmojiInput from '../components/EmojiInput';
import {
   getImageSource,
   handleImagePickerOpenCamera,
   handleImagePickerOpenGallery,
   showToast
} from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP } from '../helpers/constants';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles, { modelStyles } from '../styles/commonStyles';
import { IMAGEVIEW, NEW_GROUP, USERS_LIST_SCREEN } from './constants';

function NewGroup() {
   const stringSet = getStringSet();
   const isConnected = useNetworkStatus();
   const themeColorPalatte = useThemeColorPalatte();
   const navigation = useNavigation();
   const [value, setValue] = React.useState('');
   const [loading, setLoading] = React.useState(false);
   const [profileImage, setProfileImage] = React.useState({});
   const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
   const [modelOpen, setModelOpen] = React.useState(false);

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   const toggleLoading = () => {
      setLoading(val => !val);
   };

   const handleBackBtn = () => {
      if (isEmojiPickerShowing) {
         setIsEmojiPickerShowing(!isEmojiPickerShowing);
      } else {
         navigation.goBack();
      }
      return true;
   };

   const handlingBackBtn = () => {
      navigation.goBack();
   };

   const handleRemovePhoto = () => {
      toggleModel();
      setProfileImage({});
   };

   const handleImage = position => {
      Keyboard.dismiss();
      switch (true) {
         case !isConnected:
            showToast('Please check your internet connection');
            break;
         case isConnected && position === 'small':
            toggleModel();
            break;
         case isConnected && position === 'big' && !profileImage?.uri:
            toggleModel();
            break;
         case isConnected && position === 'big' && Boolean(profileImage?.uri):
            navigation.navigate(IMAGEVIEW, { profileImage });
            break;
      }
   };

   const handleOpenCamera = () => {
      toggleLoading();
      toggleModel();
      setTimeout(() => {
         handleImagePickerOpenCamera()
            .then(image => {
               setProfileImage(image);
               toggleLoading();
            })
            .catch(error => {
               showToast(error);
            });
      }, 800);
   };

   const handleOpenGallery = () => {
      toggleLoading();
      toggleModel();
      setTimeout(() => {
         handleImagePickerOpenGallery()
            .then(image => {
               setProfileImage(image);
               toggleLoading();
            })
            .catch(error => {
               showToast(error);
            });
      }, 800);
   };

   const handleNext = () => {
      if (value.trim()) {
         navigation.navigate(USERS_LIST_SCREEN, {
            prevScreen: NEW_GROUP,
            grpDetails: { grpName: value, profileImage },
         });
      } else {
         showToast(stringSet.TOAST_MESSAGES.TOAST_PROVIDE_GROUP_NAME);
      }
   };

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

   return (
      <>
         <View style={[styles.container, commonStyles.hstack, { backgroundColor: themeColorPalatte.appBarColor }]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handlingBackBtn}>
                  <LeftArrowIcon color={themeColorPalatte.iconColor} />
               </IconButton>
               <Text style={[styles.titleText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                  {stringSet.CREATE_GROUP_SCREEN.NEW_GROUP_BUTTON}
               </Text>
            </View>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
               <IconButton onPress={handleNext}>
                  <Text style={[styles.subText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                     {stringSet.CREATE_GROUP_SCREEN.NEXT_BUTTON}
                  </Text>
               </IconButton>
            </View>
         </View>
         <View style={[commonStyles.bg_color(themeColorPalatte.screenBgColor), commonStyles.flex1]}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.mt_50]}>
               <View style={{ height: 157, width: 157, position: 'relative' }}>
                  <Pressable
                     style={[commonStyles.borderRadius_50, commonStyles.overflowHidden]}
                     pressedStyle={{}}
                     onPress={() => handleImage('big')}>
                     {!profileImage?.uri && (
                        <Avathar
                           imageProps={{
                              source: profileImage?.uri || '',
                           }}
                           type={CHAT_TYPE_GROUP}
                           fontSize={60}
                           width={157}
                           height={157}
                        />
                     )}
                     {profileImage?.uri && (
                        <Image
                           resizeMode="contain"
                           source={{ uri: profileImage?.uri }}
                           style={{ height: 157, width: 157, borderRadius: 100 }}
                        />
                     )}
                  </Pressable>
                  <Pressable
                     onPress={() => handleImage('small')}
                     style={[
                        commonStyles.borderRadius_50,
                        commonStyles.overflowHidden,
                        commonStyles.positionAbsolute,
                        commonStyles.r_0,
                        commonStyles.b_0,
                     ]}>
                     <Image resizeMode="contain" source={getImageSource(CameraIcon)} style={styles.cameraImage} />
                  </Pressable>
               </View>
            </View>
            <EmojiInput setValue={setValue} allowedMaxLimit={25}>
               <Text
                  style={[
                     commonStyles.pt_15,
                     commonStyles.fw_600,
                     commonStyles.textCenter,
                     { color: themeColorPalatte.primaryTextColor },
                  ]}>
                  {stringSet.CREATE_GROUP_SCREEN.GROUP_INFO_LABEL}
               </Text>
            </EmojiInput>
         </View>
         <LoadingModal visible={loading} />
         <Modal visible={modelOpen} onRequestClose={toggleModel}>
            <ModalCenteredContent onPressOutside={toggleModel}>
               <View
                  style={[
                     modelStyles.inviteFriendModalContentContainer,
                     commonStyles.bg_color(themeColorPalatte.screenBgColor),
                  ]}>
                  <Pressable onPress={handleOpenGallery}>
                     <Text style={modelStyles.modalOption(themeColorPalatte.primaryTextColor)}>
                        {stringSet.COMMON_TEXT.CHOOSE_FROM_GALLERY}
                     </Text>
                  </Pressable>
                  <Pressable onPress={handleOpenCamera}>
                     <Text style={modelStyles.modalOption(themeColorPalatte.primaryTextColor)}>
                        {stringSet.COMMON_TEXT.TAKE_PHOTO}
                     </Text>
                  </Pressable>
                  {profileImage?.uri && (
                     <Pressable onPress={handleRemovePhoto}>
                        <Text style={modelStyles.modalOption(themeColorPalatte.primaryTextColor)}>
                           {stringSet.COMMON_TEXT.REMOVE_PHOTO}
                        </Text>
                     </Pressable>
                  )}
               </View>
            </ModalCenteredContent>
         </Modal>
      </>
   );
}

export default NewGroup;

const styles = StyleSheet.create({
   container: {
      height: 60,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
   },
   subText: {
      fontSize: 14,
      paddingHorizontal: 12,
   },
   cameraImage: {
      height: 42,
      width: 42,
      padding: 10,
   },
   nameTextView: {
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
   },
   iconWidth: {
      width: 40,
   },
   nameTextInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: '400',
      marginTop: 5,
      paddingLeft: 40,
   },
});
