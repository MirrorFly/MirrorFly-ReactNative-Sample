import React from 'react';
import { Keyboard, StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Linking, TouchableWithoutFeedback, FlatList } from 'react-native';
import { PrimaryPillBtn } from '../common/Button';
import { SDK } from '../SDK';
import DropDown from '../components/DropDown';
import { Formik } from 'formik';
import { countriescodes } from '../common/countries';
import { Dropdown } from 'react-native-element-dropdown';

const RegisterScreen = () => {
    const [selectedCountry, setSelectedCountry] = React.useState();
    const [isOpen, setIsOpen] = React.useState(false);

    const [selectedItem, setSelectedItem] = React.useState();

    // const OnClickHandler =  () => {
    //     // let data = {  number: number }
    //     let data =  { screen: OTPSCREEN }
    //     // dispatch(navigate(data))
    //      console.log(data);
    //     Keyboard.dismiss();
    // }

    const termsHandler = () => {
        Linking.openURL("https://www.mirrorfly.com/terms-and-conditions.php");
    }

    const PolicyHandler = () => {
        Linking.openURL("https://www.mirrorfly.com/privacy-policy.php");
    }

    const handleToggelDropDown = (event) => {
        console.log(dropDownRef)
        if (dropDownRef.current) {
            setIsOpen(false);
        } else {
            setIsOpen(true)
        }
        console.log('====================================');
        console.log(event);
        console.log('====================================');
    }

    //console.log(OnClickHandler('1234567890')); // true
    // useEffect(async () => {

    //     let connect = await SDK.connect(register.username, register.password);

    //     if (connect?.statusCode == 200) {
    //         console.log("Connection Established");
    //     }
    // }, []);

    return (
        <TouchableWithoutFeedback onPressOut={handleToggelDropDown}>
            <Formik
                initialValues={{ mobileNumber: '' }}
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
                    console.log(values.mobileNumber);
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                    <View style={styles.headContainer}>

                        <View style={styles.topSectionContainer}>

                            <Image style={styles.imageView} resizeMode="cover" source={require('../assets/mobile.png')} />
                            <Text style={styles.numberstyle}>Register Your Number</Text>
                           
                        </View>

                        <View style={{marginTop:10}}>
                                <Text style={styles.chooseText} numberOfLines={2}>
                                    Please choose your country code and enter your mobile number to get the verification code.
                                </Text>
                            </View>
                        <View style={styles.flatListContainer} >
                            {/* <DropDown
                                isOpen={isOpen}
                                handleToggelDropDown={handleToggelDropDown}
                                countriescodes={countriescodes}
                                setSelectedCountry={setSelectedCountry}
                            /> */}
                            <Dropdown
                                data={countriescodes}
                                value={selectedItem}
                                placeholder="India"
                                style={styles.dropdown}
                                setSelectedCountry={setSelectedCountry}
                                placeholderStyle={styles.placeholderStyle}
                                search
                                selectedTextStyle={styles.selectedStyle}
                                maxHeight={300}
                                labelField="name"
                                valueField="dial_code"
                                searchPlaceholder="Search..."
                                onChange={item => {
                                    setSelectedItem(item.selectedItem);
                                }}
                                containerStyle={styles.dropdownContainer}
                                dropdownStyle={styles.dropdownMenu}
                                labelStyle={styles.dropdownLabel}
                                valueStyle={styles.dropdownValue}
                            />

                            <View style={styles.mainContainer}>
                                <View style={styles.countryCodeContainer}>
                                    <Text style={styles.countryCodeText}>
                                        {selectedCountry?.dial_code || "+91"}
                                    </Text>
                                    <View style={{borderLeftWidth: 1, height: 20, borderColor: '#D5D5D5',marginLeft:10,marginTop:2}} />
                                </View>
                                <TextInput
                                    style={{ marginTop: 2, fontSize: 14, fontWeight: "bold", color: "black", alignItems: "flex-start", justifyContent: "flex-start" }}
                                    onChangeText={handleChange('mobileNumber')}
                                    onBlur={handleBlur('mobileNumber')}
                                    value={values.mobileNumber}
                                    placeholder='Enter mobile number'
                                    maxLength={10}
                                    placisLoadingholderTextColor={"#959595"}
                                    keyboardType="numeric"
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
        </TouchableWithoutFeedback>
    )
}

export default RegisterScreen

const styles = StyleSheet.create({
    headContainer: {
        flex: 1,
        backgroundColor: "white"
    },
    numberstyle:
    {
        fontSize: 23,
        marginTop: 10,
        textAlign: "center",
        color: "black",
        fontWeight: "bold"
    },
    imageView: {
        marginBottom: 10,
        width:200,
        height:200

    },
    flatListContainer: {
        marginTop: 42,
        marginHorizontal: 4

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
        //marginTop: 72,
        color: "#767676",
        fontSize: 14
    },
    button: {
        alignItems: 'center',
        marginTop: 40,
        fontWeight:"bold"
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
    dropdown: {
        margin: 16,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },
    imageStyle: {
        width: 24,
        height: 24,
    },

    placeholderStyle: {
        fontSize: 15,
        color: "black",
        fontWeight: "bold"
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
        flexDirection:"row"
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
    dropdownContainer: {
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        backgroundColor: 'white',
    },
    dropdownMenu: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        backgroundColor: 'red',
    },
    dropdownLabel: {
        padding: 10,
        fontSize: 15,

    },
    dropdownValue: {
        padding: 10,
        fontSize: 15,

    },
    selectedStyle: {

        fontSize: 15,
        color: "black",
        fontWeight: "bold"
    }
})