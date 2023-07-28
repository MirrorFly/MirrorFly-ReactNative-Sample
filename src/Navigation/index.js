import React from 'react';
import { Box, NativeBaseProvider } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import CountryList from '../screen/CountryList';
import ProfileScreen from '../screen/ProfileScreen';
import RecentScreen from '../screen/RecentScreen';
import RegisterScreen from '../screen/RegisterScreen';
import ChatScreen from '../screen/ChatScreen';
import ContactScreen from '../screen/ContactScreen';
import SettingScreen from '../screen/SettingScreen';
import { navigate } from '../redux/Actions/NavigationAction';
import SplashScreen from '../screen/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileDetail } from '../redux/Actions/ProfileAction';
import { getCurrentUserJid } from '../redux/Actions/AuthAction';

function Navigation() {
  const screenNav = useSelector(state => state.navigation.screen);
  const [isAppLoading, setIsAppLoading] = React.useState(false);
  const dispatch = useDispatch();
  const vCardProfile = useSelector(state => state.profile.profileDetails);

  React.useEffect(() => {
    setIsAppLoading(true);
    setTimeout(async () => {
      if (Object.keys(vCardProfile).length === 0) {
        const vCardProfile = await AsyncStorage.getItem('vCardProfile');
        if (vCardProfile) dispatch(profileDetail(JSON.parse(vCardProfile)));
      }
      const currentUserJID = await AsyncStorage.getItem('currentUserJID');
      const screenObj = await AsyncStorage.getItem('screenObj');
      if (JSON.parse(screenObj)) {
        dispatch(getCurrentUserJid(JSON.parse(currentUserJID)));
        dispatch(navigate(JSON.parse(screenObj)));
      }
      setIsAppLoading(false);
    }, 2000);
  }, []);

  if (isAppLoading) {
    return <SplashScreen />;
  }

  return (
    <NativeBaseProvider>
      <Box safeAreaTop bg="#f2f2f2" />
      {
        {
          REGISTERSCREEN: <RegisterScreen />,
          PROFILESCREEN: <ProfileScreen />,
          RECENTCHATSCREEN: <RecentScreen />,
          COUNTRYSCREEN: <CountryList />,
          CHATSCREEN: <ChatScreen />,
          CONTACTLIST: <ContactScreen />,
          SETTINGSCREEN: <SettingScreen />,
          // 'null': <RegisterScreen />
        }[screenNav]
      }
      <Box safeAreaBottom />
    </NativeBaseProvider>
  );
}
export default Navigation;
