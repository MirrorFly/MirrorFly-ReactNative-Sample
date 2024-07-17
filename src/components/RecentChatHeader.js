import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import RootNavigation from '../Navigation/rootNavigation';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { ArchiveIcon, CloseIcon, DeleteIcon } from '../common/Icons';
import ScreenHeader from '../common/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid, showToast, toggleArchive } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { deleteRecentChats, resetChatSelections, setSearchText } from '../redux/recentChatDataSlice';
import { getSelectedChats, getUserNameFromStore, useRecentChatData } from '../redux/reduxHook';
import { GROUP_STACK, MENU_SCREEN, SETTINGS_STACK } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

const RecentChatHeader = () => {
   const dispatch = useDispatch();
   const recentChatData = useRecentChatData();
   const [modalContent, setModalContent] = React.useState(null);

   const filtered = React.useMemo(() => {
      return recentChatData.filter(item => item.isSelected === 1);
   }, [recentChatData.map(item => item.isSelected).join(',')]); // Include isSelected in the dependency array
   const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
   const isChatMuted = filtered.some(res => res.muteStatus === 1);
   const isGroupExistMute = filtered.some(res => MIX_BARE_JID.test(res.userJid));

   const userName = getUserNameFromStore(getUserIdFromJid(filtered[0]?.userJid)) || '';
   const deleteMessage =
      filtered.length === 1 ? `Delete chat with "${userName}"?` : `Delete ${filtered.length} selected chats?`;

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
         noButton: 'No',
         yesButton: 'Yes',
         yesAction: handleRemoveClose,
      });
   };

   const handleRemoveClose = () => {
      const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
      if (!isUserLeft && filtered.length > 1) {
         toggleModalContent();
         return showToast('You are a member of a certain group');
      }

      if (!isUserLeft) {
         toggleModalContent();
         return showToast('You are a participant in this group');
      }

      const userJids = getSelectedChats().map(item => item.userJid);

      userJids.forEach(item => {
         SDK.deleteChat(item);
      });

      dispatch(deleteRecentChats());
   };

   const renderDeleteIcon = () => {
      return isUserLeft ? (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={handleDelete}>
               <DeleteIcon />
            </IconButton>
         </View>
      ) : null;
   };

   const renderArchiveIcon = () => {
      return (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={toggleArchive(true)}>
               <ArchiveIcon />
            </IconButton>
         </View>
      );
   };

   /**  {!isGroupExistMute && renderMuteIcon()}
   // const renderMuteIcon = () => {
   //    return (
   //       <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
   //          <IconButton onPress={toggleMuteChat}>
   //             {!isChatMuted ? <ChatMuteIcon width={17} height={17} /> : <ChatUnMuteIcon width={17} height={17} />}
   //          </IconButton>
   //       </View>
   //    );
   // };
   */

   const hanldeRoute = () => {
      RootNavigation.navigate(SETTINGS_STACK, { screen: MENU_SCREEN });
   };

   const hanldeGroupRoute = () => {
      RootNavigation.navigate(GROUP_STACK);
   };

   const menuItems = [
      {
         label: 'New Group',
         formatter: hanldeGroupRoute,
      },
      {
         label: 'Settings',
         formatter: hanldeRoute,
      },
   ];

   const resetChatSelection = () => {
      dispatch(resetChatSelections());
   };

   const renderSelectionHeader = React.useMemo(() => {
      return (
         Boolean(filtered.length) && (
            <View style={[styles.container, commonStyles.p_15]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <IconButton onPress={resetChatSelection}>
                     <CloseIcon />
                  </IconButton>
                  <Text
                     style={[
                        commonStyles.textCenter,
                        commonStyles.fontSize_18,
                        commonStyles.colorBlack,
                        commonStyles.pl_10,
                     ]}>
                     {filtered.length}
                  </Text>
               </View>
               <View style={commonStyles.hstack}>
                  {renderDeleteIcon()}
                  {renderArchiveIcon()}
               </View>
               {modalContent && <AlertModal {...modalContent} />}
            </View>
         )
      );
   }, [filtered.length, modalContent]);

   const renderScreenHeader = React.useMemo(() => {
      return !Boolean(filtered.length) && <ScreenHeader onChangeText={handleSearchText} menuItems={menuItems} />;
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
      backgroundColor: ApplicationColors.headerBg,
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
