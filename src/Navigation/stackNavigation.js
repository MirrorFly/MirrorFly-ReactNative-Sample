import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import PostPreViewPage from '../components/PostPreViewPage';
import RNCamera from '../components/RNCamera';
import {
   CAMERA,
   CHATSCREEN,
   CONTACTLIST,
   CONVERSATION_SCREEN,
   COUNTRYSCREEN,
   EDITNAME,
   FORWARD_MESSSAGE_SCREEN,
   GROUPSCREEN,
   GROUP_INFO,
   IMAGEVIEW,
   MEDIA_POST_PRE_VIEW_SCREEN,
   NEW_GROUP,
   PROFILESCREEN,
   RECENTCHATSCREEN,
   REGISTERSCREEN,
   SETTINGSCREEN,
   USER_INFO,
   VIEWALLMEDIA,
} from '../constant';
import ChatScreen from '../screen/ChatScreen';
import ContactScreen from '../screen/ContactScreen';
import CountryList from '../screen/CountryList';
import EditName from '../screen/EditName';
import ForwardMessage from '../screen/ForwardMessage';
import GroupInfo from '../screen/GroupInfo';
import ImageView from '../screen/ImageView';
import NewGroup from '../screen/NewGroup';
import ProfileScreen from '../screen/ProfileScreen';
import RecentScreen from '../screen/RecentScreen';
import RegisterScreen from '../screen/RegisterScreen';
import SettingScreen from '../screen/SettingScreen';
import UserInfo from '../screen/UserInfo';
import ViewAllMedia from '../screen/ViewAllMedia';

const Stack = createNativeStackNavigator();

const ChatScreenStackNavigation = () => {
   return (
      <Stack.Navigator
         screenOptions={{
            headerShown: false,
            orientation: 'portrait',
         }}
         initialRouteName={CONVERSATION_SCREEN}>
         <Stack.Screen name={CONVERSATION_SCREEN}>{prop => <ChatScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={USER_INFO}>{prop => <UserInfo {...prop} />}</Stack.Screen>
         <Stack.Screen name={FORWARD_MESSSAGE_SCREEN}>{prop => <ForwardMessage {...prop} />}</Stack.Screen>
         <Stack.Screen name={GROUPSCREEN}>{prop => <GroupScreenStackNavigation {...prop} />}</Stack.Screen>
         <Stack.Screen name={VIEWALLMEDIA}>{prop => <ViewAllMedia {...prop} />}</Stack.Screen>
         <Stack.Screen name={MEDIA_POST_PRE_VIEW_SCREEN}>{prop => <PostPreViewPage {...prop} />}</Stack.Screen>
         <Stack.Screen name={IMAGEVIEW}>{prop => <ImageView {...prop} />}</Stack.Screen>
         <Stack.Screen name={EDITNAME}>{prop => <EditName {...prop} />}</Stack.Screen>
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
         <Stack.Screen name={PROFILESCREEN}>{prop => <ProfileScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={RECENTCHATSCREEN}>{prop => <RecentScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={CHATSCREEN}>{prop => <ChatScreenStackNavigation {...prop} />}</Stack.Screen>
         <Stack.Screen name={COUNTRYSCREEN}>{prop => <CountryList {...prop} />}</Stack.Screen>
         <Stack.Screen name={CONTACTLIST}>{prop => <ContactScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={SETTINGSCREEN}>{prop => <SettingScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={CAMERA}>{prop => <RNCamera {...prop} />}</Stack.Screen>
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
         <Stack.Screen name={NEW_GROUP}>{prop => <NewGroup {...prop} />}</Stack.Screen>
         <Stack.Screen name={GROUP_INFO}>{prop => <GroupInfo {...prop} />}</Stack.Screen>
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
         <Stack.Screen name={REGISTERSCREEN}>{prop => <RegisterScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={PROFILESCREEN}>{prop => <ProfileScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={RECENTCHATSCREEN}>{prop => <RecentScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={CHATSCREEN}>{prop => <ChatScreenStackNavigation {...prop} />}</Stack.Screen>
         <Stack.Screen name={COUNTRYSCREEN}>{prop => <CountryList {...prop} />}</Stack.Screen>
         <Stack.Screen name={CONTACTLIST}>{prop => <ContactScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={SETTINGSCREEN}>{prop => <SettingScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={CAMERA}>{prop => <RNCamera {...prop} />}</Stack.Screen>
      </Stack.Navigator>
   );
}

export default StackNavigationPage;
