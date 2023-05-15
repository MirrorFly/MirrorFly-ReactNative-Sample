import React from 'react'
import { NativeBaseProvider } from 'native-base'
import { useSelector } from 'react-redux'
import CountryList from '../screen/CountryList'
import ProfileScreen from '../screen/ProfileScreen'
import RecentScreen from '../screen/RecentScreen'
import RegisterScreen from '../screen/RegisterScreen'
import ChatScreen from '../screen/ChatScreen'
import ContactScreen from '../screen/ContactScreen';
import SettingScreen from '../screen/SettingScreen'
import SplashScreen from '../screen/SplashScreen'

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)
    const [appLoading, setAppLoading] = React.useState(false)

    React.useEffect(() => {
        setAppLoading(true)
        setTimeout(() => {
            setAppLoading(false)
        }, 1000)
    }, [])

    if (appLoading) {
        return <SplashScreen />
    }

    return (
        <NativeBaseProvider>
            {{
                'REGISTERSCREEN': <RegisterScreen />,
                'RECENTCHATSCREEN': <RecentScreen />,
                'COUNTRYSCREEN': <CountryList />,
                'PROFILESCREEN': <ProfileScreen />,
                'CHATSCREEN': <ChatScreen />,
                'CONTACTLIST': <ContactScreen />,
                'SETTINGSCREEN': <SettingScreen />
            }[screenNav]}
        </NativeBaseProvider>
    )
}

export default Navigation