import { useNavigation, useRoute } from '@react-navigation/native';
import { debounce } from 'lodash-es';
import React from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import { fetchContactsFromSDK, fetchGroupParticipants } from '../SDK/utils';
import no_contacts from '../assets/no_contacts.png';
import Modal, { ModalCenteredContent } from '../common/Modal';
import ScreenHeader from '../common/ScreenHeader';
import { useNetworkStatus } from '../common/hooks';
import FlatListView from '../components/FlatListView';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import { getImageSource, getUserIdFromJid, showToast } from '../helpers/chatHelpers';
import { CONVERSATION_SCREEN, CONVERSATION_STACK } from '../helpers/constants';
import { getUserNameFromStore, useRecentChatData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { GROUP_INFO, NEW_GROUP } from './constants';

const contactPaginationRefInitialValue = {
   nextPage: 1,
   hasNextPage: true,
};

function ContactScreen() {
   let {
      params: {
         prevScreen = '',
         grpDetails: { jid = '', grpName = '', profileImage = '', participants = [] } = {},
      } = {},
   } = useRoute();
   const navigation = useNavigation();
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

   const filters = [
      { fn: filterOutRecentChatUsers, data: recentChatList },
      { fn: filterOutParticipants, data: participants },
      // Add more filters here if needed
   ];

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
   const filterOutRecentChatUsers = (users, recentChatList) => {
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
            showToast('Could not get contacts from server');
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

   const handlePress = item => {
      if (isNewGrpSrn || isGroupInfoSrn) {
         setSelectedUsers(_data => {
            if (_data[item.userJid]) {
               delete _data[item.userJid];
            } else {
               _data[item.userJid] = item;
            }
            return { ..._data };
         });
      } else {
         navigation.navigate(CONVERSATION_STACK, { screen: CONVERSATION_SCREEN, params: { jid: item.userJid } });
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
         return showToast('Please check your internet connection');
      }
      if (Object.keys(selectedUsers).length < config.minAllowdGroupMembers && isNewGrpSrn) {
         return showToast('Add at least two Contacts');
      }
      if (Object.keys(selectedUsers).length > config.maxAllowdGroupMembers && isNewGrpSrn) {
         return showToast('Maximum allowed group members ' + config.maxAllowdGroupMembers);
      }
      if (isGroupInfoSrn && !Object.keys(selectedUsers).length) {
         return showToast('Select any contacts');
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
               showToast('Failed to add participants');
            }
         } else {
            try {
               const { statusCode, message } = await SDK.createGroup(grpName, Object.keys(selectedUsers), profileImage);
               if (statusCode === 200) {
                  showToast('Group created successfully');
                  RootNavigation.popToTop();
               } else {
                  showToast(message);
               }
            } catch (error) {
               showToast('Failed to create group');
            }
         }
         toggleModel();
      }
   };

   const renderContactList = () => {
      if (!isNetworkconneted) {
         return (
            <View style={commonStyles.flex1_centeredContent}>
               <Text style={styles.noMsg}>Please check internet connectivity</Text>
            </View>
         );
      }
      if (!isFetching && contactList?.length === 0) {
         return isSearching ? (
            <View style={commonStyles.flex1_centeredContent}>
               <Text style={styles.noMsg}>No contacts found</Text>
            </View>
         ) : (
            <View style={commonStyles.flex1_centeredContent}>
               <Image style={styles.image} resizeMode="cover" source={getImageSource(no_contacts)} />
               <Text style={styles.noMsg}>No contacts found</Text>
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
         />
      );
   };

   return (
      <KeyboardAvoidingView
         style={[commonStyles.flex1, commonStyles.bg_white]}
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <ScreenHeader
            onChangeText={handleSearch}
            title={isNewGrpSrn || isGroupInfoSrn ? 'Add Participants' : 'Contacts'}
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
                  <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} />
               </View>
            </ModalCenteredContent>
         </Modal>
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
      color: '#181818',
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 8,
   },
});
