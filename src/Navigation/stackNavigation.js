import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../screen/RegisterScreen';
import ProfileScreen from '../screen/ProfileScreen';
import RecentScreen from 'screen/RecentScreen';
import SplashScreen from 'screen/SplashScreen';
import {
  CAMERA,
  CHATSCREEN,
  CONTACTLIST,
  CONVERSATION_SCREEN,
  COUNTRYSCREEN,
  FORWARD_MESSSAGE_SCREEN,
  PROFILESCREEN,
  RECENTCHATSCREEN,
  REGISTERSCREEN,
  SETTINGSCREEN,
} from '../constant';
import ChatScreen from '../screen/ChatScreen';
import CountryList from '../screen/CountryList';
import ContactScreen from '../screen/ContactScreen';
import SettingScreen from '../screen/SettingScreen';
import RNCamera from '../components/RNCamera';
import ForwardMessage from '../screen/ForwardMessage';

const Stack = createNativeStackNavigator();

const ChatScreenStackNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
      }}
      initialRouteName={CONVERSATION_SCREEN}>
      <Stack.Screen name={CONVERSATION_SCREEN} component={ChatScreen} />
      <Stack.Screen name={FORWARD_MESSSAGE_SCREEN} component={ForwardMessage} />
    </Stack.Navigator>
  );
};

function StackNavigationPage(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
      }}
      initialRouteName={props.InitialValue}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name={REGISTERSCREEN} component={RegisterScreen} />
      <Stack.Screen name={PROFILESCREEN} component={ProfileScreen} />
      <Stack.Screen name={RECENTCHATSCREEN} component={RecentScreen} />
      <Stack.Screen name={CHATSCREEN} component={ChatScreenStackNavigation} />
      <Stack.Screen name={COUNTRYSCREEN} component={CountryList} />
      <Stack.Screen name={CONTACTLIST} component={ContactScreen} />
      <Stack.Screen name={SETTINGSCREEN} component={SettingScreen} />
      <Stack.Screen name={CAMERA} component={RNCamera} />
    </Stack.Navigator>
  );
}

export default StackNavigationPage;
