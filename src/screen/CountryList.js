import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { countriescodes } from '../common/countries'

const CountryList = () => {
    return (
        <View>
            <View style={styles.headerStyle}>
                <Image style={styles.imageView} resizeMode="cover" source={require('../assets/leftArrow.png')} />
                <Text style={{ fontSize: 22, fontWeight: "bold", color: "black", marginLeft: 30 }}>Select Country</Text>
                <TouchableOpacity style={{ marginLeft: 150 }} >
                    <Image style={styles.imageView} resizeMode="cover" source={require('../assets/Search.png')} />
                </TouchableOpacity>
            </View>
            <View>
                <FlatList
                    data={countriescodes}
                    keyExtractor={(item) => item?.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{ padding: 10, flexDirection: "row", justifyContent: "space-between" }}
                        // onPress={() => handleOptionSelect(item)}
                        >
                            <Text style={{ fontSize: 15, color: "black" }}>{item.name}</Text>
                            <Text style={{ fontSize: 15, color: "black" }}>{item.dial_code}</Text>
                        </TouchableOpacity>
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
    }
})