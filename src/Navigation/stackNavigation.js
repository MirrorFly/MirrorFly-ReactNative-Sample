import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../screen/RegisterScreen';
import ProfileScreen from '../screen/ProfileScreen';
import RecentScreen from '../screen/RecentScreen';
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
      <Stack.Screen name={CONVERSATION_SCREEN}>
        {prop => <ChatScreen {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={FORWARD_MESSSAGE_SCREEN}>
        {prop => <ForwardMessage {...prop} />}
      </Stack.Screen>
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
      {/* <Stack.Screen name="Splash" component={SplashScreen} /> */}
      <Stack.Screen name={REGISTERSCREEN}>
        {prop => <RegisterScreen {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={PROFILESCREEN}>
        {prop => <ProfileScreen {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={RECENTCHATSCREEN}>
        {prop => <RecentScreen {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={CHATSCREEN}>
        {prop => <ChatScreenStackNavigation {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={COUNTRYSCREEN}>
        {prop => <CountryList {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={CONTACTLIST}>
        {prop => <ContactScreen {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={SETTINGSCREEN}>
        {prop => <SettingScreen {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={CAMERA}>
        {prop => <RNCamera {...prop} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default StackNavigationPage;
