import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { Box, NativeBaseProvider } from 'native-base';
import React, { createRef } from 'react';
import {
  Keyboard,
  LogBox,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { navigationRef } from './Navigation/rootNavigation';
import StackNavigationPage from './Navigation/stackNavigation';
import SDK from './SDK/SDK';
import { callBacks } from './SDKActions/callbacks';
import ApplicationTheme from './config/appTheme';
import { REGISTERSCREEN } from './constant';
import { getCurrentUserJid } from './redux/Actions/AuthAction';
import { navigate } from './redux/Actions/NavigationAction';
import { profileDetail } from './redux/Actions/ProfileAction';
import { addchatSeenPendingMsg } from './redux/Actions/chatSeenPendingMsgAction';
import store from './redux/store';
import SplashScreen from './screen/SplashScreen';
import messaging from '@react-native-firebase/messaging';
LogBox.ignoreAllLogs();

export const isKeyboardVisibleRef = createRef();
isKeyboardVisibleRef.current = false;

const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
  isKeyboardVisibleRef.current = true;
});

const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
  isKeyboardVisibleRef.current = false;
});

export const ChatApp = props => {
  React.useEffect(() => {
    (async () => {
      await SDK.initializeSDK({
        apiBaseUrl: props.apiUrl,
        licenseKey: props.licenseKey,
        callbackListeners: callBacks,
        isSandbox: props.isSandbox,
      });
      await messaging().requestPermission();
    })();
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <RootNavigation />
      </NativeBaseProvider>
    </Provider>
  );
};

const RootNavigation = () => {
  const scheme = useColorScheme();
  const [initialRouteValue, setInitialRouteValue] = React.useState('Register');
  const [isLoading, setIsLoading] = React.useState(false);

  const dispatch = useDispatch();
  const safeAreaBgColor = useSelector(state => state.safeArea.color);
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(async () => {
      if (Object.keys(vCardProfile).length === 0) {
        const vCardProfileLocal = await AsyncStorage.getItem('vCardProfile');
        if (vCardProfileLocal) {
          dispatch(profileDetail(JSON.parse(vCardProfileLocal)));
        }
      }
      const currentUserJID = await AsyncStorage.getItem('currentUserJID');
      const screenObj = await AsyncStorage.getItem('screenObj');
      const parsedScreenOj = JSON.parse(screenObj);
      const storedVal = await AsyncStorage.getItem('pendingSeenStatus');
      const parsedStoreVal = JSON.parse(storedVal);
      if (parsedStoreVal?.data.length) {
        parsedStoreVal?.data.forEach(element => {
          dispatch(addchatSeenPendingMsg(element));
        });
      }
      if (JSON.parse(screenObj)) {
        dispatch(getCurrentUserJid(JSON.parse(currentUserJID)));
        dispatch(navigate(parsedScreenOj));
        setInitialRouteValue(parsedScreenOj.screen);
      } else {
        setInitialRouteValue(REGISTERSCREEN);
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      {/** <Box safeAreaBottom backgroundColor={safeAreaBgColor} />
      <NavigationContainer
        ref={navigationRef}
        theme={
          scheme === 'dark'
            ? ApplicationTheme.darkTheme
            : ApplicationTheme.lightTheme
        }>
        {isLoading ? (
          <SplashScreen />
        ) : (
          <StackNavigationPage InitialValue={initialRouteValue} />
        )}
      </NavigationContainer>
      <Box safeAreaBottom backgroundColor={safeAreaBgColor} /> */}
      <Box safeAreaTop backgroundColor={safeAreaBgColor} />
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor={safeAreaBgColor} />
        <NavigationContainer
          ref={navigationRef}
          theme={
            scheme === 'dark'
              ? ApplicationTheme.darkTheme
              : ApplicationTheme.lightTheme
          }>
          {isLoading ? (
            <SplashScreen />
          ) : (
            <StackNavigationPage InitialValue={initialRouteValue} />
          )}
        </NavigationContainer>
      </SafeAreaView>
      <Box safeAreaBottom backgroundColor={safeAreaBgColor} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
