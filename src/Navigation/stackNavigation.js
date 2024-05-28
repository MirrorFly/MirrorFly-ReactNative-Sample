import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ContactList from '../components/Media/ContactList';
import ContactPreviewScreen from '../components/Media/ContactPreviewScreen';
import Location from '../components/Media/Location';
import VideoPlayer from '../components/Media/VideoPlayer';
import MediaPreView from '../components/MediaPreView';
import MessageInfo from '../components/MessageInfo';
import PostPreViewPage from '../components/PostPreViewPage';
import { default as Camera, default as RNCamera } from '../components/RNCamera';
import {
   CAMERA,
   CAMERA_SCREEN,
   CHATSCREEN,
   CONTACTLIST,
   CONVERSATION_SCREEN,
   COUNTRYSCREEN,
   EDITNAME,
   FORWARD_MESSSAGE_SCREEN,
   GALLERY_FOLDER_SCREEN,
   GALLERY_PHOTOS_SCREEN,
   GROUPSCREEN,
   GROUP_INFO,
   IMAGEVIEW,
   LOCATION_SCREEN,
   MEDIA_POST_PRE_VIEW_SCREEN,
   MEDIA_PRE_VIEW_SCREEN,
   MESSAGE_INFO_SCREEN,
   MOBILE_CONTACT_LIST_SCREEN,
   NEW_GROUP,
   PREVIEW_MOBILE_CONTACT_LIST_SCREEN,
   PROFILESCREEN,
   RECENTCHATSCREEN,
   REGISTERSCREEN,
   SETTINGSCREEN,
   USER_INFO,
   VIDEO_PLAYER_SCREEN,
   VIEWALLMEDIA,
} from '../constant';
import ContactScreen from '../screen/ContactScreen';
import ConversationScreen from '../screen/ConversationScreen';
import CountryList from '../screen/CountryList';
import EditName from '../screen/EditName';
import ForwardMessage from '../screen/ForwardMessage';
import Gallery from '../screen/Gallery';
import GalleryPhotos from '../screen/GalleryPhotos';
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
            gestureEnabled: false,
         }}
         initialRouteName={CONVERSATION_SCREEN}>
         <Stack.Screen name={CONVERSATION_SCREEN}>{prop => <ConversationScreen {...prop} />}</Stack.Screen>
         <Stack.Screen name={USER_INFO}>{prop => <UserInfo {...prop} />}</Stack.Screen>
         <Stack.Screen name={FORWARD_MESSSAGE_SCREEN}>{prop => <ForwardMessage {...prop} />}</Stack.Screen>
         <Stack.Screen name={VIEWALLMEDIA}>{prop => <ViewAllMedia {...prop} />}</Stack.Screen>
         <Stack.Screen name={MEDIA_PRE_VIEW_SCREEN}>{prop => <MediaPreView {...prop} />}</Stack.Screen>
         <Stack.Screen name={MEDIA_POST_PRE_VIEW_SCREEN}>{prop => <PostPreViewPage {...prop} />}</Stack.Screen>
         <Stack.Screen name={IMAGEVIEW}>{prop => <ImageView {...prop} />}</Stack.Screen>
         <Stack.Screen name={EDITNAME}>{prop => <EditName {...prop} />}</Stack.Screen>
         <Stack.Screen name={GROUP_INFO}>{prop => <GroupInfo {...prop} />}</Stack.Screen>
         <Stack.Screen name={MESSAGE_INFO_SCREEN}>{prop => <MessageInfo {...prop} />}</Stack.Screen>
         <Stack.Screen name={MOBILE_CONTACT_LIST_SCREEN}>{prop => <ContactList {...prop} />}</Stack.Screen>
         <Stack.Screen name={PREVIEW_MOBILE_CONTACT_LIST_SCREEN}>
            {prop => <ContactPreviewScreen {...prop} />}
         </Stack.Screen>
         <Stack.Screen name={LOCATION_SCREEN}>{prop => <Location {...prop} />}</Stack.Screen>
         <Stack.Screen name={VIDEO_PLAYER_SCREEN}>{prop => <VideoPlayer {...prop} />}</Stack.Screen>
         <Stack.Screen name={CAMERA_SCREEN}>{prop => <Camera {...prop} />}</Stack.Screen>
         <Stack.Screen name={GALLERY_FOLDER_SCREEN}>{prop => <Gallery {...prop} />}</Stack.Screen>
         <Stack.Screen name={GALLERY_PHOTOS_SCREEN}>{prop => <GalleryPhotos {...prop} />}</Stack.Screen>
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
         <Stack.Screen name={GROUPSCREEN}>{prop => <GroupScreenStackNavigation {...prop} />}</Stack.Screen>
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
         <Stack.Screen name={GROUPSCREEN}>{prop => <GroupScreenStackNavigation {...prop} />}</Stack.Screen>
      </Stack.Navigator>
   );
}

export default StackNavigationPage;
