import React from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import Navigation from './Navigation';
import { callBacks } from './SDKActions/callbacks';
import SDK from './SDK/SDK';
import { AppState, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { navigationRef } from './Navigation/rootNavigation';
import ApplicationTheme from './config/appTheme';
import SplashScreen from './screen/SplashScreen';
import StackNavigationPage from './Navigation/stackNavigation';
import { NativeBaseProvider } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserJid } from './redux/authSlice';
import { profileDetail } from './redux/profileSlice';
import { navigate } from './redux/navigationSlice';
import { REGISTERSCREEN } from './constant';
import { addchatSeenPendingMsg } from './redux/chatSeenPendingMsg';

export const ChatApp = () => {
    React.useEffect(() => {
        (async () => {
            await SDK.initializeSDK({
                apiBaseUrl: `https://api-uikit-qa.contus.us/api/v1`,
                licenseKey: `ckIjaccWBoMNvxdbql8LJ2dmKqT5bp`,
                callbackListeners: callBacks,
            });
        })();
    }, [])

    return (
        <Provider store={store}>
            <NativeBaseProvider>
                <RootNavigation />
            </NativeBaseProvider>
        </Provider>
    );
}

const RootNavigation = () => {
    const scheme = useColorScheme();
    const [initialRouteValue, setInitialRouteValue] = React.useState('Register');
    const [authStatus, setAuthStatus] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false);

    const dispatch = useDispatch()
    const vCardProfile = useSelector((state) => state.profile.profileDetails);
    React.useEffect(() => {
        setIsLoading(true);
        setTimeout(async () => {
            if (Object.keys(vCardProfile).length === 0) {
                const vCardProfile = await AsyncStorage.getItem('vCardProfile');
                if (vCardProfile)
                    dispatch(profileDetail(JSON.parse(vCardProfile)))
            }
            const currentUserJID = await AsyncStorage.getItem('currentUserJID')
            const screenObj = await AsyncStorage.getItem('screenObj')
            const parsedScreenOj = JSON.parse(screenObj)
            const storedVal = await AsyncStorage.getItem('pendingSeenStatus')
            const parsedStoreVal = JSON.parse(storedVal)
            if (parsedStoreVal?.data.length)
                parsedStoreVal.data.forEach(element => {
                    dispatch(addchatSeenPendingMsg(element))
                });
            if (JSON.parse(screenObj)) {
                dispatch(getCurrentUserJid(JSON.parse(currentUserJID)))
                dispatch(navigate(parsedScreenOj))
                setInitialRouteValue(parsedScreenOj.screen)
            } else setInitialRouteValue(REGISTERSCREEN)
            setIsLoading(false)
        }, 1000)
    }, [])

    return (
        <NavigationContainer
            ref={navigationRef}
            theme={scheme === 'dark' ? ApplicationTheme.lightTheme : ApplicationTheme.lightTheme}
        >
            {isLoading ?
                <SplashScreen />
                : <StackNavigationPage InitialValue={initialRouteValue} />
            }
        </NavigationContainer>
    )
}