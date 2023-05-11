import React from 'react'
import { BackHandler, Text, View } from 'react-native'
import { RECENTCHATSCREEN } from '../constant'
import { useDispatch } from 'react-redux'
import { navigate } from '../redux/navigationSlice'

function ContactList() {
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
            <Text>ContactList</Text>
        </View>
    )
}

export default ContactList