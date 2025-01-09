import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { CloseIcon, DeleteIcon, UnArchiveIcon } from '../common/Icons';
import ScreenHeader from '../common/ScreenHeader';
import Text from '../common/Text';
import { getUserIdFromJid, showToast, toggleArchive } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { getStringSet, replacePlaceholders } from '../localization/stringSet';
import { deleteRecentChats, resetChatSelections } from '../redux/recentChatDataSlice';
import {
   getArchiveSelectedChats,
   getUserNameFromStore,
   useArchivedChatData,
   useThemeColorPalatte,
} from '../redux/reduxHook';
import { ARCHIVED_SCREEN } from '../screens/constants';
import SDK from '../SDK/SDK';
import commonStyles from '../styles/commonStyles';
import MuteChat from './MuteChat';

function ArchivedHeader() {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const dispatch = useDispatch();
   const recentChatData = useArchivedChatData();
   const [modalContent, setModalContent] = React.useState(null);
   const filtered = React.useMemo(() => {
      return recentChatData.filter(item => item.isSelected === 1);
   }, [recentChatData.map(item => item.isSelected).join(',')]); // Include isSelected in the dependency array

   const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
   const userName = getUserNameFromStore(getUserIdFromJid(filtered[0]?.userJid)) || '';
   const isGroupExistMute = filtered.some(res => MIX_BARE_JID.test(res.userJid));

   const deleteMessage =
      filtered.length === 1
         ? replacePlaceholders(stringSet.RECENT_CHAT_SCREEN.DELETE_CHAT_LABEL, {
              userName: userName,
           })
         : replacePlaceholders(stringSet.RECENT_CHAT_SCREEN.DELETE_MULTIPLE_CHAT_LABEL, {
              length: filtered.length,
           });

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
      const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
      if (!isUserLeft && filtered.length > 1) {
         toggleModalContent();
         return showToast(stringSet.COMMON_TEXT.YOU_ARE_A_MEMBER);
      }

      if (!isUserLeft) {
         toggleModalContent();
         return showToast(stringSet.COMMON_TEXT.YOU_ARE_A_PARTICIPANT);
      }

      const userJids = getArchiveSelectedChats().map(item => item.userJid);

      userJids.forEach(item => {
         SDK.deleteChat(item);
      });

      dispatch(deleteRecentChats(ARCHIVED_SCREEN));
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

   const renderUnArchiveIcon = () => {
      return (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={toggleArchive(false)}>
               <UnArchiveIcon color={themeColorPalatte.iconColor} />
            </IconButton>
         </View>
      );
   };

   const resetSelections = () => {
      dispatch(resetChatSelections(ARCHIVED_SCREEN));
   };

   const renderSelectionHeader = React.useMemo(() => {
      return (
         Boolean(filtered.length) && (
            <View style={[styles.container, commonStyles.p_15, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <IconButton onPress={resetSelections}>
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
                  {!isGroupExistMute && <MuteChat filteredChats={filtered} />}
                  {renderUnArchiveIcon()}
               </View>
               {modalContent && <AlertModal {...modalContent} />}
            </View>
         )
      );
   }, [filtered.length, modalContent, themeColorPalatte]);

   const renderScreenHeader = React.useMemo(() => {
      return (
         !Boolean(filtered.length) && (
            <ScreenHeader isSearchable={false} title={stringSet.COMMON_TEXT.ARCHIVED_CHAT_HEADER_LABEL} />
         )
      );
   }, [filtered.length]);

   return (
      <>
         {renderScreenHeader}
         {renderSelectionHeader}
      </>
   );
}

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
});

export default ArchivedHeader;
