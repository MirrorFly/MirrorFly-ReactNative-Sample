import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useDispatch } from 'react-redux';
import { REGISTERSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';

const CountryItems = (props) => {
    const dispatch = useDispatch();

    const countrySelectHandler = () => {
        let x = { screen: REGISTERSCREEN,selectContryCode:props.renderItem }
        dispatch(navigate(x))
    }
    return (
        <View>
            <TouchableOpacity
                style={styles.countryListStyle}
                onPress={countrySelectHandler}
            >
                <Text style={{ fontSize: 15, color: "black", fontWeight: "bold" }}>{props.renderItem.name}</Text>
                <Text style={{ fontSize: 15, color: "black", fontWeight: "bold" }}>{props.renderItem.dial_code}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default CountryItems

const styles = StyleSheet.create({
    countryListStyle: {
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    }
})