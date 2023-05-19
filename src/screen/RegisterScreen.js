import React from 'react';
import { TouchableOpacity, Linking} from 'react-native';
import { PrimaryPillBtn } from '../common/Button';
import { useDispatch } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { COUNTRYSCREEN, numRegx, PROFILESCREEN } from '../constant';
import { useSelector } from 'react-redux';
import { registerData } from '../redux/authSlice';
import { getRecentChat } from '../redux/chatSlice';
import { DownArrowIcon, RegiterPageIcon } from '../common/Icons';
import { Icon,  Modal, Text, Center, Box,useToast, Spinner, HStack, Stack, Input } from 'native-base';

const RegisterScreen = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const selectcountry = useSelector(state => state.navigation.selectContryCode);
    const isLoading = useSelector(state => state.auth.status);
    const [mobileNumber, setMobileNumber] = React.useState('')

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
        if (!mobileNumber) {
            return toast.show({
                duration: 2500,
                render: () => {
                    return <Box bg="black" px="2" py="1" rounded="sm" >
                        <Text style={{ color: "#fff", padding: 5 }}>Please Enter Mobile Number</Text>
                    </Box>;
                }
            })
        }
        if (mobileNumber.length <= '5') {
            return toast.show({
                duration: 2500,
                render: () => {
                    return <Box bg="black" px="2" py="1" rounded="sm" >
                        <Text style={{ color: "#fff", padding: 5 }}>Your mobile number is too short</Text>
                    </Box>;
                }
            })
        }
        if (!/^[0-9]{10}$/i.test(mobileNumber)) {
            return toast.show({
                duration: 2500,
                render: () => {
                    return <Box bg="black" px="2" py="1" rounded="sm" >
                        <Text style={{ color: "#fff", padding: 5 }}>Please enter a valid mobile number</Text>
                    </Box>;
                }
            })
        } else {
            dispatch(registerData(selectcountry?.dial_code + mobileNumber)).then((res) => {
                dispatch(getRecentChat())
                let nav = { screen: PROFILESCREEN }
                dispatch(navigate(nav))
            })
        }
    }
    return (
        <>
            <Center h="full">
                <Icon as={RegiterPageIcon} name="emoji-happy" height="100px" width="280px" />
                <Text mt="15" fontWeight="600" fontSize="23"
                    color="black"
                >Register Your Number</Text>
                <Center mt="2"   >
                    <Text color="#767676"
                        fontSize="14"
                        fontWeight="400" textAlign="center" >
                        Please choose your country code and enter your mobile {'\n'} number to get the verification code.
                    </Text>
                </Center>
                <TouchableOpacity onPress={selectCountryHandler}>
                    <HStack borderBottomWidth="1" py="2"
                        borderBottomColor="#f2f2f2" mt="50" space={80} justifyContent="flex-start" alignItems="center" >
                        <Text fontSize="15"
                            color="#181818" fontWeight="600" >{selectcountry?.name}</Text>
                        <Icon as={DownArrowIcon} name="emoji-happy" />
                    </HStack>
                </TouchableOpacity>
                <HStack flexDirection="row" alignItems="center" ml="6" mt="5"  >
                    <HStack mt="2" flexDirection="row" alignItems="center" mr="5"  >
                        <Text fontSize="16" color="black" fontWeight="600" mr="1">
                            +{selectcountry?.dial_code}
                        </Text>
                        <Stack height="8" ml="1" mt="2" borderLeftWidth="1" borderColor='#f2f2f2' />
                        <Input variant="unstyled"
                            fontSize="15"
                            fontWeight="500"
                            color="black"
                            flex="1"
                            placeholder="Enter mobile number"
                            onChangeText={(value) => {
                                if (value.match(numRegx) || !value) {
                                    setMobileNumber(value)
                                }
                            }}
                            value={mobileNumber}
                            selectionColor={'#3276E2'}
                            maxLength={15}
                            placeholderTextColor={"#959595"}
                            keyboardType="numeric"
                            numberOfLines={1}
                        />
                    </HStack>
                </HStack>
                <Stack alignItems='center' mt="42" fontWeight="bold">
                    <PrimaryPillBtn title='Continue' onPress={() => { handleSubmit() }} />
                </Stack>
                <Stack mt="22" justifyContent="center" alignItems="center" >
                    <Text color="#767676" fontSize="14" fontWeight="400">
                        By clicking continue you agree to MirroFly
                    </Text>
                    <HStack flexDirection="row" marginLeft="2" >
                        <TouchableOpacity onPress={termsHandler} >
                            <Text color="#3276E2" mr="1" fontSize="14" borderBottomWidth="1"
                                borderBottomColor="#3276E2">
                                Terms and Conditions,
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={PolicyHandler}>
                            <Text color="#3276E2"
                                fontSize="14"
                                borderBottomWidth="1"
                                borderBottomColor="#3276E2" >
                                Privacy Policy.
                            </Text>
                        </TouchableOpacity>
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
            </Center>
        </>
    )
}

export default RegisterScreen
