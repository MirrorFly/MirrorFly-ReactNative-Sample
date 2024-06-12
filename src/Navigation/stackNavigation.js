import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Provider } from 'react-redux';
import VideoPlayer from '../Media/VideoPlayer';
import store from '../redux/store';
import ArchivedScreen from '../screens/ArchivedScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ConversationScreen from '../screens/ConversationScreen';
import CountryList from '../screens/CountryList';
import Gallery from '../screens/Gallery';
import GalleryPhotos from '../screens/GalleryPhotos';
import MediaPreView from '../screens/MediaPreView';
import MenuScreen from '../screens/MenuScreen';
import MessageInfo from '../screens/MessageInfo';
import MobileContactPreview from '../screens/MobileContactPreview';
import MobileContacts from '../screens/MobileContacts';
import PostPreViewPage from '../screens/PostPreViewPage';
import ProfileScreen from '../screens/ProfileScreen';
import Camera from '../screens/RNCamera';
import RecentChatScreen from '../screens/RecentChatScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserInfo from '../screens/UserInfo';
import UsersListScreen from '../screens/UsersListScreen';
import {
   ARCHIVED_SCREEN,
   CAMERA_SCREEN,
   CHATS_CREEN,
   CONVERSATION_SCREEN,
   CONVERSATION_STACK,
   COUNTRY_LIST_SCREEN,
   GALLERY_FOLDER_SCREEN,
   GALLERY_PHOTOS_SCREEN,
   MEDIA_POST_PRE_VIEW_SCREEN,
   MEDIA_PRE_VIEW_SCREEN,
   MENU_SCREEN,
   MESSAGE_INFO_SCREEN,
   MOBILE_CONTACT_LIST_SCREEN,
   MOBILE_CONTACT_PREVIEW_SCREEN,
   PROFILE_SCREEN,
   RECENTCHATSCREEN,
   REGISTERSCREEN,
   SETTINGS_STACK,
   USERS_LIST_SCREEN,
   USER_INFO,
   VIDEO_PLAYER_SCREEN,
} from '../screens/constants';
import { getCurrentScreen } from '../uikitMethods';

const Stack = createNativeStackNavigator();

export function ChatScreen({ chatUser }) {
   return (
      <Provider store={store}>
         <Stack.Navigator
            screenOptions={{
               headerShown: false,
               orientation: 'portrait',
            }}
            initialRouteName={CONVERSATION_SCREEN}>
            <Stack.Screen name={CONVERSATION_SCREEN}>
               {prop => <ConversationScreen chatUser={chatUser} {...prop} />}
            </Stack.Screen>
            <Stack.Screen name={MESSAGE_INFO_SCREEN}>{prop => <MessageInfo {...prop} />}</Stack.Screen>
            <Stack.Screen name={GALLERY_FOLDER_SCREEN}>{prop => <Gallery {...prop} />}</Stack.Screen>
            <Stack.Screen name={GALLERY_PHOTOS_SCREEN}>{prop => <GalleryPhotos {...prop} />}</Stack.Screen>
            <Stack.Screen name={MEDIA_PRE_VIEW_SCREEN}>{prop => <MediaPreView {...prop} />}</Stack.Screen>
            <Stack.Screen name={VIDEO_PLAYER_SCREEN}>{prop => <VideoPlayer {...prop} />}</Stack.Screen>
            <Stack.Screen name={CAMERA_SCREEN}>{prop => <Camera {...prop} />}</Stack.Screen>
            <Stack.Screen name={MOBILE_CONTACT_LIST_SCREEN}>{prop => <MobileContacts {...prop} />}</Stack.Screen>
            <Stack.Screen name={MOBILE_CONTACT_PREVIEW_SCREEN}>
               {prop => <MobileContactPreview {...prop} />}
            </Stack.Screen>
            <Stack.Screen name={USER_INFO}>{prop => <UserInfo {...prop} />}</Stack.Screen>
            <Stack.Screen name={MEDIA_POST_PRE_VIEW_SCREEN}>{prop => <PostPreViewPage {...prop} />}</Stack.Screen>
         </Stack.Navigator>
      </Provider>
   );
}

export function SettingsScreen() {
   return (
      <Provider store={store}>
         <Stack.Navigator
            screenOptions={{
               headerShown: false,
               orientation: 'portrait',
            }}
            initialRouteName={PROFILE_SCREEN}>
            <Stack.Screen name={PROFILE_SCREEN}>{prop => <ProfileScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={MENU_SCREEN}>{prop => <MenuScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={CHATS_CREEN}>{prop => <ChatsScreen {...prop} />}</Stack.Screen>
         </Stack.Navigator>
      </Provider>
   );
}

function StackNavigationPage() {
   console.log('StackNavigationPage ==>', getCurrentScreen());
   return (
      <Provider store={store}>
         <Stack.Navigator
            screenOptions={{
               headerShown: false,
               orientation: 'portrait',
            }}
            initialRouteName={getCurrentScreen()}>
            <Stack.Screen name={REGISTERSCREEN}>{prop => <RegisterScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={COUNTRY_LIST_SCREEN}>{prop => <CountryList {...prop} />}</Stack.Screen>
            <Stack.Screen name={RECENTCHATSCREEN}>{prop => <RecentChatScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={CONVERSATION_STACK}>{prop => <ChatScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={USERS_LIST_SCREEN}>{prop => <UsersListScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={SETTINGS_STACK}>{prop => <SettingsScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={ARCHIVED_SCREEN}>{prop => <ArchivedScreen {...prop} />}</Stack.Screen>
         </Stack.Navigator>
      </Provider>
   );
}

export default StackNavigationPage;
