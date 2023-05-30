import React from 'react'
import { NativeBaseProvider, Text } from 'native-base'
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
import { CONNECTED, RECENTCHATSCREEN } from '../constant'
 import StatusScreen from "../screen/StatusScreen";
import EditStatusScreen from '../screen/EditStatusScreen'
import ProfilePage from '../components/ProfilePage'
import StatusPage from '../components/StatusPage'
import EditStatusPage from '../components/EditStatusPage'

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
        }
    }, [isConnect, navScreen])

    if (isAppLoading) {
        return <SplashScreen />;
    }

    return (
        <NativeBaseProvider>
            {{
                'REGISTERSCREEN': <RegisterScreen />,
                'PROFILESCREEN':<ProfileScreen/>,
                'RECENTCHATSCREEN': <RecentScreen />,
                'COUNTRYSCREEN': <CountryList />,
                'CHATSCREEN': <ChatScreen />,
                'CONTACTLIST': <ContactScreen />,
                'SETTINGSCREEN': <SettingScreen />,
                'STATUSSCREEN':<StatusPage/>,
               'EDITSTATUSSCREEN':<EditStatusPage/>
            }[screenNav]}
        </NativeBaseProvider>
    )
}

export default Navigation