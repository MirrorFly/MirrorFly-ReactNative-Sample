import messaging from '@react-native-firebase/messaging';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, Text, TextInput, View } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import { RealmKeyValueStore } from '../SDK/SDK';
import { DownArrowIcon, RegiterPageIcon } from '../common/Icons';
import LoadingModal from '../common/LoadingModal';
import { useNetworkStatus } from '../common/hooks';
import { showToast } from '../helpers/chatHelpers';
import { numRegx } from '../helpers/constants';
import commonStyles from '../styles/commonStyles';
import { mirrorflyRegister } from '../uikitMethods';
import { COUNTRY_LIST_SCREEN, PROFILE_SCREEN, SETTINGS_STACK } from './constants';

const RegisterScreen = ({ navigation }) => {
   const { params: { selectcountry = { dial_code: '91', name: 'India', code: 'IN' } } = {} } = useRoute();

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

   const handleSubmit = async () => {
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
         });
         setIsLoading(false);
         if (statusCode === 200 || statusCode === 409) {
            RealmKeyValueStore.setItem('screen', SETTINGS_STACK);
            RootNavigation.reset(SETTINGS_STACK, { screen: PROFILE_SCREEN });
         }
      }
   };

   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <View style={[commonStyles.flex1, commonStyles.vstack, commonStyles.justifyContentCenter]}>
            <View style={[commonStyles.vstack, commonStyles.alignItemsCenter]}>
               <RegiterPageIcon />
               <View style={commonStyles.mt_12} />
               {/* // Space between Logo and Text */}
               <Text
                  style={[commonStyles.mt_20, commonStyles.fw_600, commonStyles.fontSize_18, commonStyles.colorBlack]}>
                  Register Your Number
               </Text>
               <Text
                  style={{
                     paddingHorizontal: 20,
                     fontSize: 13,
                     fontWeight: '400',
                     textAlign: 'center',
                  }}>
                  Please choose your country code and enter your mobile number to get the verification code.
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
                  <Text style={{ fontSize: 15, color: '#181818', fontWeight: '600' }}>{selectcountry?.name}</Text>
                  <DownArrowIcon />
               </View>
               <View style={commonStyles.dividerLine} />
            </Pressable>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter, commonStyles.marginLeft_15]}>
               <View style={[commonStyles.hstack, commonStyles.mt_12, commonStyles.alignItemsCenter]}>
                  <Text style={{ fontSize: 16, color: 'black', fontWeight: '600' }}>+{selectcountry?.dial_code}</Text>
                  <TextInput
                     style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: '500',
                        marginLeft: 10,
                     }}
                     placeholderTextColor="#d3d3d3"
                     returnKeyType="done"
                     keyboardType="numeric"
                     placeholder="Enter mobile number"
                     onChangeText={value => {
                        if (value.match(numRegx) || !value) {
                           setMobileNumber(value);
                        }
                     }}
                     value={mobileNumber}
                     maxLength={15}
                     selectionColor={'#3276E2'}
                  />
               </View>
            </View>
            <View style={[commonStyles.alignItemsCenter, commonStyles.mt_50]}>
               <Pressable style={commonStyles.primarypilbtn} onPress={handleSubmit}>
                  <Text style={commonStyles.primarypilbtntext}>Continue</Text>
               </Pressable>
            </View>
            <View
               style={{ marginTop: 44, justifyContent: 'center', alignItems: 'center' }}
               // mt="22" justifyContent="center" alignItems="center"
            >
               <Text style={{ color: '#767676', fontSize: 14, fontWeight: '400' }}>
                  By clicking continue you agree to MirroFly
               </Text>
               <View style={[commonStyles.hstack]}>
                  <Pressable onPress={termsHandler}>
                     <Text
                        style={{
                           color: '#3276E2',
                           fontSize: 14,
                           textDecorationLine: 'underline',
                        }}>
                        Terms and Conditions
                     </Text>
                  </Pressable>
                  <Text style={{ padding: 1 }}>,</Text>
                  <Pressable onPress={PolicyHandler}>
                     <Text style={{ color: '#3276E2', fontSize: 14, textDecorationLine: 'underline' }}>
                        Privacy Policy.
                     </Text>
                  </Pressable>
               </View>
            </View>
            {isLoading && <LoadingModal message={'Please Wait'} />}
         </View>
      </KeyboardAvoidingView>
   );
};

export default RegisterScreen;
