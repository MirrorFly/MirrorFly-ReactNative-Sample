import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import { RealmKeyValueStore } from '../SDK/SDK';
import CamerIcon from '../assets/camera.png';
import profileImage from '../assets/profile.png';
import Avathar from '../common/Avathar';
import { MailIcon, StatusIcon } from '../common/Icons';
import LoadingModal from '../common/LoadingModal';
import ScreenHeader from '../common/ScreenHeader';
import { useNetworkStatus } from '../common/hooks';
import AuthProfileImage from '../components/AuthProfileImage';
import ApplicationColors from '../config/appColors';
import {
   calculateKeyboardVerticalOffset,
   getImageSource,
   getUserIdFromJid,
   isEqualObjet,
   showToast,
} from '../helpers/chatHelpers';
import { useRoasterData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid, mirrorflyProfileUpdate } from '../uikitMethods';
import { RECENTCHATSCREEN } from './constants';

const ProfileScreen = () => {
   const [isLoading, setIsLoading] = React.useState(true);
   const currentUserJID = getCurrentUserJid();
   const navigaiton = useNavigation();
   const userId = getUserIdFromJid(currentUserJID);
   const profile = useRoasterData(userId);
   const [profileDetails, setProfileDetails] = React.useState({ status: 'I am in Mirror Fly' });
   const [imageUploading, setImageUploading] = React.useState(false);
   const isConnected = useNetworkStatus();
   const canGoBack = navigaiton.canGoBack();

   React.useEffect(() => {
      if (!isEqualObjet(profile, profileDetails)) {
         setProfileDetails(profile);
      }
      setIsLoading(false);
   }, [profile]);

   const isUnsavedChangesAvailable = React.useMemo(() => {
      return !isEqualObjet(profile, profileDetails);
   }, [profile, profileDetails]);

   const handleImage = position => () => {
      Keyboard.dismiss();
      if (!isConnected) {
         showToast('Please check your internet connectivity');
      } else if (isConnected) {
         // to write logic here
      }
   };

   const handleProfileUpdate = async () => {
      console.log('profileDetails ===>', JSON.stringify(profileDetails, null, 2));
      const validation =
         profileDetails?.nickName.trim() &&
         profileDetails?.nickName.trim()?.length > 2 &&
         profileDetails?.email &&
         /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileDetails?.email);
      if (!profileDetails?.nickName.trim()) {
         return showToast('Please enter your username');
      }
      if (profileDetails?.nickName.trim()?.length < 3) {
         return showToast('Username is too short');
      }
      if (!profileDetails?.email) {
         return showToast('Email should not be empty');
      }
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileDetails?.email)) {
         return showToast('Please enter a Valid E-Mail');
      }
      if (!isConnected) {
         return showToast('Please check your internet connectivity');
      }
      if (isConnected && validation) {
         setIsLoading(true);
         const { nickName, image, status, mobileNumber, email } = profileDetails;
         const { statusCode, message } = await mirrorflyProfileUpdate({
            _nickName: nickName,
            _image: image,
            _status: status,
            _mobileNumber: mobileNumber,
            _email: email,
         });
         if (statusCode === 200) {
            showToast('Profile Updated successfully');
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
         return showToast('Maximum of 30 Characters');
      }
      if (text.length < 31) {
         setProfileDetails({
            ...profileDetails,
            nickName: text,
         });
      }
   };

   const handleRenderAuthImage = React.useMemo(() => {
      return (
         <AuthProfileImage
            component="profileImage"
            borderRadius="100"
            imageUploading={imageUploading}
            image={profileDetails?.image}
            nickName={profileDetails?.nickName}
         />
      );
   }, [profileDetails]);

   return (
      <ScrollView
         style={styles.keyBoardStyle}
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
         keyboardVerticalOffset={Platform.OS === 'ios' ? calculateKeyboardVerticalOffset() : 0}>
         {navigaiton.canGoBack() ? (
            <ScreenHeader title="Profile" isSearchable={false} />
         ) : (
            <View style={styles.titleContainer}>
               <Text style={styles.titleText}>Profile</Text>
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
                  <Pressable onPress={handleImage('big')}>
                     {Boolean(profileDetails?.image) && handleRenderAuthImage}
                     {!Boolean(profileDetails?.image) && Boolean(profileDetails?.nickName?.trim()) && (
                        <Avathar
                           fontSize={60}
                           width={157}
                           height={157}
                           data={profile?.nickName?.trim()}
                           backgroundColor={'#3276E2'}
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
                     fontSize: 16,
                     fontWeight: '600',
                     marginTop: 5,
                  }}
                  numberOfLines={1}
                  defaultValue={profileDetails?.nickName}
                  onChangeText={handleNicknameChange}
                  placeholder="Username " // Adding a trailing space to fix a strange issue ( last letter "e" is not visible )
                  maxLength={31}
                  placeholderTextColor="#959595"
                  keyboardType="default"
                  cursorColor={ApplicationColors.mainColor}
               />
            </View>
            <View style={{ padding: 20 }}>
               <Text
                  style={{
                     fontSize: 14,
                     fontWeight: '500',
                     marginTop: 5,
                     color: '#000',
                  }}>
                  Email
               </Text>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <MailIcon />
                  <TextInput
                     editable={!canGoBack}
                     style={{ color: '#959595', flex: 1, marginLeft: 8 }}
                     defaultValue={profileDetails?.email}
                     onChangeText={handleEmailChange}
                     maxLength={35}
                     placeholder="Enter Email Id"
                     placeholderTextColor={'#959595'}
                     keyboardType="default"
                     numberOfLines={1}
                  />
               </View>
               <View style={[commonStyles.dividerLine, commonStyles.mt_12]} />
               <Text style={{ paddingVertical: 10, fontSize: 14, fontWeight: '500', marginTop: 5, color: '#000' }}>
                  Mobile Number
               </Text>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <MailIcon />
                  <Text style={{ color: '#959595', flex: 1, marginLeft: 8 }}>+{profileDetails?.mobileNumber}</Text>
               </View>
               <View style={[commonStyles.dividerLine, commonStyles.mt_12]} />
               <Text style={{ paddingVertical: 10, fontSize: 14, fontWeight: '500', marginTop: 5, color: '#000' }}>
                  Status
               </Text>
               <Pressable style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <StatusIcon />
                  <Text style={{ color: '#959595', flex: 1, marginLeft: 8 }}>{profileDetails?.status}</Text>
               </Pressable>
               <View style={[commonStyles.dividerLine, commonStyles.mt_12]} />
            </View>
            <View style={[commonStyles.alignItemsCenter, commonStyles.mt_50]}>
               {!canGoBack && (
                  <Pressable style={[commonStyles.primarypilbtn]} onPress={handleProfileUpdate}>
                     <Text style={commonStyles.primarypilbtntext}>
                        {isUnsavedChangesAvailable ? 'Update & Continue' : 'Save'}
                     </Text>
                  </Pressable>
               )}
               {canGoBack && (
                  <Pressable
                     disabled={!isUnsavedChangesAvailable}
                     style={[
                        commonStyles.primarypilbtn,
                        {
                           backgroundColor: isUnsavedChangesAvailable && canGoBack ? '#3276E2' : '#d3d3d3',
                        },
                     ]}
                     onPress={handleProfileUpdate}>
                     <Text style={commonStyles.primarypilbtntext}>Save</Text>
                  </Pressable>
               )}
            </View>
         </View>
         {isLoading && <LoadingModal />}
      </ScrollView>
   );
};

export default ProfileScreen;

const styles = StyleSheet.create({
   keyBoardStyle: {
      flex: 1,
      backgroundColor: ApplicationColors.white,
   },
   titleContainer: {
      alignItems: 'center',
      width: '100%',
      height: 65,
      backgroundColor: ApplicationColors.headerBg,
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
      color: ApplicationColors.black,
   },
});
