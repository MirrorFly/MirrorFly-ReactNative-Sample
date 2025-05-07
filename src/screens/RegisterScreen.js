import messaging from '@react-native-firebase/messaging';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, View } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import { RealmKeyValueStore } from '../SDK/SDK';
import { DownArrowIcon, RegiterPageIcon } from '../common/Icons';
import LoadingModal from '../common/LoadingModal';
import Text from '../common/Text';
import TextInput from '../common/TextInput';
import { useNetworkStatus } from '../common/hooks';
import { change16TimeWithDateFormat } from '../common/timeStamp';
import { showToast } from '../helpers/chatHelpers';
import { numRegx } from '../helpers/constants';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { mirrorflyRegister } from '../uikitMethods';
import { COUNTRY_LIST_SCREEN, PROFILE_SCREEN, SETTINGS_STACK } from './constants';
import { useDispatch } from 'react-redux';
import { setModalContent, toggleModalContent } from '../redux/alertModalSlice';

const RegisterScreen = ({ navigation }) => {
   const dispatch = useDispatch();
   const { params: { selectcountry = { dial_code: '91', name: 'India', code: 'IN' } } = {} } = useRoute();
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const [isLoading, setIsLoading] = React.useState(false);
   const [mobileNumber, setMobileNumber] = React.useState('');
   const [isToastShowing, setIsToastShowing] = React.useState(false);
   const isNetworkConnected = useNetworkStatus();

   const termsHandler = () => {
      Linking.openURL('https://www.mirrorfly.com/terms-and-conditions.php');
   };

   const PolicyHandler = () => {
      Linking.openURL('https://www.mirrorfly.com/privacy-policy.php');
   };

   React.useEffect(() => {
      if (!isNetworkConnected && isLoading) {
         setIsLoading(false);
      }
   }, [isNetworkConnected]);

   const selectCountryHandler = () => {
      navigation.navigate(COUNTRY_LIST_SCREEN);
   };

   const fcmTokenCheck = async () => {
      try {
         const fcmToken = await messaging().getToken();
         return fcmToken;
      } catch (error) {
         return false;
      }
   };

   const resetModalContent = () => {
      dispatch(toggleModalContent());
   };

   const promptForceRegister = () => {
      setTimeout(() => {
         dispatch(
            setModalContent({
               visible: true,
               onRequestClose: resetModalContent,
               title: 'You have reached the maximum device limit. If you want to continue, one of your device  will be logged out. Do you want to continue?',
               noButton: 'Cancel',
               yesButton: 'Contuine',
               yesAction: () => handleSubmit(true),
            }),
         );
      }, 500);
   };

   const handleSubmit = async (forceRegister = false) => {
      setIsToastShowing(true);
      if (!mobileNumber) {
         showToast('Please Enter Mobile Number');
         return;
      }
      if (mobileNumber.length <= '5') {
         showToast('Your mobile number is too short');
         return;
      }
      if (!isToastShowing && !/^\d{10}$/i.test(mobileNumber)) {
         showToast('Please enter a valid mobile number');
         return;
      }
      if (!isNetworkConnected) {
         showToast('Please check your internet connectivity');
         return;
      }
      if (isNetworkConnected && /^\d{10}$/i.test(mobileNumber)) {
         setIsLoading(true);
         const fcmToken = await fcmTokenCheck();
         const { statusCode } = await mirrorflyRegister({
            userIdentifier: selectcountry?.dial_code + mobileNumber,
            fcmToken,
            navEnabled: true,
            metadata: {
               register: change16TimeWithDateFormat(Date.now()),
            },
            forceRegister,
         });
         setIsLoading(false);
         if (statusCode === 200 || statusCode === 409) {
            RealmKeyValueStore.setItem('screen', SETTINGS_STACK);
            RootNavigation.reset(SETTINGS_STACK, { screen: PROFILE_SCREEN });
         } else if (statusCode === 403) {
            promptForceRegister();
         }
      }
   };

   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <View
            style={[
               commonStyles.flex1,
               commonStyles.vstack,
               commonStyles.justifyContentCenter,
               commonStyles.bg_color(themeColorPalatte.screenBgColor),
            ]}>
            <View style={[commonStyles.vstack, commonStyles.alignItemsCenter]}>
               <RegiterPageIcon />
               <View style={commonStyles.mt_12} />
               {/* // Space between Logo and Text */}
               <Text
                  style={[
                     commonStyles.mt_20,
                     commonStyles.fw_600,
                     commonStyles.fontSize_18,
                     commonStyles.textColor(themeColorPalatte.primaryTextColor),
                  ]}>
                  {stringSet.REGISTER_SCREEN.REGISTER_NUMBER}
               </Text>
               <Text
                  style={[
                     {
                        paddingHorizontal: 20,
                        fontSize: 13,
                        fontWeight: '400',
                        textAlign: 'center',
                        color: themeColorPalatte.primaryTextColor,
                     },
                  ]}>
                  {stringSet.REGISTER_SCREEN.REGISTER_INFO_MESSAGE}
               </Text>
            </View>
            <Pressable onPress={selectCountryHandler}>
               <View
                  style={[
                     commonStyles.hstack,
                     commonStyles.justifyContentSpaceBetween,
                     commonStyles.alignItemsCenter,
                     commonStyles.p_20,
                  ]}>
                  <Text style={{ fontSize: 15, color: themeColorPalatte.primaryTextColor, fontWeight: '600' }}>
                     {selectcountry?.name}
                  </Text>
                  <DownArrowIcon />
               </View>
               <View style={commonStyles.dividerLine(themeColorPalatte.dividerBg)} />
            </Pressable>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter, commonStyles.marginLeft_15]}>
               <View style={[commonStyles.hstack, commonStyles.mt_12, commonStyles.alignItemsCenter]}>
                  <Text style={{ fontSize: 16, color: themeColorPalatte.primaryTextColor, fontWeight: '600' }}>
                     +{selectcountry?.dial_code}
                  </Text>
                  <TextInput
                     style={[
                        {
                           flex: 1,
                           fontSize: 15,
                           fontWeight: '500',
                           marginLeft: 10,
                           color: themeColorPalatte.primaryTextColor,
                        },
                     ]}
                     placeholderTextColor={themeColorPalatte.placeholderTextColor}
                     cursorColor={themeColorPalatte.primaryColor}
                     returnKeyType="done"
                     keyboardType="numeric"
                     placeholder={stringSet.PLACEHOLDERS.ENTER_MOBILE_NUMBER}
                     onChangeText={value => {
                        if (value.match(numRegx) || !value) {
                           setMobileNumber(value);
                        }
                     }}
                     value={mobileNumber}
                     maxLength={15}
                     selectionColor={themeColorPalatte.primaryColor}
                  />
               </View>
            </View>
            <View style={[commonStyles.alignItemsCenter, commonStyles.mt_50]}>
               <Pressable
                  style={[commonStyles.primarypilbtn, commonStyles.bg_color(themeColorPalatte.primaryColor)]}
                  onPress={() => handleSubmit(false)}>
                  <Text
                     style={[commonStyles.primarypilbtntext, commonStyles.textColor(themeColorPalatte.colorOnPrimary)]}>
                     {stringSet.REGISTER_SCREEN.REGISTER_CONTINUE_BUTTON_LABEL}
                  </Text>
               </Pressable>
            </View>
            <View style={{ marginTop: 44, justifyContent: 'center', alignItems: 'center' }}>
               <Text style={[{ color: themeColorPalatte.secondaryTextColor, fontSize: 14, fontWeight: '400' }]}>
                  {stringSet.REGISTER_SCREEN.REGISTER_AGREE_LABEL}
               </Text>
               <View style={[commonStyles.hstack]}>
                  <Pressable onPress={termsHandler}>
                     <Text
                        style={[
                           {
                              color: themeColorPalatte.primaryColor,
                              fontSize: 14,
                              textDecorationLine: 'underline',
                           },
                        ]}>
                        {stringSet.REGISTER_SCREEN.REGISTER_TERMS_AND_CONDITION}
                     </Text>
                  </Pressable>
                  <Text style={{ padding: 1 }}>,</Text>
                  <Pressable onPress={PolicyHandler}>
                     <Text
                        style={[
                           {
                              color: themeColorPalatte.primaryColor,
                              fontSize: 14,
                              textDecorationLine: 'underline',
                           },
                        ]}>
                        {stringSet.REGISTER_SCREEN.REGISTER_PRIVACY_POLICY}
                     </Text>
                  </Pressable>
               </View>
            </View>
            {isLoading && <LoadingModal message={stringSet.COMMON_TEXT.PLEASE_WAIT_LABEL} />}
         </View>
      </KeyboardAvoidingView>
   );
};

export default RegisterScreen;
