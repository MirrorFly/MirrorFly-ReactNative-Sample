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
import { authScreen } from '../services/auth'
import { navigate } from '../redux/navigationSlice'
import SplashScreen from '../screen/SplashScreen'
import { getRecentChat } from '../redux/chatSlice'
import { CONNECTED, RECENTCHATSCREEN, REGISTERSCREEN } from '../constant'
import { profileData } from '../redux/profileSlice'

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)
    const isConnect = useSelector(state => state.auth.isConnected);
    const [isAppLoading, setIsAppLoading] = React.useState(false)
    const [navScreen, setNavScreen] = React.useState()
    const dispatch = useDispatch();
    React.useEffect(() => {
        setIsAppLoading(true);
        (async () => {
            await authScreen().then(async (res) => {
                setNavScreen(res)
                setIsAppLoading(false)
            })
        })();
    }, [])

    React.useEffect(() => {
        if (isConnect == CONNECTED) {
            dispatch(getRecentChat())
            let nav = { screen: RECENTCHATSCREEN }
            dispatch(navigate(nav))
            dispatch(profileData())
        } else {
            dispatch(getRecentChat())
            let nav = { screen: REGISTERSCREEN }
            dispatch(navigate(nav))
        }
    }, [isConnect, navScreen])

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
            }[screenNav]}
            <Box safeAreaBottom />
        </NativeBaseProvider>
    )
}
export default Navigation