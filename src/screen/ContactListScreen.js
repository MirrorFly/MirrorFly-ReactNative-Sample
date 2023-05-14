import React from 'react'
import { BackHandler, StyleSheet, Text, View } from 'react-native'
import { RECENTCHATSCREEN } from '../constant'
import { navigate } from '../redux/navigationSlice'
import { useDispatch } from 'react-redux'
import ScreenHeader from '../components/ScreenHeader'

function ContactListScreen() {
    const dispatch = useDispatch()

    const handleBackBtn = () => {
        let x = { screen: RECENTCHATSCREEN }
        dispatch(navigate(x))
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    React.useEffect(() => {
        return () => backHandler.remove()
    }, [])

    return (
        <View style={styles.shadowProp}>
            <ScreenHeader
                title='Contacts'
                onhandleBack={handleBackBtn}
            // onhandleSearch={handleSearch}
            // menuItems={menuItems}
            // logo={logo}
            />
        </View>
    )
}

export default ContactListScreen

const styles = StyleSheet.create({
    shadowProp: {
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 1
    }
})