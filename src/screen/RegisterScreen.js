import React from 'react';
import { Linking, TextInput } from 'react-native';
import { PrimaryPillBtn } from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { COUNTRYSCREEN, numRegx, PROFILESCREEN, REGISTERSCREEN } from '../constant';
import { registerData } from '../redux/authSlice';
import { getRecentChat } from '../redux/chatSlice';
import { DownArrowIcon, RegiterPageIcon } from '../common/Icons';
import { Icon, Modal, Text, Center, Box, useToast, Spinner, HStack, Stack, VStack, Pressable, KeyboardAvoidingView, View } from 'native-base';

const RegisterScreen = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const selectcountry = useSelector(state => state.navigation.selectContryCode);
    const isLoading = useSelector(state => state.auth.status);
    const [mobileNumber, setMobileNumber] = React.useState('')
    const [isToastShowing, setIsToastShowing] = React.useState(false)

    const termsHandler = () => {
        Linking.openURL("https://www.mirrorfly.com/terms-and-conditions.php");
    }

    const PolicyHandler = () => {
        Linking.openURL("https://www.mirrorfly.com/privacy-policy.php");
    }

    const selectCountryHandler = () => {
        let x = { screen: COUNTRYSCREEN }
        dispatch(navigate(x))
    }

    const handleSubmit = () => {
        const toastConfig = {
            duration: 2500,
            avoidKeyboard: true,
            onCloseComplete: () => {
                setIsToastShowing(false)
            }
        }
        setIsToastShowing(true)
        if (!mobileNumber && !isToastShowing) {
            return toast.show({
                ...toastConfig,
                render: () => {
                    return <Box bg="black" px="2" py="1" rounded="sm" >
                        <Text style={{ color: "#fff", padding: 5 }}>Please Enter Mobile Number</Text>
                    </Box>;
                }
            })
        }
        if (mobileNumber.length <= '5' && !isToastShowing) {
            return toast.show({
                ...toastConfig,
                render: () => {
                    return <Box bg="black" px="2" py="1" rounded="sm" >
                        <Text style={{ color: "#fff", padding: 5 }}>Your mobile number is too short</Text>
                    </Box>;
                }
            })
        }
        if (!isToastShowing && !/^\d{10}$/i.test(mobileNumber)) {
            return toast.show({
                ...toastConfig,
                render: () => {
                    return <Box bg="black" px="2" py="1" rounded="sm" >
                        <Text style={{ color: "#fff", padding: 5 }}>Please enter a valid mobile number</Text>
                    </Box>;
                }
            })
        }
        if (!isToastShowing && /^\d{10}$/i.test(mobileNumber)) {
            dispatch(registerData(selectcountry?.dial_code + mobileNumber)).then((res) => {
                dispatch(getRecentChat())
                let nav = { screen: PROFILESCREEN, prevScreen: REGISTERSCREEN }
                dispatch(navigate(nav))
            })
        }
    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <VStack h='full' justifyContent={'center'}>
                <VStack alignItems={'center'}>
                    <Icon as={RegiterPageIcon} />
                    <View mt='4' ></View>{/* // Space between Logo and Text */}
                    <Text mt="19" fontWeight="600" fontSize="23">
                        Register Your Number
                    </Text>
                    <Text px='5' color="#767676" fontSize="13" fontWeight="400" textAlign="center">
                        Please choose your country code and enter your mobile number to get the verification code.
                    </Text>
                </VStack>
                <Pressable px="5" mt='5' onPress={selectCountryHandler}>
                    <HStack pb='3' justifyContent="space-between" alignItems="center" borderBottomColor="#f2f2f2" borderBottomWidth="1">
                        <Text fontSize="15" color="#181818" fontWeight="600">
                            {selectcountry?.name}
                        </Text>
                        <Icon as={DownArrowIcon} name="emoji-happy" />
                    </HStack>
                </Pressable>
                <HStack alignItems="center" ml="6" mt="0"  >
                    <HStack mt="2" alignItems="center" mr="5"  >
                        <Text fontSize="16" color="black" fontWeight="600" mr="1">
                            +{selectcountry?.dial_code}
                        </Text>
                        <Stack height="8" ml="1" mt="2" borderLeftWidth="1" borderColor='#f2f2f2' />
                        <TextInput
                            style={{
                                flex: 1,
                                fontSize: 15,
                                fontWeight: '500',
                                marginLeft: 10
                            }}
                            placeholderTextColor="#d3d3d3"
                            returnKeyType='done'
                            keyboardType="numeric"
                            placeholder="Enter mobile number"
                            onChangeText={(value) => {
                                if (value.match(numRegx) || !value) {
                                    setMobileNumber(value)
                                }
                            }}
                            value={mobileNumber}
                            selectionColor={'#3276E2'}
                        />
                    </HStack>
                </HStack>
                <Stack alignItems='center' mt="42">
                    <PrimaryPillBtn title='Continue' onPress={handleSubmit} />
                </Stack>
                <Stack mt="22" justifyContent="center" alignItems="center" >
                    <Text color="#767676" fontSize="14" fontWeight="400">
                        By clicking continue you agree to MirroFly
                    </Text>
                    <HStack >
                        <Pressable mx='1' borderBottomWidth="1"
                            borderBottomColor="#3276E2" onPress={termsHandler} >
                            <Text color="#3276E2" mr="1" fontSize="14">
                                Terms and Conditions,
                            </Text>
                        </Pressable>
                        <Pressable
                            borderBottomWidth="1"
                            borderBottomColor="#3276E2"
                            onPress={PolicyHandler}>
                            <Text color="#3276E2"
                                fontSize="14"
                            >
                                Privacy Policy.
                            </Text>
                        </Pressable>
                    </HStack>
                </Stack>
                <Modal isOpen={isLoading === 'loading'} safeAreaTop={true} >
                    <Modal.Content width="60%" height="9%" >
                        <Center w="100%" h="full">
                            <HStack alignItems={'center'}>
                                <Spinner size="lg" color={'#3276E2'} />
                                <Text style={{ color: "black", paddingHorizontal: 15, fontWeight: "500" }}>Please Wait</Text>
                            </HStack>
                        </Center>
                    </Modal.Content>
                </Modal>
            </VStack>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen
