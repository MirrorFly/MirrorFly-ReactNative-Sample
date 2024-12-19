import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import IconButton from '../common/IconButton';
import { BackArrowIcon, CloseIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid, getUserType, handelResetMessageSelection } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { useAnySelectedChatMessages } from '../redux/reduxHook';
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
   const navigation = useNavigation();
   const userId = getUserIdFromJid(chatUser);
   const isAnyChatMessageSelected = useAnySelectedChatMessages(userId);
   const isSearching = false;

   const handleRoute = () => {
      if (MIX_BARE_JID.test(chatUser)) {
         navigation.navigate(GROUP_INFO, { chatUser });
      } else {
         navigation.navigate(USER_INFO, { chatUser });
      }
   };

   if (isSearching) {
      return <ChatHeaderSearch userId={userId} />;
   }

   if (isAnyChatMessageSelected) {
      return (
         <View style={styles.headerContainer}>
            <IconButton onPress={handelResetMessageSelection(userId)}>
               <CloseIcon />
            </IconButton>
            <View style={commonStyles.flex1}>
               <RenderMessageSelectionCount userId={userId} />
            </View>
            <View style={styles.iconsContainer}>
               <RenderReplyIcon userId={userId} />
               <RenderDeleteIcon userId={userId} chatUser={chatUser} />
               <RenderForwardIcon userId={userId} />
               <RenderMenuItems userId={userId} chatUser={chatUser} />
            </View>
         </View>
      );
   }

   if (!isAnyChatMessageSelected) {
      return (
         <View style={styles.headerContainer}>
            <IconButton onPress={navigation.goBack}>
               <BackArrowIcon />
            </IconButton>
            <Pressable
               onPress={handleRoute}
               style={commonStyles.flex1}
               contentContainerStyle={styles.userAvatarAndInfoContainer}>
               <UserAvathar width={36} height={36} userId={userId} type={getUserType(chatUser)} />
               <View style={styles.userNameAndLastSeenContainer}>
                  <NickName userId={userId} style={styles.userNameText} />
                  <LastSeen userJid={chatUser} style={styles.lastSeenText} />
               </View>
            </Pressable>
            <View style={styles.iconsContainer}>
               <MakeCall chatUser={chatUser} userId={userId} />
               <RenderMenuItems userId={userId} chatUser={chatUser} />
            </View>
         </View>
      );
   }
}

export default React.memo(ChatHeader);

const styles = StyleSheet.create({
   headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 60,
      backgroundColor: ApplicationColors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: ApplicationColors.mainBorderColor,
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
      color: '#181818',
      fontWeight: '700',
      fontSize: 14,
      maxWidth: 170,
   },
   lastSeenText: {
      fontSize: 12,
      width: '98%',
      color: '#888888',
   },
   iconsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
   textInput: {
      flex: 1,
      color: 'black',
      fontSize: 16,
   },
});
