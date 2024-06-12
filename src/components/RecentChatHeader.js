import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import RootNavigation from '../Navigation/rootNavigation';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { ArchiveIcon, CloseIcon, DeleteIcon } from '../common/Icons';
import LoadingModal from '../common/LoadingModal';
import ScreenHeader from '../common/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid, toggleArchive } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { resetChatSelections, setSearchText } from '../redux/recentChatDataSlice';
import { getUserNameFromStore, useRecentChatData } from '../redux/reduxHook';
import { MENU_SCREEN, SETTINGS_STACK } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { mirrorflyLogout } from '../uikitMethods';

const RecentChatHeader = () => {
   const dispatch = useDispatch();
   const recentChatData = useRecentChatData();
   const [modalContent, setModalContent] = React.useState(null);
   const [text, setText] = React.useState('');
   const [isLoading, setIsLoading] = React.useState(false);

   const filtered = React.useMemo(() => {
      return recentChatData.filter(item => item.isSelected === 1);
   }, [recentChatData.map(item => item.isSelected).join(',')]); // Include isSelected in the dependency array
   const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
   const userName = getUserNameFromStore(getUserIdFromJid(filtered[0]?.userJid)) || '';
   const deleteMessage =
      filtered.length === 1 ? `Delete chat with "${userName}"?` : `Delete ${filtered.length} selected chats?`;

   React.useEffect(() => {
      dispatch(setSearchText(text.trim()));
   }, [text]);

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
      dispatch(resetChatSelections());
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
            <IconButton onPress={toggleArchive}>
               <ArchiveIcon />
            </IconButton>
         </View>
      );
   };

   const hanldeLogout = async () => {
      setIsLoading(true);
      mirrorflyLogout({ navEnabled: true });
   };

   const hanldeRoute = () => {
      RootNavigation.navigate(SETTINGS_STACK, { screen: MENU_SCREEN });
   };

   const menuItems = [
      {
         label: 'Settings',
         formatter: hanldeRoute,
      },
      {
         label: 'Logout',
         formatter: hanldeLogout,
      },
   ];

   const renderSelectionHeader = React.useMemo(() => {
      return (
         Boolean(filtered.length) && (
            <View style={[styles.container, commonStyles.p_15]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <IconButton onPress={handleRemoveClose}>
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
      return !Boolean(filtered.length) && <ScreenHeader onChangeText={setText} menuItems={menuItems} />;
   }, [filtered.length]);

   return (
      <>
         {renderScreenHeader}
         {renderSelectionHeader}
         {isLoading && <LoadingModal />}
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
