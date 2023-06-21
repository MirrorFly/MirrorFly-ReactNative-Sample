import React from 'react'
import { Box, NativeBaseProvider } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import CountryList from '../screen/CountryList'
import ProfileScreen from '../screen/ProfileScreen'
import RecentScreen from '../screen/RecentScreen'
import RegisterScreen from '../screen/RegisterScreen'
import ChatScreen from '../screen/ChatScreen'
import ContactScreen from '../screen/ContactScreen';
import SettingScreen from '../screen/SettingScreen'
import { navigate } from '../redux/navigationSlice'
import SplashScreen from '../screen/SplashScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)
    const [isAppLoading, setIsAppLoading] = React.useState(false)
    const dispatch = useDispatch();

    React.useEffect(() => {
        setIsAppLoading(true);
        setTimeout(async () => {
            const screenObj = await AsyncStorage.getItem('screenObj')
            console.log('screen', JSON.parse(screenObj))
            if (JSON.parse(screenObj)) {
                dispatch(navigate(JSON.parse(screenObj)))
            }
            setIsAppLoading(false)
        }, 1000)
    }, [])

    if (isAppLoading) {
        return <SplashScreen />;
    }

    return (
        <NativeBaseProvider>
            <Box safeAreaTop bg="#f2f2f2" />
            {{
                'REGISTERSCREEN': <RegisterScreen />,
                'PROFILESCREEN': <ProfileScreen />,
                'RECENTCHATSCREEN': <RecentScreen />,
                'COUNTRYSCREEN': <CountryList />,
                'CHATSCREEN': <ChatScreen />,
                'CONTACTLIST': <ContactScreen />,
                'SETTINGSCREEN': <SettingScreen />,
                // 'null': <RegisterScreen />
            }[screenNav]}
            <Box safeAreaBottom />
        </NativeBaseProvider>
    )
}
export default Navigation