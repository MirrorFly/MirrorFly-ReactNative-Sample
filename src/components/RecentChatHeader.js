import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import RootNavigation from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { ArchiveIcon, ChatMuteIcon, ChatUnMuteIcon, CloseIcon, DeleteIcon } from '../common/Icons';
import ScreenHeader from '../common/ScreenHeader';
import Text from '../common/Text';
import { getUserIdFromJid, showToast, toggleArchive, toggleMuteChat } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { getStringSet, replacePlaceholders } from '../localization/stringSet';
import { clearChatMessageData } from '../redux/chatMessageDataSlice';
import {
   clearRecentChatData,
   deleteRecentChats,
   resetChatSelections,
   setSearchText,
} from '../redux/recentChatDataSlice';
import { getUserNameFromStore, useRecentChatData, useThemeColorPalatte } from '../redux/reduxHook';
import { GROUP_STACK, MENU_SCREEN, SETTINGS_STACK } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

const RenderMuteIcon = ({ userJids }) => {
   const rosterData = useSelector(state => state.rosterData.data);
   const muteStatuses = userJids.map(jid => {
      const userId = getUserIdFromJid(jid);
      return rosterData[userId]?.muteStatus === 1;
   });
   const areAllMuted = muteStatuses.every(status => status === true);

   return (
      <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
         <IconButton onPress={toggleMuteChat}>
            {areAllMuted ? <ChatUnMuteIcon width={17} height={17} /> : <ChatMuteIcon width={17} height={17} />}
         </IconButton>
      </View>
   );
};

const RecentChatHeader = () => {
   const dispatch = useDispatch();
   const recentChatData = useRecentChatData();
   const themeColorPalatte = useThemeColorPalatte();
   const stringSet = getStringSet();
   const [modalContent, setModalContent] = React.useState(null);
   let userJids = [];

   const filtered = React.useMemo(() => {
      userJids = recentChatData.filter(item => item.isSelected === 1).map(item => item.userJid);

      return recentChatData.filter(
         item => item.isSelected === 1 && (item.archiveStatus === 0 || item.archiveStatus === undefined),
      );
   }, [recentChatData.map(item => `${item.isSelected}-${item.userType}`).join(',')]); // Include isSelected in the dependency array

   const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
   const isExists = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType !== '' : true));

   const userName = getUserNameFromStore(getUserIdFromJid(filtered[0]?.userJid)) || '';
   const deleteMessage =
      filtered.length === 1
         ? replacePlaceholders(stringSet.RECENT_CHAT_SCREEN.DELETE_CHAT_LABEL, { userName })
         : replacePlaceholders(stringSet.RECENT_CHAT_SCREEN.DELETE_MULTIPLE_CHAT_LABEL, { length: filtered.length });

   const handleSearchText = text => {
      dispatch(setSearchText(text));
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const handleDelete = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: deleteMessage,
         noButton: stringSet.BUTTON_LABEL.NO_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.YES_BUTTON,
         yesAction: handleRemoveClose,
      });
   };

   const handleRemoveClose = () => {
      const _isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
      if (!_isUserLeft && filtered.length > 1) {
         toggleModalContent();
         return showToast(stringSet.COMMON_TEXT.YOU_ARE_A_MEMBER);
      }

      if (!_isUserLeft) {
         toggleModalContent();
         return showToast(stringSet.COMMON_TEXT.YOU_ARE_A_PARTICIPANT);
      }

      userJids.forEach(item => {
         SDK.deleteChat(item);
         SDK.clearChat(item);
         dispatch(clearChatMessageData(getUserIdFromJid(item)));
         dispatch(clearRecentChatData(item));
      });

      dispatch(deleteRecentChats());
   };

   const renderDeleteIcon = () => {
      return isUserLeft ? (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={handleDelete}>
               <DeleteIcon color={themeColorPalatte.iconColor} />
            </IconButton>
         </View>
      ) : null;
   };

   const renderArchiveIcon = () => {
      return (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={toggleArchive(true)}>
               <ArchiveIcon color={themeColorPalatte.iconColor} />
            </IconButton>
         </View>
      );
   };

   const renderMuteIcon = () => {
      if (!isExists) {
         return null;
      }
      return <RenderMuteIcon userJids={userJids} />;
   };

   const hanldeRoute = () => {
      RootNavigation.navigate(SETTINGS_STACK, { screen: MENU_SCREEN });
   };

   const hanldeGroupRoute = () => {
      RootNavigation.navigate(GROUP_STACK);
   };

   const menuItems = [
      {
         label: stringSet.RECENT_CHAT_MENU_DROP_DOWN.NEW_GROUP_LABEL,
         formatter: hanldeGroupRoute,
      },
      {
         label: stringSet.RECENT_CHAT_MENU_DROP_DOWN.SETTINGS_LABEL,
         formatter: hanldeRoute,
      },
   ];

   const resetChatSelection = () => {
      dispatch(resetChatSelections());
   };

   const renderSelectionHeader = React.useMemo(() => {
      return (
         Boolean(filtered.length) && (
            <View style={[styles.container, commonStyles.p_15, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <IconButton onPress={resetChatSelection}>
                     <CloseIcon color={themeColorPalatte.iconColor} />
                  </IconButton>
                  <Text
                     style={[
                        commonStyles.textCenter,
                        commonStyles.fontSize_18,
                        commonStyles.pl_10,
                        commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor),
                     ]}>
                     {filtered.length}
                  </Text>
               </View>
               <View style={commonStyles.hstack}>
                  {renderDeleteIcon()}
                  {renderMuteIcon()}
                  {renderArchiveIcon()}
               </View>
               {modalContent && <AlertModal {...modalContent} />}
            </View>
         )
      );
   }, [filtered.map(item => `${item.isSelected}-${item.userType}`).join(','), modalContent, themeColorPalatte]);

   const renderScreenHeader = React.useMemo(() => {
      return filtered.length === 0 && <ScreenHeader onChangeText={handleSearchText} menuItems={menuItems} />;
   }, [filtered.length]);

   return (
      <>
         {renderScreenHeader}
         {renderSelectionHeader}
      </>
   );
};

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: 65,
      paddingRight: 16,
      paddingVertical: 12,
   },
   logoImage: {
      marginLeft: 12,
      width: 145,
      height: 20.8,
   },
   textInput: {
      flex: 1,
      color: 'black',
      fontSize: 16,
   },
});

export default RecentChatHeader;
