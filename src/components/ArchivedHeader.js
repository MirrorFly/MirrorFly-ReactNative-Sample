import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { CloseIcon, DeleteIcon, UnArchiveIcon } from '../common/Icons';
import ScreenHeader from '../common/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid, toggleArchive } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { deleteRecentChats, resetChatSelections } from '../redux/recentChatDataSlice';
import { getArchiveSelectedChats, getUserNameFromStore, useArchivedChatData } from '../redux/reduxHook';
import { ARCHIVED_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

function ArchivedHeader() {
   const dispatch = useDispatch();
   const recentChatData = useArchivedChatData();
   const [modalContent, setModalContent] = React.useState(null);
   const filtered = React.useMemo(() => {
      return recentChatData.filter(item => item.isSelected === 1);
   }, [recentChatData.map(item => item.isSelected).join(',')]); // Include isSelected in the dependency array

   const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
   const userName = getUserNameFromStore(getUserIdFromJid(filtered[0]?.userJid)) || '';

   const deleteMessage =
      filtered.length === 1 ? `Delete chat with "${userName}"?` : `Delete ${filtered.length} selected chats?`;

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
               <DeleteIcon />
            </IconButton>
         </View>
      ) : null;
   };

   const renderUnArchiveIcon = () => {
      return (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={toggleArchive(false)}>
               <UnArchiveIcon />
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
            <View style={[styles.container, commonStyles.p_15]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <IconButton onPress={resetSelections}>
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
                  {renderUnArchiveIcon()}
               </View>
               {modalContent && <AlertModal {...modalContent} />}
            </View>
         )
      );
   }, [filtered.length, modalContent]);

   const renderScreenHeader = React.useMemo(() => {
      return !Boolean(filtered.length) && <ScreenHeader isSearchable={false} title="Archived Chats" />;
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

export default ArchivedHeader;
