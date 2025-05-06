import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Provider } from 'react-redux';
import VideoPlayer from '../Media/VideoPlayer';
import AlertModalRoot from '../common/AlertModalRoot';
import ToastMessage from '../common/ToastMessage';
import store from '../redux/store';
import ArchivedScreen from '../screens/ArchivedScreen';
import BlockedContactListScreen from '../screens/BlockedContactListScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ConversationScreen from '../screens/ConversationScreen';
import CountryList from '../screens/CountryList';
import EditName from '../screens/EditName';
import EditStatusPage from '../screens/EditStatusPage';
import ForwardMessage from '../screens/ForwardMessage';
import Gallery from '../screens/Gallery';
import GalleryPhotos from '../screens/GalleryPhotos';
import GroupInfo from '../screens/GroupInfo';
import ImageView from '../screens/ImageView';
import LocationScreen from '../screens/LocationScreen';
import MediaPreView from '../screens/MediaPreView';
import MenuScreen from '../screens/MenuScreen';
import MessageInfo from '../screens/MessageInfo';
import MobileContactPreview from '../screens/MobileContactPreview';
import MobileContacts from '../screens/MobileContacts';
import NewGroup from '../screens/NewGroup';
import NotificationAlertScreen from '../screens/NotificationAlertScreen';
import NotificationScreen from '../screens/NotificationScreen';
import PostPreViewPage from '../screens/PostPreViewPage';
import ProfilePhoto from '../screens/ProfilePhoto';
import ProfileScreen from '../screens/ProfileScreen';
import Camera from '../screens/RNCamera';
import RecentChatScreen from '../screens/RecentChatScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserInfo from '../screens/UserInfo';
import UsersListScreen from '../screens/UsersListScreen';
import ViewAllMedia from '../screens/ViewAllMedia';
import {
   ARCHIVED_SCREEN,
   BLOCKED_CONTACT_LIST_STACK,
   CAMERA_SCREEN,
   CHATS_CREEN,
   CONVERSATION_SCREEN,
   CONVERSATION_STACK,
   COUNTRY_LIST_SCREEN,
   EDITNAME,
   FORWARD_MESSSAGE_SCREEN,
   GALLERY_FOLDER_SCREEN,
   GALLERY_PHOTOS_SCREEN,
   GROUP_INFO,
   GROUP_STACK,
   IMAGEVIEW,
   LOCATION_SCREEN,
   MEDIA_POST_PRE_VIEW_SCREEN,
   MEDIA_PRE_VIEW_SCREEN,
   MENU_SCREEN,
   MESSAGE_INFO_SCREEN,
   MOBILE_CONTACT_LIST_SCREEN,
   MOBILE_CONTACT_PREVIEW_SCREEN,
   NEW_GROUP,
   NOTIFICATION_ALERT_STACK,
   NOTIFICATION_STACK,
   PROFILE_IMAGE,
   PROFILE_SCREEN,
   PROFILE_STACK,
   PROFILE_STATUS_EDIT,
   RECENTCHATSCREEN,
   REGISTERSCREEN,
   SETTINGS_STACK,
   USERS_LIST_SCREEN,
   USER_INFO,
   VIDEO_PLAYER_SCREEN,
   VIEWALLMEDIA,
} from '../screens/constants';
import { getCurrentScreen } from '../uikitMethods';
import ConnectionStatus from '../common/ConnectionStatus';
import { View } from 'react-native';

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
            <Stack.Screen name={VIEWALLMEDIA}>{prop => <ViewAllMedia {...prop} />}</Stack.Screen>
            <Stack.Screen name={MEDIA_PRE_VIEW_SCREEN}>{prop => <MediaPreView {...prop} />}</Stack.Screen>
            <Stack.Screen name={VIDEO_PLAYER_SCREEN}>{prop => <VideoPlayer {...prop} />}</Stack.Screen>
            <Stack.Screen name={CAMERA_SCREEN}>{prop => <Camera {...prop} />}</Stack.Screen>
            <Stack.Screen name={MOBILE_CONTACT_LIST_SCREEN}>{prop => <MobileContacts {...prop} />}</Stack.Screen>
            <Stack.Screen name={MOBILE_CONTACT_PREVIEW_SCREEN}>
               {prop => <MobileContactPreview {...prop} />}
            </Stack.Screen>
            <Stack.Screen name={LOCATION_SCREEN}>{prop => <LocationScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={USER_INFO}>{prop => <UserInfo {...prop} />}</Stack.Screen>
            <Stack.Screen name={MEDIA_POST_PRE_VIEW_SCREEN}>{prop => <PostPreViewPage {...prop} />}</Stack.Screen>
            <Stack.Screen name={GROUP_INFO}>{prop => <GroupInfo {...prop} />}</Stack.Screen>
            <Stack.Screen name={EDITNAME}>{prop => <EditName {...prop} />}</Stack.Screen>
            <Stack.Screen name={IMAGEVIEW}>{prop => <ImageView {...prop} />}</Stack.Screen>
            <Stack.Screen name={FORWARD_MESSSAGE_SCREEN}>{prop => <ForwardMessage {...prop} />}</Stack.Screen>
         </Stack.Navigator>
      </Provider>
   );
}

export const ProfileStack = () => {
   return (
      <Provider store={store}>
         <Stack.Navigator
            screenOptions={{
               headerShown: false,
               orientation: 'portrait',
            }}
            initialRouteName={PROFILE_SCREEN}>
            <Stack.Screen name={PROFILE_SCREEN}>{prop => <ProfileScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={PROFILE_IMAGE}>{prop => <ProfilePhoto {...prop} />}</Stack.Screen>
            <Stack.Screen name={PROFILE_STATUS_EDIT}>{prop => <EditStatusPage {...prop} />}</Stack.Screen>
         </Stack.Navigator>
      </Provider>
   );
};

export function SettingsScreen() {
   return (
      <Provider store={store}>
         <Stack.Navigator
            screenOptions={{
               headerShown: false,
               orientation: 'portrait',
            }}
            initialRouteName={PROFILE_STACK}>
            <Stack.Screen name={PROFILE_STACK}>{prop => <ProfileStack {...prop} />}</Stack.Screen>
            <Stack.Screen name={MENU_SCREEN}>{prop => <MenuScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={CHATS_CREEN}>{prop => <ChatsScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={NOTIFICATION_STACK}>{prop => <NotificationScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={NOTIFICATION_ALERT_STACK}>{prop => <NotificationAlertScreen {...prop} />}</Stack.Screen>
            <Stack.Screen name={BLOCKED_CONTACT_LIST_STACK}>
               {prop => <BlockedContactListScreen {...prop} />}
            </Stack.Screen>
         </Stack.Navigator>
      </Provider>
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

function StackNavigationPage() {
   return (
      <Provider store={store}>
         <View style={styles.container}>
            <ConnectionStatus />
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
               <Stack.Screen name={GROUP_STACK}>{prop => <GroupScreenStackNavigation {...prop} />}</Stack.Screen>
            </Stack.Navigator>
            <ToastMessage />
            <AlertModalRoot />
         </View>
      </Provider>
   );
}

export default StackNavigationPage;

const styles = {
   container: { flex: 1, position: 'relative' },
};
