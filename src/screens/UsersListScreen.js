import { useNavigation, useRoute } from '@react-navigation/native';
import { debounce } from 'lodash-es';
import React from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import RootNavigation from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import { fetchContactsFromSDK, fetchGroupParticipants } from '../SDK/utils';
import no_contacts from '../assets/no_contacts.png';
import AlertModal from '../common/AlertModal';
import Modal, { ModalCenteredContent } from '../common/Modal';
import ScreenHeader from '../common/ScreenHeader';
import Text from '../common/Text';
import { useNetworkStatus } from '../common/hooks';
import FlatListView from '../components/FlatListView';
import config from '../config/config';
import { getImageSource, getUserIdFromJid, handleUpdateBlockUser, showToast } from '../helpers/chatHelpers';
import { getStringSet, replacePlaceholders } from '../localization/stringSet';
import { getBlockedStatus, getUserNameFromStore, useRecentChatData, useThemeColorPalatte } from '../redux/reduxHook';
import { setRoasterData } from '../redux/rosterDataSlice';
import commonStyles from '../styles/commonStyles';
import { CONVERSATION_SCREEN, CONVERSATION_STACK, GROUP_INFO, NEW_GROUP } from './constants';

const contactPaginationRefInitialValue = {
   nextPage: 1,
   hasNextPage: true,
};

