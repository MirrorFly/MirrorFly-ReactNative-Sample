import React from 'react'
import { BackHandler, Text, View } from 'react-native'
import { RECENTCHATSCREEN } from '../constant'
import { navigate } from '../redux/navigationSlice'
import { useDispatch } from 'react-redux'

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
        <View>
            <Text>ContactListScreen</Text>
        </View>
    )
}

export default ContactListScreen