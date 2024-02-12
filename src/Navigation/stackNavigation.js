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
  GROUPSCREEN,
  IMAGEVIEW,
  MEDIA_POST_PRE_VIEW_SCREEN,
  NEW_GROUP,
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
import PostPreViewPage from '../components/PostPreViewPage';
import NewGroup from '../screen/NewGroup';
import ImageView from '../screen/ImageView';

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
      <Stack.Screen name={MEDIA_POST_PRE_VIEW_SCREEN}>
        {prop => <PostPreViewPage {...prop} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export function RecentStackNavigation(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
        gestureEnabled: false,
      }}
      initialRouteName={RECENTCHATSCREEN}>
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

const GroupScreenStackNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
      }}
      initialRouteName={NEW_GROUP}>
      <Stack.Screen name={NEW_GROUP}>
        {prop => <NewGroup {...prop} />}
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
        gestureEnabled: false,
      }}
      initialRouteName={props.InitialValue}>
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
      <Stack.Screen name={GROUPSCREEN}>
        {prop => <GroupScreenStackNavigation {...prop} />}
      </Stack.Screen>
      <Stack.Screen name={IMAGEVIEW}>
        {prop => <ImageView {...prop} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default StackNavigationPage;
