import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, StyleSheet } from 'react-native';

const data = [
    { id: 1, label: 'India' },
    { id: 2, label: 'Us' },
    { id: 3, label: 'Uae' },
    { id: 4, label: 'canada' },
    { id: 5, label: 'france' },
    { id: 6, label: 'sinagapore' },

];

const DropDown = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(null);
    const DropDownRef = React.useRef();
    const [searchValue, setSearchValue] = React.useState('');
    const [filteredData, setFilteredData] = React.useState(props.countriescodes);
    // const handleSelect = (item) => {
    //            setShowDropdown(false);
    //             setSearchValue('');
    //             setSelectedValue(item)
    //              console.log(item);
    //         };

    React.useEffect((event) => {


    }, [DropDownRef])

    console.log('====================================');
    console.log(DropDownRef);
    console.log('====================================');
    const handleOptionSelect = (option, event) => {

        setSelectedValue(option);
        setIsOpen(false);
        props?.setSelectedCountry(option);
    };

    const handleSearch = (text) => {
        setSearchValue(text);
        const filtered = props.countriescodes.filter((item) =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered);

    };

    return (
        <View ref={DropDownRef} style={styles.dropDownContainer} >
            <TouchableOpacity
                onPress={props.handleToggelDropDown}
                style={styles.onActionView}
            >
                <Text style={styles.countryText}>{selectedValue ? selectedValue.name : "India"}</Text>
                <Image resizeMode="cover" source={require('../assets/DownArrow.png')} />
            </TouchableOpacity>
            {props.isOpen && (
                <View ref={props.dropDownRef} style={styles.flatlistContainer}>
                    <TextInput

                        style={{ fontSize: 14, fontWeight: "bold", color: "black" }}
                        placeholder={"Select an option"}
                        value={searchValue}
                        onChangeText={handleSearch}
                    />
                    <FlatList


                        data={filteredData}
                        keyExtractor={(item) => item?.id?.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ padding: 10 }}
                                onPress={() => handleOptionSelect(item)}
                            >
                                <Text style={{ fontSize: 15, color: "black" }}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default DropDown;
const styles = StyleSheet.create({
    dropDownContainer: {
        backgroundColor: "#fff",
        zIndex: 5,
    },
    onActionView: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: 'gray',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        marginHorizontal: 25,
        marginTop: 30
    },
    flatlistContainer: {
        height: 160,
        borderWidth: 1,
        borderColor: 'gray',
        marginHorizontal: 22,
        marginTop: 30,
        top: 50,
        left: 0,
        right: 0,
        position: "absolute",
        backgroundColor: "#fff"
    },
    countryText:
    {
        fontSize: 15,
        fontWeight: "bold",
        color: "black"

    }
})