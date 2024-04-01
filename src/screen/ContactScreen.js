import { useRoute } from '@react-navigation/native';
import React from 'react';
import {
   ActivityIndicator,
   BackHandler,
   Image,
   KeyboardAvoidingView,
   Platform,
   StyleSheet,
   Text,
   View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchGroupParticipants } from '../Helper/Chat/Groups';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { fetchContactsFromSDK, showToast } from '../Helper/index';
import * as RootNav from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import no_contacts from '../assets/no_contacts.png';
import Modal, { ModalCenteredContent } from '../common/Modal';
import commonStyles from '../common/commonStyles';
import { getImageSource } from '../common/utils';
import FlatListView from '../components/FlatListView';
import ScreenHeader from '../components/ScreenHeader';
import config from '../components/chat/common/config';
import ApplicationColors from '../config/appColors';
import { CHATSCREEN, GROUP_INFO, NEW_GROUP, RECENTCHATSCREEN } from '../constant';
import { useNetworkStatus } from '../hooks';
import { getUserName } from '../hooks/useRosterData';
import { navigate } from '../redux/Actions/NavigationAction';

const contactPaginationRefInitialValue = {
   nextPage: 1,
   hasNextPage: true,
};

function ContactScreen() {
   const dispatch = useDispatch();
   let {
      params: {
         prevScreen = '',
         grpDetails: { jid = '', grpName = '', profileImage = '', participants = [] } = {},
      } = {},
   } = useRoute();
   grpName = getUserName(getUserIdFromJid(jid)) || grpName;
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

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   const contactsPaginationRef = React.useRef({
      ...contactPaginationRefInitialValue,
   });
   const searchTextValueRef = React.useRef('');

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [isNewGrpSrn, isGroupInfoSrn]);

   React.useEffect(() => {
      if (isNetworkconneted) {
         fetchContactList(searchText);
      }
   }, [isNetworkconneted]);

   const handleBackBtn = () => {
      if (isNewGrpSrn || isGroupInfoSrn) {
         RootNav.goBack();
         return true;
      }
      let x = { screen: RECENTCHATSCREEN };
      dispatch(navigate(x));
      RootNav.navigate(RECENTCHATSCREEN);
      return true;
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

   const getUsersExceptRecentChatsUsers = _users => {
      const participantsObj = {};
      for (let _participant of participants) {
         participantsObj[_participant.userId] = true;
      }
      return _users.filter(u => !participantsObj[u.userId]);
   };

   const fetchContactListFromSDK = async _searchText => {
      let { nextPage = 1, hasNextPage = true } = contactsPaginationRef.current || {};
      if (hasNextPage && _searchText === searchTextValueRef.current) {
         nextPage = _searchText ? 1 : nextPage;
         if (nextPage > 1) {
            setFooterLoader(true);
         } else {
            setIsFetching(true);
         }
         const { statusCode, users, totalPages } = await fetchContactsFromSDK(_searchText, nextPage, 23);
         if (statusCode === 200) {
            const filteredUsers = getUsersExceptRecentChatsUsers(users);
            updateContactPaginationRefData(totalPages, _searchText);
            if (nextPage === 1) {
               setContactList(filteredUsers);
            } else {
               const arr = [...contactList, ...filteredUsers];
               setContactList(arr);
            }
         } else if (isNetworkconneted && statusCode !== 200) {
            const toastOptions = {
               id: 'contact-server-error',
            };
            showToast('Could not get contacts from server', toastOptions);
         }
         setIsFetching(false);
         setFooterLoader(false);
      }
   };

   const fetchContactList = text => {
      setTimeout(() => {
         const _searchText = text?.trim?.();
         searchTextValueRef.current = _searchText;
         if (isNetworkconneted) {
            fetchContactListFromSDK(_searchText);
         }
      }, 0);
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
         dispatch(
            navigate({
               screen: CHATSCREEN,
               fromUserJID: item.userJid,
               profileDetails: item,
            }),
         );
         RootNav.navigate(CHATSCREEN);
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
         return showToast('Please check your internet connection', {
            id: 'internet-connection-toast',
         });
      }
      if (Object.keys(selectedUsers).length < config.minAllowdGroupMembers && isNewGrpSrn) {
         return showToast('Add at least two Contacts', { id: 'Add_at_least_two_Contacts' });
      }
      if (Object.keys(selectedUsers).length > config.maxAllowdGroupMembers && isNewGrpSrn) {
         return showToast('Maximum allowed group members ' + config.maxAllowdGroupMembers, {
            id: 'Maximum_allowed_group_members',
         });
      }
      if (isGroupInfoSrn && !Object.keys(selectedUsers).length) {
         return showToast('Select any contacts', { id: 'select_any_contacts' });
      }
      if (isNetworkconneted) {
         toggleModel();
         try {
            if (isGroupInfoSrn) {
               const { statusCode, message } = await SDK.addParticipants(jid, grpName, Object.keys(selectedUsers));
               if (statusCode === 200) {
                  fetchGroupParticipants(jid);
                  RootNav.goBack();
                  return true;
               } else {
                  showToast(message, { id: 'ADD_PARTICIPANTS_ERROR' });
               }
            }
         } catch (error) {
            showToast('Failed to add participants', { id: 'ADD_PARTICIPANTS_CATCH_ERROR' });
         }
         try {
            const { statusCode, message } = await SDK.createGroup(grpName, Object.keys(selectedUsers), profileImage);
            if (statusCode === 200) {
               showToast('Group created successfully', { id: 'Group_created_successfully' });
               RootNav.reset(RECENTCHATSCREEN);
               return true;
            } else {
               showToast(message, { id: 'CREATE_GROUP_ERROR' });
            }
         } catch (error) {
            showToast('Failed to create group', { id: 'CREATE_GROUP_CATCH_ERROR' });
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
         />
      );
   };

   return (
      <KeyboardAvoidingView style={commonStyles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <ScreenHeader
            title={isNewGrpSrn || isGroupInfoSrn ? 'Add Participants' : 'Contacts'}
            onhandleBack={handleBackBtn}
            menuItems={[]}
            onhandleSearch={handleSearch}
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
