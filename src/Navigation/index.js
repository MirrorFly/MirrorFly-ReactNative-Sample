import React from 'react'
import { NativeBaseProvider } from 'native-base'
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
import { CONNECTED } from '../constant'

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)
    const isConnect = useSelector(state => state.auth.isConnected);
    const [isAppLoading, setIsAppLoading] = React.useState(false)
    const dispatch = useDispatch();
    React.useEffect(() => {
        setIsAppLoading(true);
        (async () => {
            await authScreen().then(async (res) => {
                dispatch(getRecentChat())
                setIsAppLoading(false)
                let nav = { screen: res }
                dispatch(navigate(nav))
            })
        })();
    }, [])
    
    if (isAppLoading) {
        return <SplashScreen />;
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