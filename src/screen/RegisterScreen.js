import React from 'react';
import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Linking, ToastAndroid, ScrollView, KeyboardAvoidingView } from 'react-native';
import { PrimaryPillBtn } from '../common/Button';
import { useDispatch } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { CONNECTED, COUNTRYSCREEN, PROFILESCREEN } from '../constant';
import { useSelector } from 'react-redux';
import { registerData } from '../redux/authSlice';
import { getRecentChat } from '../redux/chatSlice';

const RegisterScreen = () => {
    const dispatch = useDispatch();
    const selectcountry = useSelector(state => state.navigation.selectContryCode);
    const isConnect = useSelector(state => state.auth.isConnected);
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

    React.useEffect(() => {
        if (isConnect == CONNECTED) {
            dispatch(getRecentChat())
            let nav = { screen: PROFILESCREEN }
            dispatch(navigate(nav))
        }
    }, [isConnect])

    const handleSubmit = () => {
        if (!mobileNumber) {
            return ToastAndroid.show('Please Enter Mobile Number', ToastAndroid.SHORT);
        }
 
         if(mobileNumber.length <= '5')
         {
            return ToastAndroid.show('Your mobile number is too short', ToastAndroid.SHORT);
         }

        if (!/^[0-9]{10}$/i.test(mobileNumber)) {
            return ToastAndroid.show('Please enter a valid mobile number', ToastAndroid.SHORT);
        } else {
            dispatch(registerData(selectcountry?.dial_code + mobileNumber))
        }
    }
    return (
        <View style={styles.headContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.topSectionContainer}>
                <Image style={styles.imageView} resizeMode="contain" source={require('../assets/mobile.png')} />
                <Text style={styles.numberstyle}>Register Your Number</Text>
            </View>
            <View style={{ marginTop: 10 }}>
                <Text style={styles.chooseText} numberOfLines={2}>
                    Please choose your country code and enter your mobile number to get the verification code.
                </Text>
            </View> 
                <View style={styles.flatListContainer} >
                    <TouchableOpacity
                        onPress={selectCountryHandler}
                        style={styles.dropstyle}
                    >
                        <Text style={styles.countryText}>{selectcountry?.name}</Text>
                        <Image resizeMode="contain" style={{ height: 12, width: 12 }} source={require('../assets/DownArrow.png')} />
                    </TouchableOpacity>
                    <View style={styles.mainContainer}>
                        <View style={styles.countryCodeContainer}>
                            <Text style={styles.countryCodeText}>
                                +{selectcountry?.dial_code}
                            </Text>
                            <View style={{ borderLeftWidth: 1, height: 20, borderColor: '#D3D3D3', marginLeft: 10, marginTop: 2 }} />
                        </View>
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={(value) => {
                                let num = value.replace(".", '');
                                if (isNaN(num)) {
                                    ToastAndroid.show('Please Enter Number', ToastAndroid.SHORT);
                                } else {
                                    setMobileNumber(value)
                                }
                            }}
                            value={mobileNumber}
                            placeholder='Enter mobile number'
                            maxLength={15}
                            placisLoadingholderTextColor={"#959595"}
                            keyboardType="numeric"
                            numberOfLines={1}
                        />
                    </View>
                    <View style={styles.button}>
                        <PrimaryPillBtn title='Continue' isLoading={isLoading} onPress={() => { handleSubmit() }} />
                    </View>
                    <View style={styles.linkContainer}>
                        <Text style={styles.titleText}>
                            By clicking continue you agree to MirroFly
                        </Text>
                        <View style={styles.termserviceContainer}>
                            <TouchableOpacity onPress={termsHandler} >
                                <Text style={styles.termsText}>
                                    Terms and Conditions,
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={PolicyHandler}>
                                <Text style={styles.policyText}>
                                    Privacy Policy.
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default RegisterScreen

const styles = StyleSheet.create({
    headContainer: {
        flex: 1,
        backgroundColor: "white"
    },
    numberstyle: {
        fontSize: 23,
        marginTop: 10,
        textAlign: "center",
        color: "black",
        fontWeight: "bold"
    },
    imageView: {
        marginBottom: 10,
        width:200,
        height: 200

    },
    flatListContainer: {
        marginTop: 48,
        marginHorizontal: 4
    },
    dropstyle: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#D3d3d3",
        marginHorizontal: 12,
        paddingVertical: 12
    },
    countryText: {
        fontSize: 15,
        color: "#181818",
        fontWeight: "bold"
    },
    numberText: {
        flex: 0.24,
        color: "black",
        fontSize: 15,
        fontWeight: "bold",
        marginTop: 12
    },
    topSectionContainer: {
        marginTop: 42,
        justifyContent: "center",
        alignItems: "center"
    },
    chooseText: {
        textAlign: "center",
        marginHorizontal: 30,
        color: "#767676",
        fontSize: 14
    },
    button: {
        alignItems: 'center',
        marginTop: 42,
        fontWeight: "bold"
    },
    actionStyle: {
        color: "white",
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold"
    },
    mainContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 22,
        marginTop: 10,
    },
    imageStyle: {
        width: 24,
        height: 24,
    },
    selectedTextStyle: {
        fontSize: 16,
        marginLeft: 8,
        color: "black",
        fontWeight: "bold"
    },
    linkContainer: {
        marginTop: 22,
        justifyContent: "center",
        alignItems: "center"
    },
    titleText: {
        color: "#767676",
        fontSize: 11,
    },
    termserviceContainer: {
        flexDirection: "row",
        marginLeft: 10
    },
    termsText: {
        color: "#3276E2",
        marginRight: 8,
        fontSize: 11,
        borderBottomWidth: 1,
        borderBottomColor: "#3276E2"
    },
    policyText: {
        color: "#3276E2",
        fontSize: 11,
        borderBottomWidth: 1,
        borderBottomColor: "#3276E2"
    },
    countryCodeContainer: {
        marginRight: 6,
        flexDirection: "row"
    },
    countryCodeText: {
        fontSize: 16,
        color: "black",
        fontWeight: "bold"
    },
    countryCodeDropdownText: {
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        color: "black",
        fontWeight: "bold"
    },
    inputStyle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "black",
       flex: 1
    }
})