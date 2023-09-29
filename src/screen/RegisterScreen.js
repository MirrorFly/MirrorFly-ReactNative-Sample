import React, { useEffect } from 'react';
import { BackHandler, Linking, Platform, TextInput } from 'react-native';
import { PrimaryPillBtn } from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '../redux/Actions/NavigationAction';
import {
  COUNTRYSCREEN,
  numRegx,
  PROFILESCREEN,
  REGISTERSCREEN,
} from '../constant';
import { getCurrentUserJid } from '../redux/Actions/AuthAction';
import { DownArrowIcon, RegiterPageIcon } from '../common/Icons';
import {
  Icon,
  Modal,
  Text,
  Center,
  Box,
  useToast,
  Spinner,
  HStack,
  Stack,
  VStack,
  Pressable,
  KeyboardAvoidingView,
  View,
} from 'native-base';
import { useNetworkStatus } from '../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SDK from '../SDK/SDK';
import messaging from '@react-native-firebase/messaging';

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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        BackHandler.exitApp();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

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
    if (
      isNetworkConnected &&
      !isToastShowing &&
      /^\d{10}$/i.test(mobileNumber)
    ) {
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
    );
    if (register.statusCode === 200) {
      await AsyncStorage.setItem('mirrorFlyLoggedIn', 'true');
      await AsyncStorage.setItem(
        'userIdentifier',
        JSON.stringify(selectcountry?.dial_code + mobileNumber),
      );
      await AsyncStorage.setItem('credential', JSON.stringify(register.data));
      handleConnect(register.data);
    } else {
      setIsLoading(false);
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
        break;
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (!isNetworkConnected && isLoading) {
      setIsLoading(false);
    }
  }, [isNetworkConnected]);
  /**
  const handleNotify = async () => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default name',
    });

    // const notificationBody = `Hey There ....!!!!`;

    // await notifee.displayNotification({
    //   // title:"Sample App",
    //   // body:notificationBody,
    //   // android:{
    //   //   channelId,
    //   //   largeIcon: 'https://subli.info/wp-content/uploads/2015/05/google-maps-blur.png',
    //   // },
    //   // title: '<p style="color: #4caf50;"><b>Styled HTMLTitle</span></p></b></p> &#128576;',
    //   titleWithImageAndStyle,
    //   subtitle: '&#129395;',
    //   body:
    //     'The <p style="text-decoration: line-through">body can</p> also be <p style="color: #ffffff; background-color: #9c27b0"><i>styled too</i></p> &#127881;!',
    //   android: {
    //     channelId,
    //     color: '#4caf50',
    //     actions: [
    //       {
    //         title: '<b>Dance</b> &#128111;',
    //         pressAction: { id: 'dance' },
    //       },
    //       {
    //         title: '<p style="color: #f44336;"><b>Cry</b> &#128557;</p>',
    //         pressAction: { id: 'cry' },
    //       },
    //     ],
    //   },
    // })

    const notificationImage = 'https://your-image-url.com/your-image.png';
    const notificationTitle = 'Styled HTMLTitle';
    const notificationSubtitle = '&#129395;';
    const notificationBody = 'The body can also be styled too! &#127881;';
    const scheduleTime = new Date().getTime() + 5000;
    // const notification = {
    //   title: notificationTitle,
    //   subtitle: notificationSubtitle,
    //   body: notificationBody,
    //   android: {
    //     channelId,
    //     color: '#4caf50',
    //     actions: [
    //       {
    //         title: 'Dance',
    //         pressAction: { id: 'dance' },
    //       },
    //       {
    //         title: 'Cry',
    //         pressAction: { id: 'cry' },
    //       },
    //     ],
    //     customContentView: {
    //       contentView: {
    //         type: notifee.ContentType.BIG_TEXT,
    //         title: 'Custom Notification',
    //         content: `
    //           <div style="display: flex; align-items: center;">

    //             <span style="color: #4caf50; font-weight: bold;">${notificationTitle}</span>
    //           </div>
    //           <div>${notificationSubtitle}</div>
    //           <div>${notificationBody}</div>
    //         `,
    //         htmlFormatContent: true,
    //       },
    //     },
    //   },
    // };

    notifee.displayNotification({
      // title: '<p style="color: #4caf50;"><b>Styled HTMLTitle</span></p></b></p> &#128576;',
      // subtitle: '&#129395;',
      // body:
      //   '<img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" style="width: 20px; height: 20px;" />',
      title: 'Title Push notification',
      body: 'Title Body sample Notification',
      android: {
        channelId,
        color: '#4caf50',
        schedule: {
          fireDate: scheduleTime,
        },
        smallIcon: 'ic_launcher',
        largeIcon: require('../assets/BG.png'),
      },
    });
  };
 */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <VStack h="full" justifyContent={'center'}>
        <VStack alignItems={'center'}>
          <Icon as={RegiterPageIcon} />
          <View mt="4" />
          {/* // Space between Logo and Text */}
          <Text mt="19" fontWeight="600" fontSize="23">
            Register Your Number
          </Text>
          <Text
            px="5"
            color="#767676"
            fontSize="13"
            fontWeight="400"
            textAlign="center">
            Please choose your country code and enter your mobile number to get
            the verification code.
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
            <Stack
              height="8"
              ml="1"
              mt="2"
              borderLeftWidth="1"
              borderColor="#f2f2f2"
            />
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
          <PrimaryPillBtn title="Continue" onPress={handleSubmit} />
          {/* <PrimaryPillBtn title="Push Remote" onPress={handleRemoteNotify} /> */}
          {/* <PrimaryPillBtn title="Push Local" onPress={handleNotify} /> */}
        </Stack>
        <Stack mt="22" justifyContent="center" alignItems="center">
          <Text color="#767676" fontSize="14" fontWeight="400">
            By clicking continue you agree to MirroFly
          </Text>
          <HStack>
            <Pressable
              mx="1"
              borderBottomWidth="1"
              borderBottomColor="#3276E2"
              onPress={termsHandler}>
              <Text color="#3276E2" mr="1" fontSize="14">
                Terms and Conditions,
              </Text>
            </Pressable>
            <Pressable
              borderBottomWidth="1"
              borderBottomColor="#3276E2"
              onPress={PolicyHandler}>
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