function ContactScreen() {
   const stringSet = getStringSet();
   let {
      params: {
         prevScreen = '',
         grpDetails: { jid = '', grpName = '', profileImage = '', participants = [] } = {},
      } = {},
   } = useRoute();
   const navigation = useNavigation();
   const themeColorPalatte = useThemeColorPalatte();
   const dispatch = useDispatch();
   grpName = getUserNameFromStore(getUserIdFromJid(jid)) || grpName;
   const recentChatList = useRecentChatData();
   const isNewGrpSrn = prevScreen === NEW_GROUP;
   const isGroupInfoSrn = prevScreen === GROUP_INFO;
   const isNetworkconneted = useNetworkStatus();
   const [isFetching, setIsFetching] = React.useState(true);
   const [footerLoader, setFooterLoader] = React.useState(false);
   const [searchText, setSearchText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);
   const [contactList, setContactList] = React.useState([]);
   const [selectedUsers, setSelectedUsers] = React.useState({});
   const [modelOpen, setModelOpen] = React.useState(false);
   const [modalContent, setModalContent] = React.useState(null);

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   const contactsPaginationRef = React.useRef({
      ...contactPaginationRefInitialValue,
   });
   const searchTextValueRef = React.useRef('');

   React.useEffect(() => {
      if (isNetworkconneted) {
         fetchContactList(searchText);
      }
   }, [isNetworkconneted]);

   const handleBackBtn = () => {
      navigation.goBack();
   };

   const updateContactPaginationRefData = (totalPages, filter) => {
      if (filter) {
         contactsPaginationRef.current = { ...contactPaginationRefInitialValue };
         return;
      }
      if (!contactsPaginationRef.current) {
         contactsPaginationRef.current = {};
      }
      if (contactsPaginationRef.current.nextPage < totalPages) {
         contactsPaginationRef.current.nextPage++;
      } else {
         contactsPaginationRef.current.hasNextPage = false;
      }
   };

   // Define the filtering functions
   const filterOutRecentChatUsers = users => {
      if (isGroupInfoSrn || isNewGrpSrn) {
         return users;
      }
      const recentChatUsersObj = {};
      for (let _recentChat of recentChatList) {
         recentChatUsersObj[_recentChat.fromUserId] = true;
      }
      return users.filter(user => !recentChatUsersObj[user.userId]);
   };

   const filterOutParticipants = (users, participants) => {
      const participantsObj = {};
      for (let participant of participants) {
         participantsObj[participant.userId] = true;
      }
      return users.filter(user => !participantsObj[user.userId]);
   };

   const filters = [
      { fn: filterOutParticipants, data: participants },
      // Add more filters here if needed
   ];

   // Main method to apply all filters
   const getUsersWithFilters = (_users, filters) => {
      return filters.reduce((filteredUsers, filter) => {
         return filter.fn(filteredUsers, filter.data);
      }, _users);
   };

   const fetchContactListFromSDK = async filter => {
      let { nextPage = 1, hasNextPage = true } = contactsPaginationRef.current || {};
      if (hasNextPage && filter === searchTextValueRef.current) {
         nextPage = filter ? 1 : nextPage;
         if (nextPage > 1) {
            setFooterLoader(true);
         } else {
            setIsFetching(true);
         }
         const { statusCode, users, totalPages } = await fetchContactsFromSDK(filter, nextPage, 23);
         if (statusCode === 200) {
            updateContactPaginationRefData(totalPages, filter);
            const filteredUsers = getUsersWithFilters(users, filters);
            if (nextPage === 1) {
               setContactList(filteredUsers);
            } else {
               setContactList(prevContactList => {
                  const newUsers = filteredUsers.filter(
                     newUser => !prevContactList.some(existingUser => existingUser.userJid === newUser.userJid),
                  );
                  const updatedList = [...prevContactList, ...newUsers];
                  return updatedList;
               });
            }
         } else {
            showToast(stringSet.CONTACT_SCREEN.COULD_NOT_GET_CONTACTS);
         }
         setIsFetching(false);
         setFooterLoader(false);
      }
   };

   const fetchContactListFromSDKWithDebounce = React.useRef(debounce(fetchContactListFromSDK, 700)).current;

   const fetchContactList = text => {
      const _searchText = text?.trim?.();
      searchTextValueRef.current = _searchText;
      if (isNetworkconneted) {
         fetchContactListFromSDKWithDebounce(_searchText);
      }
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const hadleBlockUser = (userId, userJid) => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: `Unblock ${getUserNameFromStore(userId)}`,
         noButton: 'CANCEL',
         yesButton: 'UNBLOCK',
         yesAction: handleUpdateBlockUser(userId, 0, userJid),
      });
   };

   const handlePress = item => {
      const _item = { ...item, isBlocked: getBlockedStatus(getUserIdFromJid(item.userJid)) };
      console.log('_item ==>', JSON.stringify(_item, null, 2));
      if (isNewGrpSrn || isGroupInfoSrn) {
         if (getBlockedStatus(getUserIdFromJid(_item.userJid))) {
            hadleBlockUser(getUserIdFromJid(_item.userJid), _item.userJid);
            return;
         }
         setSelectedUsers(_data => {
            if (_data[_item.userJid]) {
               delete _data[_item.userJid];
            } else {
               _data[_item.userJid] = item;
            }
            return { ..._data };
         });
      } else {
         dispatch(setRoasterData(_item));
         navigation.navigate(CONVERSATION_STACK, { screen: CONVERSATION_SCREEN, params: { jid: _item.userJid } });
      }
   };

   const handleSearch = async text => {
      if (isNetworkconneted) {
         setIsSearching(true);
         setSearchText(text);
         fetchContactList(text);
      }
   };

   const handlePagination = () => {
      fetchContactList(searchText);
   };

   const handleClear = async () => {
      setSearchText('');
      setIsSearching(false);
      fetchContactList('');
   };

   const handleGrpPartcipant = async () => {
      if (!isNetworkconneted) {
         return showToast(stringSet.COMMON_TEXT.NO_INTERNET_CONNECTION);
      }
      if (Object.keys(selectedUsers).length < config.minAllowdGroupMembers && isNewGrpSrn) {
         return showToast(stringSet.TOAST_MESSAGES.TOAST_SELECT_TWO_CONTACT);
      }
      if (Object.keys(selectedUsers).length > config.maxAllowdGroupMembers && isNewGrpSrn) {
         return showToast(
            replacePlaceholders(stringSet.INFO_SCREEN.MAXIMUM_ALLOWED_GROUP_MEMBERS, {
               maxAllowdGroupMembers: config.maxAllowdGroupMembers,
            }),
         );
      }
      if (isGroupInfoSrn && !Object.keys(selectedUsers).length) {
         return showToast(stringSet.TOAST_MESSAGES.TOAST_SELECT_ANY_CONTACTS);
      }
      if (isNetworkconneted) {
         toggleModel();
         if (isGroupInfoSrn) {
            try {
               const { statusCode, message } = await SDK.addParticipants(jid, grpName, Object.keys(selectedUsers));
               if (statusCode === 200) {
                  fetchGroupParticipants(jid);
                  navigation.goBack();
               } else {
                  showToast(message);
               }
            } catch (error) {
               showToast(stringSet.TOAST_MESSAGES.FAILED_TO_ADD_PARTICIPANTS);
            }
         } else {
            try {
               const { statusCode, message } = await SDK.createGroup(grpName, Object.keys(selectedUsers), profileImage);
               if (statusCode === 200) {
                  showToast(stringSet.TOAST_MESSAGES.TOAST_GROUP_CREATED_SUCCESSFULLY);
                  RootNavigation.popToTop();
               } else {
                  showToast(message);
               }
            } catch (error) {
               showToast(stringSet.TOAST_MESSAGES.FAILED_TO_CREATE_GROUP);
            }
         }
         toggleModel();
      }
   };

   const renderContactList = () => {
      if (!isNetworkconneted) {
         return (
            <View style={commonStyles.flex1_centeredContent}>
               <Text style={[styles.noMsg, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                  {stringSet.COMMON_TEXT.NO_INTERNET_CONNECTION}
               </Text>
            </View>
         );
      }
      if (!isFetching && contactList?.length === 0) {
         return isSearching ? (
            <View style={commonStyles.flex1_centeredContent}>
               <Text style={[styles.noMsg, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                  {stringSet.CONTACT_SCREEN.NO_CONTACTS_FOUND}
               </Text>
            </View>
         ) : (
            <View style={commonStyles.flex1_centeredContent}>
               <Image style={styles.image} resizeMode="cover" source={getImageSource(no_contacts)} />
               <Text style={[styles.noMsg, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                  {stringSet.CONTACT_SCREEN.NO_CONTACTS_FOUND}
               </Text>
            </View>
         );
      }

      return (
         <FlatListView
            onhandlePagination={handlePagination}
            onhandlePress={item => handlePress(item)}
            selectedUsers={selectedUsers}
            isLoading={isFetching}
            footerLoader={footerLoader}
            data={contactList}
            searchText={searchText}
            themeColorPalatte={themeColorPalatte}
         />
      );
   };

   return (
      <KeyboardAvoidingView
         style={[commonStyles.flex1, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <ScreenHeader
            onChangeText={handleSearch}
            title={
               isNewGrpSrn || isGroupInfoSrn
                  ? stringSet.CONTACT_SCREEN.ADD_PARTICIPANTS_LABEL
                  : stringSet.CONTACT_SCREEN.CONTACT_HEADER_LABEL
            }
            onhandleBack={handleBackBtn}
            menuItems={[]}
            handleClear={handleClear}
            onCreateBtn={handleGrpPartcipant}
            isGroupInfoSrn={isGroupInfoSrn}
         />
         {renderContactList()}
         <Modal visible={modelOpen} onRequestClose={toggleModel}>
            <ModalCenteredContent onPressOutside={toggleModel}>
               <View
                  style={[
                     commonStyles.bg_white,
                     commonStyles.borderRadius_5,
                     commonStyles.justifyContentCenter,
                     commonStyles.alignItemsCenter,
                  ]}>
                  <ActivityIndicator size={'large'} color={themeColorPalatte.primaryColor} />
               </View>
            </ModalCenteredContent>
         </Modal>
         {modalContent && <AlertModal {...modalContent} />}
      </KeyboardAvoidingView>
   );
}

export default ContactScreen;

const styles = StyleSheet.create({
   imageView: {
      flex: 0.72,
      alignItems: 'center',
      justifyContent: 'center',
   },
   image: {
      width: 200,
      height: 200,
      marginTop: -100, // margin negative half the height to make it center
   },
   noMsg: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 8,
   },
});
