import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, BackHandler } from 'react-native'
import React from 'react'
import { countriescodes } from '../common/countries'
import CountryItems from '../model/CountryItems';
import { navigate } from '../redux/navigationSlice';
import { REGISTERSCREEN } from '../constant';
import { useDispatch } from 'react-redux';
const CountryList = () => {

    const dispatch = useDispatch();
    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    React.useEffect(() => {
        return () => backHandler.remove()
    }, [])

    const handleBackBtn = () => {
        let x = { screen: REGISTERSCREEN }
        dispatch(navigate(x))
        return true;
    }


    return (
        <View>
            <View style={styles.headerStyle}>
                <TouchableOpacity onPress={handleBackBtn} >
                    <Image style={styles.imageView} resizeMode="cover" source={require('../assets/leftArrow.png')} />
                </TouchableOpacity>

                <Text style={{ fontSize: 22, fontWeight: "bold", color: "black", marginLeft: 30 }}>Select Country</Text>
                <TouchableOpacity style={{ marginLeft: 150 }}  >
                    <Image style={styles.imageView} resizeMode="cover" source={require('../assets/Search.png')} />
                </TouchableOpacity>
            </View>
            <View>
                <FlatList
                    data={countriescodes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CountryItems renderItem={item} />
                    )}
                />
            </View>

        </View>
    )
}

export default CountryList

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: "#F2F2F2",
        height: 60,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 4,
        paddingHorizontal: 16
    },
    imageView: {
        width: 20,
        Left: 10,
        height: 20
    },
    countryListStyle: {
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    }
})