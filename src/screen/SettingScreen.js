import React from 'react'
import { CONTACTLIST } from '../constant';
import { useDispatch } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { BackHandler, StyleSheet, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import * as RootNav from '../Navigation/rootNavigation'

function SettingScreen() {
    const dispatch = useDispatch()
    const handleBackBtn = () => {
        let x = { screen: CONTACTLIST }
        dispatch(navigate(x))
        RootNav.navigate(CONTACTLIST)
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
                title='Settings'
                onhandleBack={handleBackBtn}
            />
        </View>
    )
}

export default SettingScreen

const styles = StyleSheet.create({
    shadowProp: {
        borderRadius: 8,
        elevation: 22
    },
})