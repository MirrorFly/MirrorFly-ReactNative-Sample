import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, BackHandler, TextInput } from 'react-native'
import React from 'react'
import { countriescodes } from '../common/countries'
import CountryItems from '../model/CountryItems';
import { navigate } from '../redux/navigationSlice';
import { REGISTERSCREEN } from '../constant';
import { useDispatch } from 'react-redux';
import { BackBtn } from '../common/Button';
import { CloseIcon, ManigifyingGlass, SearchIcon } from '../common/Icons';
import ScreenHeader from '../components/ScreenHeader';
const CountryList = () => {

    const [clicked, setClicked] = React.useState(false);
    const textInputRef = React.useRef(null);
    const [filteredData, setFilteredData] = React.useState(countriescodes);
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
    const SearchHandler = () => {
        setClicked(!clicked)
        setFilteredData(countriescodes)
    }

    const handleSearch = (text) => {
        const filtered = countriescodes.filter((item) =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered);
    };

    return (
        <>
            
            <View>
                <ScreenHeader
                    title='Select Country'
                    onhandleBack={handleBackBtn}
                    onhandleSearch={handleSearch}
                />
                {/* <View style={styles.iconContainer}>
                    <BackBtn onPress={handleBackBtn} />
                    {clicked ?
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={handleSearch}
                            value={filteredData}
                            selectionColor={'#3276E2'}
                            placeholder='Search countries...'
                            placisLoadingholderTextColor={"#959595"}
                            keyboardType="default"
                        />
                        : <Text style={styles.title}>Select Country</Text>}
                </View> */}

                {/* <View style={styles.iconContainer}>
                    {clicked ?
                        <TouchableOpacity  >
                         <CloseIcon onPress={() => { SearchHandler(''); textInputRef.current?.focus(); }} width={20} height={20} />        
                        </TouchableOpacity>
                        : <TouchableOpacity  >
                         <ManigifyingGlass onPress={() => { SearchHandler(''); textInputRef.current?.focus(); }}  width={20} height={20} />
                       </TouchableOpacity>}
                </View> */}
            </View>
            <View>
                {!filteredData.length ?

                    <View style={{ alignItems: "center", justifyContent: "center", marginTop: 100 }}>
                        <Text style={{ fontSize: 20 }}>
                            No countries found
                        </Text>
                    </View>

                    : <FlatList
                        data={filteredData}
                        removeClippedSubviews={true}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item,index }) => (
                            <CountryItems key={index} renderItem={item} />
                        )}
                    />

                }

            </View>
        </>
    )
}

export default CountryList

const styles = StyleSheet.create({

    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        paddingHorizontal: 10,
        backgroundColor: '#F2F2F2',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: "#181818",
        fontSize: 22,
        fontWeight: "bold",
        paddingLeft: 24
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 6
    },
    icon: {
        width: 20,
        height: 20,
        marginHorizontal: 5,
    },
    headerStyle: {
        backgroundColor: "#F2F2F2",
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    imageView: {
        width: 25,
        height: 20
    },
    countryListStyle: {
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    inputStyle: {
        marginHorizontal: 10,
        width: 150,
        fontSize: 20,
        flex: 0.9
    },
    SearchImage: {
        width: 18,
        height: 18,

    },
    CloseImage: {
        width: 16,
        height: 16,

    }
})