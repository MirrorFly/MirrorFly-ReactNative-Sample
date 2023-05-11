import React from 'react';
import { Keyboard, StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Linking, } from 'react-native';
import { PrimaryPillBtn } from '../common/Button';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { CONNECTED, COUNTRYSCREEN, PROFILESCREEN } from '../constant';
import { useSelector } from 'react-redux';
import { registerData } from '../redux/authSlice';
import { getRecentChat } from '../redux/chatSlice';

const RegisterScreen = () => {
    const selectcountry = useSelector(state => state.navigation.selectContryCode);

    const isConnect = useSelector(state => state.auth.isConnected);

    const dispatch = useDispatch();

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
            let nav = { screen: PROFILESCREEN }
            dispatch(navigate(nav))
        }
    }, [isConnect])

    return (
        <Formik
            initialValues={{ mobileNumber: '+917094229374' }}
            validate={values => {
                const errors = {};
                if (!values.mobileNumber) {
                    errors.mobileNumber = 'Required';
                }
                //  else if (!/^[0-9]{10}$/i.test(values.mobileNumber)) {
                // //     errors.mobileNumber = 'Invalid mobile number';
                // // }
                return errors;
            }}
            onSubmit={values => {
                dispatch(registerData('917094229374'))
            }}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                <View style={styles.headContainer}>
                    <View style={styles.topSectionContainer}>
                        <Image style={styles.imageView} resizeMode="cover" source={require('../assets/mobile.png')} />
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
                            <Image resizeMode="cover" source={require('../assets/DownArrow.png')} />
                        </TouchableOpacity>
                        <View style={styles.mainContainer}>
                            <View style={styles.countryCodeContainer}>
                                <Text style={styles.countryCodeText}>
                                    {selectcountry?.dial_code}
                                </Text>
                                <View style={{ borderLeftWidth: 1, height: 20, borderColor: '#D5D5D5', marginLeft: 10, marginTop: 2 }} />
                            </View>
                            <TextInput
                                style={styles.inputStyle}
                                onChangeText={handleChange('mobileNumber')}
                                onBlur={handleBlur('mobileNumber')}
                                value={values.mobileNumber}
                                placeholder='Enter mobile number'
                                maxLength={10}
                                placisLoadingholderTextColor={"#959595"}
                                keyboardType="numeric"
                                numberOfLines={1}
                            />
                        </View>
                        {errors.mobileNumber && <Text style={{ color: 'red', marginHorizontal: 78 }}>{errors.mobileNumber}</Text>}
                        <View style={styles.button}>
                            <PrimaryPillBtn title='Continue' onPress={handleSubmit} />
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
                </View>
            )}
        </Formik>

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
        width: 200,
        height: 200
    },
    flatListContainer: {
        marginTop: 42,
        marginHorizontal: 4

    },
    dropstyle: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#959595",
        marginHorizontal: 6,
        paddingVertical: 12
    },
    countryText:
    {
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
        marginHorizontal: 35,
        color: "#767676",
        fontSize: 14
    },
    button: {
        alignItems: 'center',
        marginTop: 40,
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
        justifyContent: "flex-start",
        alignItems: "center",
        marginHorizontal: 22,
        marginTop: 10,
        position: "relative"
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
        marginTop: 24,
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
        color: "blue",
        marginRight: 8,
        fontSize: 11,
        borderBottomWidth: 1,
        borderBottomColor: "#3276E2"
    },
    policyText: {
        color: "blue",
        fontSize: 11,
        borderBottomWidth: 1,
        borderBottomColor: "#3276E2"
    },
    countryCodeContainer: {
        marginRight: 20,
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
        marginTop: 2,
        fontSize: 14,
        fontWeight: "bold",
        color: "black",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 18,
        paddingVertical: 10
    }
})