import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import IconButton from '../common/IconButton';
import { BackArrowIcon, CloseIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import { getUserIdFromJid, getUserType, handelResetMessageSelection } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { useAnySelectedChatMessages, useIsChatSearching, useThemeColorPalatte } from '../redux/reduxHook';
import { GROUP_INFO, USER_INFO } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import {
   RenderDeleteIcon,
   RenderForwardIcon,
   RenderMenuItems,
   RenderMessageSelectionCount,
   RenderReplyIcon,
} from './ChatHeaderActions';
import ChatHeaderSearch from './ChatHeaderSearch';
import LastSeen from './LastSeen';
import MakeCall from './MakeCall';
import UserAvathar from './UserAvathar';

function ChatHeader({ chatUser }) {
   const themeColorPalatte = useThemeColorPalatte();
   const navigation = useNavigation();
   const userId = getUserIdFromJid(chatUser);
   const isAnyChatMessageSelected = useAnySelectedChatMessages(userId);
   const isSearching = useIsChatSearching();

   const handleRoute = () => {
      if (MIX_BARE_JID.test(chatUser)) {
         navigation.navigate(GROUP_INFO, { chatUser });
      } else {
         navigation.navigate(USER_INFO, { chatUser });
      }
   };

   // Return only the search header separately
   if (isSearching) {
      return <ChatHeaderSearch userId={userId} />;
   }

   const handleBackOrClose = isAnyChatMessageSelected ? handelResetMessageSelection(userId) : navigation.goBack;

   return (
      <View
         style={[
            styles.headerContainer,
            {
               backgroundColor: themeColorPalatte.appBarColor,
               borderBottomColor: themeColorPalatte.mainBorderColor,
            },
         ]}>
         <IconButton onPress={handleBackOrClose}>
            {isAnyChatMessageSelected ? (
               <CloseIcon color={themeColorPalatte.iconColor} />
            ) : (
               <BackArrowIcon color={themeColorPalatte.iconColor} />
            )}
         </IconButton>

         {isAnyChatMessageSelected ? (
            <View style={commonStyles.flex1}>
               <RenderMessageSelectionCount userId={userId} />
            </View>
         ) : (
            <Pressable
               onPress={handleRoute}
               style={commonStyles.flex1}
               contentContainerStyle={styles.userAvatarAndInfoContainer}>
               <UserAvathar width={36} height={36} userId={userId} type={getUserType(chatUser)} />
               <View style={styles.userNameAndLastSeenContainer}>
                  <NickName
                     userId={userId}
                     style={[styles.userNameText, { color: themeColorPalatte.headerPrimaryTextColor }]}
                  />
                  <LastSeen userJid={chatUser} style={styles.lastSeenText} />
               </View>
            </Pressable>
         )}

         <View style={styles.iconsContainer}>
            <>
               {isAnyChatMessageSelected ? (
                  <>
                     <RenderReplyIcon userId={userId} />
                     <RenderDeleteIcon userId={userId} chatUser={chatUser} />
                     <RenderForwardIcon userId={userId} />
                  </>
               ) : (
                  <MakeCall chatUser={chatUser} userId={userId} />
               )}
               <RenderMenuItems userId={userId} chatUser={chatUser} />
            </>
         </View>
      </View>
   );
}

export default React.memo(ChatHeader);

const styles = StyleSheet.create({
   headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 60,
      borderBottomWidth: 1,
      elevation: 2,
      shadowColor: '#181818',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      paddingHorizontal: 10,
   },
   userAvatarAndInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 60,
   },
   userNameAndLastSeenContainer: {
      justifyContent: 'center',
      padding: 10,
   },
   userNameText: {
      fontWeight: '700',
      fontSize: 14,
      maxWidth: 160,
   },
   lastSeenText: {
      fontSize: 12,
      color: '#888888',
   },
   iconsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
   textInput: {
      flex: 1,
      fontSize: 17,
      fontWeight: '400',
      borderBottomWidth: 1,
   },
});
