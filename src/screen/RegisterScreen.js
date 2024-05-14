import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {
   Box,
   Center,
   HStack,
   Icon,
   KeyboardAvoidingView,
   Modal,
   Pressable,
   Spinner,
   Stack,
   Text,
   VStack,
   View,
   useToast,
} from 'native-base';
import React, { useEffect } from 'react';
import { BackHandler, Linking, Platform, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../Helper';
import { getCurrentScreen } from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import { PrimaryPillBtn } from '../common/Button';
import { DownArrowIcon, RegiterPageIcon } from '../common/Icons';
import { COUNTRYSCREEN, PROFILESCREEN, REGISTERSCREEN, numRegx } from '../constant';
import { useNetworkStatus } from '../hooks';
import { getCurrentUserJid } from '../redux/Actions/AuthAction';
import { navigate } from '../redux/Actions/NavigationAction';
import { getVoipToken } from '../uikitHelpers/uikitMethods';

const RegisterScreen = ({ navigation }) => {
   const dispatch = useDispatch();
   const toast = useToast();
   const selectcountry = useSelector(state => state.navigation.selectContryCode);
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

   useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, []);

   const handleBackBtn = () => {
      if (getCurrentScreen() === REGISTERSCREEN) {
         BackHandler.exitApp();
      }
      return true;
   };

   const selectCountryHandler = () => {
      let x = { screen: COUNTRYSCREEN };
      dispatch(navigate(x));
      navigation.navigate(COUNTRYSCREEN);
   };

   const handleSubmit = () => {
      const toastConfig = {
         duration: 2500,
         avoidKeyboard: true,
         onCloseComplete: () => {
            setIsToastShowing(false);
         },
      };
      setIsToastShowing(true);
      if (!mobileNumber && !isToastShowing) {
         return toast.show({
            ...toastConfig,
            render: () => {
               return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                     <Text color={'#fff'} p={'2'}>
                        Please Enter Mobile Number
                     </Text>
                  </Box>
               );
            },
         });
      }
      if (mobileNumber.length <= '5' && !isToastShowing) {
         return toast.show({
            ...toastConfig,
            render: () => {
               return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                     <Text color={'#fff'} p={'2'}>
                        Your mobile number is too short
                     </Text>
                  </Box>
               );
            },
         });
      }
      if (!isToastShowing && !/^\d{10}$/i.test(mobileNumber)) {
         return toast.show({
            ...toastConfig,
            render: () => {
               return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                     <Text color={'#fff'} p={'2'}>
                        Please enter a valid mobile number
                     </Text>
                  </Box>
               );
            },
         });
      }
      if (!isNetworkConnected && !isToastShowing) {
         return toast.show({
            ...toastConfig,
            render: () => {
               return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                     <Text color={'#fff'} p={'2'}>
                        Please check your internet connectivity
                     </Text>
                  </Box>
               );
            },
         });
      }
      if (isNetworkConnected && !isToastShowing && /^\d{10}$/i.test(mobileNumber)) {
         setIsLoading(true);
         handleRegister();
      }
   };
   const fcmTokenCheck = async () => {
      try {
         const fcmToken = await messaging().getToken();
         return fcmToken;
      } catch (error) {
         return false;
      }
   };

   const handleRegister = async () => {
      setIsToastShowing(false);
      const fcmToken = await fcmTokenCheck();
      const register = await SDK.register(
         selectcountry?.dial_code + mobileNumber,
         fcmToken,
         getVoipToken(),
         process.env?.NODE_ENV === 'production',
      );
      if (register.statusCode === 200) {
         await AsyncStorage.setItem('mirrorFlyLoggedIn', 'true');
         await AsyncStorage.setItem('userIdentifier', JSON.stringify(selectcountry?.dial_code + mobileNumber));
         await AsyncStorage.setItem('credential', JSON.stringify(register.data));
         handleConnect(register.data);
      } else {
         setIsLoading(false);
         showToast(register?.message, { id: register?.message });
      }
   };
   const handleConnect = async register => {
      let connect = await SDK.connect(register.username, register.password);
      switch (connect?.statusCode) {
         case 200:
         case 409:
            let nav = { screen: PROFILESCREEN, prevScreen: REGISTERSCREEN };
            let jid = await SDK.getCurrentUserJid();
            let userJID = jid.userJid.split('/')[0];
            AsyncStorage.setItem('currentUserJID', JSON.stringify(userJID));
            dispatch(getCurrentUserJid(userJID));
            dispatch(navigate(nav));
            navigation.navigate(PROFILESCREEN);
            setMobileNumber();
            break;
         default:
            showToast(connect?.message, { id: connect?.message });
            break;
      }
      setIsLoading(false);
   };

   React.useEffect(() => {
      if (!isNetworkConnected && isLoading) {
         setIsLoading(false);
      }
   }, [isNetworkConnected]);
   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <VStack h="full" justifyContent={'center'}>
            <VStack alignItems={'center'}>
               <Icon as={RegiterPageIcon} />
               <View mt="4" />
               {/* // Space between Logo and Text */}
               <Text mt="19" fontWeight="600" fontSize="23">
                  Register Your Number
               </Text>
               <Text px="5" color="#767676" fontSize="13" fontWeight="400" textAlign="center">
                  Please choose your country code and enter your mobile number to get the verification code.
               </Text>
            </VStack>
            <Pressable px="5" mt="5" onPress={selectCountryHandler}>
               <HStack
                  pb="3"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottomColor="#f2f2f2"
                  borderBottomWidth="1">
                  <Text fontSize="15" color="#181818" fontWeight="600">
                     {selectcountry?.name}
                  </Text>
                  <Icon as={DownArrowIcon} name="emoji-happy" />
               </HStack>
            </Pressable>
            <HStack alignItems="center" ml="6" mt="0">
               <HStack mt="2" alignItems="center" mr="5">
                  <Text fontSize="16" color="black" fontWeight="600" mr="1">
                     +{selectcountry?.dial_code}
                  </Text>
                  <Stack height="8" ml="1" mt="2" borderLeftWidth="1" borderColor="#f2f2f2" />
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
               </HStack>
            </HStack>
            <Stack alignItems="center" mt="42">
               <PrimaryPillBtn title=" Continue " onPress={handleSubmit} />
               {/* <PrimaryPillBtn title="Push Remote" onPress={handleRemoteNotify} /> */}
               {/* <PrimaryPillBtn title="Push Local" onPress={handleNotify} /> */}
            </Stack>
            <Stack mt="22" justifyContent="center" alignItems="center">
               <Text color="#767676" fontSize="14" fontWeight="400">
                  By clicking continue you agree to MirroFly
               </Text>
               <HStack>
                  <Pressable mx="1" borderBottomWidth="1" borderBottomColor="#3276E2" onPress={termsHandler}>
                     <Text color="#3276E2" mr="1" fontSize="14">
                        Terms and Conditions,
                     </Text>
                  </Pressable>
                  <Pressable borderBottomWidth="1" borderBottomColor="#3276E2" onPress={PolicyHandler}>
                     <Text color="#3276E2" fontSize="14">
                        Privacy Policy.
                     </Text>
                  </Pressable>
               </HStack>
            </Stack>
            <Modal isOpen={isLoading} safeAreaTop={true}>
               <Modal.Content width="60%" height="9%">
                  <Center w="100%" h="full">
                     <HStack alignItems={'center'}>
                        <Spinner size="lg" color={'#3276E2'} />
                        <Text
                           style={{
                              color: 'black',
                              paddingHorizontal: 15,
                              fontWeight: '500',
                           }}>
                           Please Wait
                        </Text>
                     </HStack>
                  </Center>
               </Modal.Content>
            </Modal>
         </VStack>
      </KeyboardAvoidingView>
   );
};

export default RegisterScreen;
