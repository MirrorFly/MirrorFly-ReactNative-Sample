import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Animated, Image, Keyboard, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import { RealmKeyValueStore } from '../SDK/SDK';
import CamerIcon from '../assets/camera.png';
import profileImage from '../assets/profile.png';
import AlertModal from '../common/AlertModal';
import Avathar from '../common/Avathar';
import { CallIcon, MailIcon, StatusIcon } from '../common/Icons';
import LoadingModal from '../common/LoadingModal';
import Modal, { ModalBottomContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import ScreenHeader from '../common/ScreenHeader';
import Text from '../common/Text';
import TextInput from '../common/TextInput';
import { useNetworkStatus } from '../common/hooks';
import AuthProfileImage from '../components/AuthProfileImage';
import {
   calculateKeyboardVerticalOffset,
   getImageSource,
   getUserIdFromJid,
   handleImagePickerOpenCamera,
   handleImagePickerOpenGallery,
   handleRoute,
   isEqualObjet,
   showToast,
} from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { getUserImage, useRoasterData, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid, mirrorflyProfileUpdate } from '../uikitMethods';
import { PROFILE_IMAGE, PROFILE_STATUS_EDIT, RECENTCHATSCREEN } from './constants';

const ProfileScreen = () => {
   const stringSet = getStringSet();
   const [isLoading, setIsLoading] = React.useState(true);
   const currentUserJID = getCurrentUserJid();
   const themeColorPalatte = useThemeColorPalatte();
   const navigaiton = useNavigation();
   const userId = getUserIdFromJid(currentUserJID);
   const profile = useRoasterData(userId);
   const [profileDetails, setProfileDetails] = React.useState({
      status: stringSet.PROFILE_SCREEN.DEFAULT_PROFILE_STATUS,
   });
   const isConnected = useNetworkStatus();
   const canGoBack = navigaiton.canGoBack();
   const [optionModelOpen, setOptionModelOpen] = React.useState(false);
   const [modalContent, setModalContent] = React.useState(null);
   const layout = useWindowDimensions();

   React.useEffect(() => {
      setIsLoading(true);
      if (!isEqualObjet(profile, profileDetails)) {
         setProfileDetails({
            ...profile,
            mobileNumber: profile?.mobileNumber || profile?.userId,
            status: profile?.status || stringSet.PROFILE_SCREEN.DEFAULT_PROFILE_STATUS,
         });
      }
      setIsLoading(false);
   }, [profile]);

   const translateY = React.useRef(new Animated.Value(layout.height)).current;
   React.useEffect(() => {
      if (optionModelOpen) {
         // Animate in if visible
         Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
         }).start();
      } else {
         // Animate out if not visible
         Animated.timing(translateY, {
            toValue: layout.height,
            duration: 300,
            useNativeDriver: true,
         }).start();
      }
   }, [optionModelOpen, translateY, layout.height]);

   const isUnsavedChangesAvailable = React.useMemo(() => {
      return !isEqualObjet(profile, profileDetails);
   }, [profile, profileDetails]);

   const handleImage = position => () => {
      Keyboard.dismiss();
      if (!isConnected) {
         showToast(stringSet.COMMON_TEXT.NO_INTERNET_CONNECTION);
      } else if (isConnected) {
         if (position === 'big' && profileDetails.image) {
            navigaiton.navigate(PROFILE_IMAGE, { userId });
         } else {
            toggleOptionModel();
         }
      }
   };

   const handleProfileUpdate = async () => {
      const validation =
         profileDetails?.nickName?.trim() &&
         profileDetails?.nickName?.trim()?.length > 2 &&
         profileDetails?.email &&
         /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileDetails?.email);
      if (!profileDetails?.nickName?.trim()) {
         return showToast(stringSet.TOAST_MESSAGES.ENTER_USER_NAME);
      }
      if (profileDetails?.nickName.trim()?.length < 3) {
         return showToast(stringSet.TOAST_MESSAGES.USER_NAME_TOO_SHORT);
      }
      if (!profileDetails?.email) {
         return showToast(stringSet.TOAST_MESSAGES.EMAIL_VALIDATION);
      }
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileDetails?.email)) {
         return showToast(stringSet.TOAST_MESSAGES.ENTER_VALID_MAIL);
      }
      if (!isConnected) {
         return showToast(stringSet.COMMON_TEXT.NO_INTERNET_CONNECTION);
      }
      if (isConnected && validation) {
         setIsLoading(true);
         const { nickName, image, status, mobileNumber, email } = profileDetails;
         const { statusCode, message } = await mirrorflyProfileUpdate({
            nickName,
            image,
            status,
            mobileNumber,
            email,
         });
         setIsLoading(false);
         if (statusCode === 200) {
            showToast(stringSet.TOAST_MESSAGES.PROFILE_UPDATE_SUCCESSFULLY);
            if (!canGoBack) {
               const gotoScreen = RECENTCHATSCREEN;
               RealmKeyValueStore.setItem('screen', gotoScreen);
               RootNavigation.reset(gotoScreen);
            }
         } else {
            showToast(message);
         }
         setIsLoading(false);
      }
   };

   const handleEmailChange = text => {
      setProfileDetails({
         ...profileDetails,
         email: text,
      });
   };

   const handleNicknameChange = text => {
      if (text.length > 30) {
         return showToast(stringSet.TOAST_MESSAGES.NICK_NAME_MAX_CHAR);
      }
      if (text.length < 31) {
         setProfileDetails({
            ...profileDetails,
            nickName: text,
         });
      }
   };

   const handleRemoveImage = () => {
      mirrorflyProfileUpdate({
         image: '',
      });
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const toggleConfirmRemovePhotoModal = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: stringSet.POPUP_TEXT.REMOVE_PROFILE_HEADER_TITLE,
         noButton: stringSet.BUTTON_LABEL.NO_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.YES_BUTTON,
         yesAction: handleRemoveImage,
      });
   };

   const handleTakePhoto = async () => {
      const _image = await handleImagePickerOpenCamera();
      setIsLoading(false);
      if (Object.keys(_image).length) {
         setIsLoading(true);
         setTimeout(async () => {
            await mirrorflyProfileUpdate({ image: _image });
            setIsLoading(false);
         }, 1000);
      }
   };

   const handleFromGallery = async () => {
      const _image = await handleImagePickerOpenGallery();
      setIsLoading(false);
      console.log('_image ==>', JSON.stringify(_image, null, 2));
      if (Object.keys(_image).length) {
         setIsLoading(true);
         setTimeout(async () => {
            await mirrorflyProfileUpdate({ image: _image });
            setIsLoading(false);
         }, 1000);
      }
   };

   const toggleOptionModel = () => {
      setOptionModelOpen(val => !val);
   };

   const handleOptionTakePhoto = () => {
      toggleOptionModel();
      setIsLoading(true);
      setTimeout(() => {
         handleTakePhoto();
      }, 1000);
   };

   const handleOptionGallery = () => {
      toggleOptionModel();
      setIsLoading(true);
      setTimeout(() => {
         handleFromGallery();
      }, 1000);
   };

   const handleOptionRemove = () => {
      toggleOptionModel();
      toggleConfirmRemovePhotoModal();
   };

   const handleRenderAuthImage = React.useMemo(() => {
      return (
         <AuthProfileImage
            component="profileImage"
            borderRadius="100"
            image={profileDetails?.image}
            nickName={profileDetails?.nickName}
         />
      );
   }, [profileDetails]);

   /**
   const handleGetMetaData = async () => {
      const res = await SDK.getMetaData();
      console.log('res ==>', JSON.stringify(res, null, 2));
   };

   const handleUpdateMetaData = async () => {
      const res = await SDK.updateMetaData({ date: 'Meta-Data' });
      console.log('res ==>', JSON.stringify(res, null, 2));
   };
   */

   return (
      <>
         <ScrollView
            style={[styles.keyBoardStyle, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? calculateKeyboardVerticalOffset() : 0}>
            {navigaiton.canGoBack() ? (
               <ScreenHeader title={stringSet.PROFILE_SCREEN.PROFILE_HEADER_TEXT} isSearchable={false} />
            ) : (
               <View style={[styles.titleContainer, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
                  <Text style={[styles.titleText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                     {stringSet.PROFILE_SCREEN.PROFILE_HEADER_TEXT}
                  </Text>
               </View>
            )}
            <View style={[commonStyles.justifyContentCenter]}>
               <View style={[commonStyles.alignItemsCenter, commonStyles.mt_50]}>
                  <View
                     style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 157,
                        width: 157,
                        position: 'relative',
                     }}>
                     <Pressable
                        pressedStyle={[
                           commonStyles.pressedBg(themeColorPalatte.pressedBg),
                           { borderRadius: 100, padding: 8 },
                        ]}
                        onPress={handleImage('big')}>
                        {Boolean(profileDetails?.image) && handleRenderAuthImage}
                        {!Boolean(profileDetails?.image) && Boolean(profileDetails?.nickName?.trim()) && (
                           <Avathar
                              fontSize={60}
                              width={157}
                              height={157}
                              data={profileDetails?.nickName?.trim()}
                              backgroundColor={themeColorPalatte.primaryColor}
                           />
                        )}
                        {!Boolean(profileDetails?.image) && !Boolean(profileDetails?.nickName?.trim()) && (
                           <Image
                              resizeMode="contain"
                              source={getImageSource(profileImage)}
                              style={{ height: 157, width: 157 }}
                           />
                        )}
                     </Pressable>
                     <Pressable
                        activeOpacity={1}
                        onPress={handleImage('small')}
                        style={{ position: 'absolute', right: 0, bottom: 0 }}>
                        <Image resizeMode="contain" source={getImageSource(CamerIcon)} style={styles.CameraImage} />
                     </Pressable>
                  </View>
                  <TextInput
                     style={{
                        color: themeColorPalatte.primaryTextColor,
                        fontSize: 16,
                        fontWeight: '600',
                        marginTop: 5,
                     }}
                     numberOfLines={1}
                     defaultValue={profileDetails?.nickName}
                     onChangeText={handleNicknameChange}
                     placeholder={stringSet.PLACEHOLDERS.ENTER_USER_NAME} // Adding a trailing space to fix a strange issue ( last letter "e" is not visible )
                     maxLength={31}
                     placeholderTextColor={themeColorPalatte.placeholderTextColor}
                     keyboardType="default"
                     cursorColor={themeColorPalatte.primaryColor}
                     selectionColor={themeColorPalatte.primaryColor}
                  />
               </View>
               <View style={{ padding: 20 }}>
                  <Text
                     style={[
                        {
                           fontSize: 14,
                           fontWeight: '500',
                           marginTop: 5,
                           color: themeColorPalatte.primaryTextColor,
                        },
                     ]}>
                     {stringSet.PROFILE_SCREEN.EMAIL_HEADER_LABEL}
                  </Text>
                  <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                     <MailIcon />
                     <TextInput
                        // editable={!canGoBack}
                        style={{ color: themeColorPalatte.secondaryTextColor, flex: 1, marginLeft: 8 }}
                        defaultValue={profileDetails?.email}
                        onChangeText={handleEmailChange}
                        maxLength={35}
                        placeholder={stringSet.PLACEHOLDERS.ENTER_EMAIL_ID}
                        placeholderTextColor={themeColorPalatte.placeholderTextColor}
                        keyboardType="default"
                        numberOfLines={1}
                        cursorColor={themeColorPalatte.primaryColor}
                        selectionColor={themeColorPalatte.primaryColor}
                     />
                  </View>
                  <View style={[commonStyles.dividerLine(themeColorPalatte.dividerBg), commonStyles.mt_12]} />
                  <Text
                     style={[
                        {
                           paddingVertical: 10,
                           fontSize: 14,
                           fontWeight: '500',
                           marginTop: 5,
                           color: themeColorPalatte.primaryTextColor,
                        },
                     ]}>
                     {stringSet.PROFILE_SCREEN.MOBILE_NUM_HEADER_LABEL}
                  </Text>
                  <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                     <CallIcon />
                     <Text style={[{ color: themeColorPalatte.secondaryTextColor, flex: 1, marginLeft: 8 }]}>
                        +{profileDetails?.mobileNumber}
                     </Text>
                  </View>
                  <View style={[commonStyles.dividerLine(themeColorPalatte.dividerBg), commonStyles.mt_12]} />
                  <Text
                     style={[
                        {
                           fontSize: 14,
                           fontWeight: '500',
                           marginTop: 5,
                           color: themeColorPalatte.primaryTextColor,
                           paddingTop: 10,
                        },
                     ]}>
                     {stringSet.PROFILE_SCREEN.STATUS_HEADER_LABEL}
                  </Text>
                  <Pressable onPress={handleRoute(PROFILE_STATUS_EDIT, { userId })}>
                     <View style={[commonStyles.hstack, commonStyles.alignItemsCenter, { paddingVertical: 10 }]}>
                        <StatusIcon />
                        <Text style={[{ color: themeColorPalatte.secondaryTextColor, flex: 1, marginLeft: 8 }]}>
                           {profileDetails?.status}
                        </Text>
                     </View>
                  </Pressable>
                  <View style={[commonStyles.dividerLine(themeColorPalatte.dividerBg), commonStyles.mt_12]} />
               </View>
               <View style={[commonStyles.alignItemsCenter, commonStyles.mt_50]}>
                  {!canGoBack && (
                     <Pressable
                        style={[commonStyles.primarypilbtn, commonStyles.bg_color(themeColorPalatte.primaryColor)]}
                        onPress={handleProfileUpdate}>
                        <Text
                           style={[
                              commonStyles.primarypilbtntext,
                              commonStyles.textColor(themeColorPalatte.colorOnPrimary),
                           ]}>
                           {isUnsavedChangesAvailable
                              ? stringSet.BUTTON_LABEL.UPDATE_CONTINUE_BUTTON
                              : stringSet.BUTTON_LABEL.SAVE_BUTTON}
                        </Text>
                     </Pressable>
                  )}
                  {canGoBack && (
                     <Pressable
                        disabled={!isUnsavedChangesAvailable}
                        style={[
                           commonStyles.primarypilbtn,
                           {
                              backgroundColor:
                                 isUnsavedChangesAvailable && canGoBack ? themeColorPalatte.primaryColor : '#d3d3d3',
                           },
                        ]}
                        onPress={handleProfileUpdate}>
                        <Text
                           style={[
                              commonStyles.primarypilbtntext,
                              commonStyles.textColor(themeColorPalatte.colorOnPrimary),
                           ]}>
                           {stringSet.BUTTON_LABEL.SAVE_BUTTON}
                        </Text>
                     </Pressable>
                  )}
               </View>
            </View>
            {isLoading && <LoadingModal />}
         </ScrollView>
         {modalContent && <AlertModal {...modalContent} />}
         <Modal visible={optionModelOpen} onRequestClose={toggleOptionModel}>
            <ModalBottomContent onPressOutside={toggleOptionModel}>
               <Animated.View
                  style={[
                     styles.optionModelContainer,
                     commonStyles.bg_color(themeColorPalatte.screenBgColor),
                     { transform: [{ translateY }] },
                  ]}>
                  <Text style={[styles.optionTitleText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                     {stringSet.INFO_SCREEN.PROFILE_PIC_EDIT_HEADER}
                  </Text>
                  <Pressable onPress={handleOptionTakePhoto}>
                     <Text style={[styles.pressableText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                        {stringSet.COMMON_TEXT.TAKE_PHOTO}
                     </Text>
                  </Pressable>
                  <Pressable onPress={handleOptionGallery}>
                     <Text style={[styles.pressableText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                        {stringSet.COMMON_TEXT.CHOOSE_FROM_GALLERY}
                     </Text>
                  </Pressable>
                  {Boolean(getUserImage(userId)) && (
                     <Pressable onPress={handleOptionRemove}>
                        <Text
                           style={[styles.pressableText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                           {stringSet.COMMON_TEXT.REMOVE_PHOTO}
                        </Text>
                     </Pressable>
                  )}
               </Animated.View>
            </ModalBottomContent>
         </Modal>
      </>
   );
};

export default ProfileScreen;

const styles = StyleSheet.create({
   keyBoardStyle: {
      flex: 1,
   },
   titleContainer: {
      alignItems: 'center',
      width: '100%',
      height: 65,
      paddingRight: 16,
      paddingVertical: 12,
   },
   CameraImage: {
      height: 42,
      width: 42,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '600',
   },
   optionTitleText: {
      fontSize: 16,
      marginVertical: 5,
      marginHorizontal: 20,
      lineHeight: 25,
   },
   optionModelContainer: {
      maxWidth: 500,
      width: '98%',
      paddingVertical: 12,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderBottomWidth: 3,
   },
   pressableText: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      fontWeight: '600',
   },
});
