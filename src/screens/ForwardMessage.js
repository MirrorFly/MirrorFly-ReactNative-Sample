import CheckBox from '@react-native-community/checkbox';
import { useNavigation, useRoute } from '@react-navigation/native';
import { debounce } from 'lodash-es';
import React from 'react';
import {
   ActivityIndicator,
   BackHandler,
   Modal,
   Platform,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import SDK from '../SDK/SDK';
import { fetchContactsFromSDK, resetChatPage } from '../SDK/utils';
import Avathar from '../common/Avathar';
import IconButton from '../common/IconButton';
import { BackArrowIcon, CloseIcon, SearchIcon, SendBlueIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import { useNetworkStatus } from '../common/hooks';
import ApplicationColors from '../config/appColors';
import {
   formatUserIdToJid,
   getCurrentChatUser,
   getMessageObjForward,
   getRecentChatMsgObjForward,
   getUserIdFromJid,
   showCheckYourInternetToast,
   showToast,
} from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, CHAT_TYPE_SINGLE, MIX_BARE_JID } from '../helpers/constants';
import { addChatMessageItem, clearChatMessageData, resetMessageSelections } from '../redux/chatMessageDataSlice';
import { addRecentChatItem } from '../redux/recentChatDataSlice';
import { useRecentChatData, useRoasterData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { CONVERSATION_SCREEN } from './constants';

const showMaxUsersLimitToast = () => {
   showToast('You can only forward upto 5 users or groups');
};

const Header = React.memo(({ onCancelPressed, onSearchPressed, onSearch, isSearching, searchText }) => {
   const handleSearchTextChange = value => {
      onSearch(value);
   };

   const handleClearSearch = () => {
      onSearch('');
   };

   return (
      <View style={styles.headerContainer}>
         {isSearching ? (
            <View style={styles.headerLeftSideContainer}>
               <IconButton style={styles.cancelIcon} onPress={onCancelPressed}>
                  <BackArrowIcon />
               </IconButton>
               <TextInput
                  value={searchText}
                  placeholder=" Search..."
                  autoFocus
                  onChangeText={handleSearchTextChange}
                  style={styles.searchInput}
               />
               {!!searchText && (
                  <IconButton style={styles.searchIcon} onPress={handleClearSearch}>
                     <CloseIcon />
                  </IconButton>
               )}
            </View>
         ) : (
            <View style={styles.headerLeftSideContainer}>
               <IconButton
                  style={styles.cancelIcon}
                  _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                  onPress={onCancelPressed}
                  borderRadius="full">
                  <CloseIcon />
               </IconButton>
               <Text style={styles.forwardToText}>Forward to...</Text>
            </View>
         )}
         <IconButton
            style={styles.searchIcon}
            _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
            onPress={onSearchPressed}
            borderRadius="full">
            <SearchIcon />
         </IconButton>
      </View>
   );
});

const ContactItem = ({
   name,
   userId,
   userJid,
   status,
   handleItemSelect,
   isSelected,
   isCheckboxAllowed,
   searchText,
}) => {
   const [isChecked, setIsChecked] = React.useState(false);
   let { nickName, status: profileStatus, image: imageToken, colorCode } = useRoasterData(userId);
   const recentChatData = useRecentChatData();
   // updating default values
   nickName = nickName || name || userId;
   colorCode = colorCode || '';
   profileStatus = profileStatus || status || '';

   React.useEffect(() => {
      if (isSelected !== isChecked) {
         setIsChecked(Boolean(isSelected));
      }
   }, []);
   const userType = recentChatData.find(r => getUserIdFromJid(r.userJid) === userId)?.userType || '';
   const handleChatItemSelect = () => {
      if (!isChecked && !isCheckboxAllowed) {
         showMaxUsersLimitToast();
         return;
      }

      if (!userType && MIX_BARE_JID.test(userJid)) {
         return showToast("You're no longer a participant in this group");
      }
      setIsChecked(val => !val);
      handleItemSelect(userId, {
         userId,
         name: nickName,
         colorCode,
         status: profileStatus,
         userJid,
      });
   };

   const renderCheckBox = React.useMemo(() => {
      return (
         <CheckBox
            onFillColor={ApplicationColors.mainColor}
            onCheckColor={ApplicationColors.mainColor}
            hideBox={true}
            animationDuration={0.1}
            onAnimationType={'stroke'}
            tintColors={{
               true: ApplicationColors.mainColor,
               false: ApplicationColors.mainColor,
            }}
            value={isChecked}
            disabled={true}
            style={styles.checkbox}
            onChange={Platform.OS !== 'ios' && handleChatItemSelect}
         />
      );
   }, [isChecked]);

   return (
      <>
         <Pressable onPress={handleChatItemSelect}>
            <View style={styles.recentChatListItems}>
               <View style={styles.recentChatItemAvatarName}>
                  <Avathar
                     type={MIX_BARE_JID.test(userJid) ? CHAT_TYPE_GROUP : CHAT_TYPE_SINGLE}
                     data={nickName || userId}
                     backgroundColor={colorCode}
                     profileImage={imageToken}
                  />
                  <View>
                     <View style={styles.recentChatItemName}>
                        <NickName
                           userId={userId}
                           data={nickName}
                           searchValue={searchText.trim()}
                           style={{
                              color: '#1f2937',
                              fontWeight: 'bold',
                              maxWidth: '90%',
                           }}
                        />
                     </View>
                     <Text style={styles.recentChatItemStatus} numberOfLines={1} ellipsizeMode="tail">
                        {profileStatus}
                     </Text>
                  </View>
               </View>
               <View style={commonStyles.r_5}>{renderCheckBox}</View>
            </View>
         </Pressable>
         {/* Divider Line */}
         <View style={styles.dividerLine} />
      </>
   );
};

const RecentChatSectionList = ({ data, handleChatSelect, selectedUsers, searchText }) => {
   return (
      <View style={styles.recentChatContiner}>
         {/* Header */}
         {data.length > 0 && (
            <View style={styles.recentChatHeader}>
               <Text style={styles.recentChatHeaderText}>Recent Chat</Text>
            </View>
         )}
         {/* List */}
         <View style={styles.recentChatList}>
            {data.map((item, index) => (
               <ContactItem
                  key={`${++index}_${item.fromUserId}`}
                  userId={item.fromUserId}
                  userJid={item.userJid}
                  name={item.profileDetails?.nickName}
                  status={item.profileDetails?.status}
                  handleItemSelect={handleChatSelect}
                  isSelected={selectedUsers[item.fromUserId]}
                  isCheckboxAllowed={Object.keys(selectedUsers).length <= 4} // allow max 5 contacts
                  searchText={searchText}
               />
            ))}
         </View>
      </View>
   );
};

const GroupChatSectionList = ({ data, handleChatSelect, selectedUsers, searchText }) => {
   return (
      <View style={styles.recentChatContiner}>
         {/* Header */}
         {data.length > 0 && (
            <View style={styles.recentChatHeader}>
               <Text style={styles.recentChatHeaderText}>Groups</Text>
            </View>
         )}
         {/* List */}
         <View style={styles.recentChatList}>
            {data.map((item, index) => (
               <ContactItem
                  key={`${++index}_${item.fromUserId}`}
                  userId={item.fromUserId}
                  userJid={item.userJid}
                  name={item.profileDetails?.nickName}
                  status={item.profileDetails?.status}
                  handleItemSelect={handleChatSelect}
                  isSelected={selectedUsers[item.fromUserId]}
                  isCheckboxAllowed={Object.keys(selectedUsers).length <= 4} // allow max 5 contacts
                  searchText={searchText}
               />
            ))}
         </View>
      </View>
   );
};

const ContactsSectionList = ({ data, handleChatSelect, selectedUsers, searchText, showLoadMoreLoader }) => {
   return (
      <View style={styles.recentChatContiner}>
         {/* Header */}
         {data.length > 0 && (
            <View style={styles.recentChatHeader}>
               <Text style={styles.recentChatHeaderText}>Contacts</Text>
            </View>
         )}
         {/* List */}
         <View style={styles.recentChatList}>
            {data.map((item, index) => (
               <ContactItem
                  key={`${++index}_${item.userId}`}
                  userId={item.userId}
                  userJid={item.userJid}
                  name={item.nickName}
                  status={item.status}
                  handleItemSelect={handleChatSelect}
                  isSelected={selectedUsers[item.userId]}
                  isCheckboxAllowed={Object.keys(selectedUsers).length <= 4} // allow max 5 contacts
                  searchText={searchText}
               />
            ))}
         </View>
         {showLoadMoreLoader ? (
            <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} style={styles.loadMoreLoader} />
         ) : (
            <View style={styles.loadMoreLoaderPlaceholder} />
         )}
      </View>
   );
};

const SelectedUsersName = ({ users, onMessageSend }) => {
   const userNames = React.useMemo(() => {
      if (Array.isArray(users) && users.length) {
         return users.map(u => u.name || u.userId).join(', ');
      } else {
         return 'No users selected';
      }
   }, [users]);

   return (
      <View style={styles.selectedUsersNameContainer} shadow={2}>
         <Text style={commonStyles.flex1}>{userNames}</Text>
         {users?.length > 0 && (
            <IconButton onPress={onMessageSend} pressedStyle={{ bg: 'rgba(50,118,226, 0.1)' }}>
               <SendBlueIcon width="45" height="45" />
            </IconButton>
         )}
      </View>
   );
};

const contactPaginationRefInitialValue = {
   nextPage: 1,
   hasNextPage: true,
};

// Main Component
const ForwardMessage = () => {
   const navigation = useNavigation();
   const [searchText, setSearchText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);
   const [selectedUsers, setSelectedUsers] = React.useState({});
   const [showLoader, setShowLoader] = React.useState(false);
   const [showLoadMoreLoader, setShowLoadMoreLoader] = React.useState(false);
   const [filteredRecentChatList, setFilteredRecentChatList] = React.useState([]);
   const [filteredGroupChatList, setFilteredGroupChatList] = React.useState([]);
   const [filteredContactList, setFilteredContactList] = React.useState([]);
   const recentChatData = useRecentChatData();

   const searchTextValueRef = React.useRef();

   const contactsPaginationRef = React.useRef({
      ...contactPaginationRefInitialValue,
   });

   const dispatch = useDispatch();

   const isInternetReachable = useNetworkStatus();

   const { params: { forwardMessages = [], onMessageForwaded = () => {} } = {} } = useRoute();

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, []);

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   const getLastThreeRecentChats = data => {
      if (Array.isArray(data) && data.length) {
         if (data.length > 3) {
            data.length = 3;
         }
         return data;
      } else {
         return [];
      }
   };

   const recentChatList = React.useMemo(() => {
      return getLastThreeRecentChats(recentChatData);
   }, []);

   const getGroupChats = data => {
      if (Array.isArray(data) && data.length) {
         data = data.filter(obj => obj.chatType === CHAT_TYPE_GROUP);
         data = data.filter(obj => !recentChatList.find(_obj => _obj.userJid === obj.userJid));
         return data;
      } else {
         return [];
      }
   };

   const groupChatList = React.useMemo(() => {
      // sorting the data based on dates and getting the first three items
      return getGroupChats(recentChatData);
   }, []);

   React.useLayoutEffect(() => {
      fetchContactListWithDebounce(searchText.trim());
      searchTextValueRef.current = searchText.trim();
   }, [searchText]);

   React.useEffect(() => {
      if (searchText) {
         // filtering the recent chat and updating the state
         const filteredData = recentChatList.filter(i =>
            i.profileDetails?.nickName?.toLowerCase?.()?.includes(searchText.trim().toLowerCase()),
         );
         setFilteredRecentChatList(filteredData);

         // filtering the groups and updating the state
         const gorupsFilteredData = groupChatList.filter(i =>
            i.profileDetails?.nickName?.toLowerCase?.()?.includes(searchText.trim().toLowerCase()),
         );
         setFilteredGroupChatList(gorupsFilteredData);
      } else {
         setFilteredRecentChatList(recentChatList);
         setFilteredGroupChatList(groupChatList);
      }
   }, [searchText]);

   const selectedUsersArray = React.useMemo(() => {
      return Object.values(selectedUsers || {});
   }, [selectedUsers]);

   const getUsersExceptRecentChatsUsers = _users => {
      const recentChatUsersObj = {};
      for (let _recentChat of recentChatList) {
         recentChatUsersObj[_recentChat.fromUserId] = true;
      }
      return _users.filter(u => !recentChatUsersObj[u.userId]);
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

   const fetchContactListFromSDK = async filter => {
      let { nextPage = 1, hasNextPage = true } = contactsPaginationRef.current || {};
      // fetching the data from API only when the actual filter value that triggered the function and the searchTextValueRef are equal
      // because this function will be called with debounce with a delay of 400 milliseconds to ignore API calls for every single character change immediately
      if (hasNextPage && filter === searchTextValueRef.current) {
         nextPage = filter ? 1 : nextPage;
         const { statusCode, users, totalPages } = await fetchContactsFromSDK(filter, nextPage, 23);
         if (statusCode === 200) {
            updateContactPaginationRefData(totalPages, filter);
            const filteredUsers = getUsersExceptRecentChatsUsers(users);
            setFilteredContactList(nextPage === 1 ? filteredUsers : val => [...val, ...filteredUsers]);
         } else {
            showToast('Could not get contacts from server');
         }
         setShowLoadMoreLoader(false);
      }
   };

   const fetchContactList = filter => {
      setShowLoadMoreLoader(true);
      setTimeout(() => {
         if (isInternetReachable) {
            fetchContactListFromSDK(filter);
         } else {
            showToast('Please check your internet connectivity');
            setShowLoadMoreLoader(false);
         }
      }, 0);
   };

   const handleCancel = () => {
      setSearchText('');
      isSearching ? setIsSearching(false) : navigation.goBack();
   };

   const toggleSearching = () => {
      setSearchText('');
      setIsSearching(val => !val);
   };

   const handleUserSelect = (userId, data) => {
      if (Object.keys(selectedUsers).length <= 5) {
         setSelectedUsers(_data => {
            if (_data[userId]) {
               delete _data[userId];
            } else {
               _data[userId] = data;
            }
            return { ..._data };
         });
      } else {
         showMaxUsersLimitToast();
      }
   };

   const forwardMessagesToSelectedUsers = async () => {
      const newMsgIds = [];
      const totalLength = forwardMessages.length * Object.keys(selectedUsers).length;
      forwardMessages.sort((a, b) => {
         if (a.timestamp > b.timestamp) {
            return 1;
         } else if (a.timestamp < b.timestamp) {
            return -1;
         } else {
            return 0;
         }
      });
      for (let i = 0; i < totalLength; i++) {
         newMsgIds.push(SDK.randomString(8, 'BA'));
      }
      const newMsgIdsCopy = [...newMsgIds];
      for (let i = 0; i < forwardMessages.length; i++) {
         const msg = forwardMessages[i];
         for (const userId in selectedUsers) {
            dispatch(resetMessageSelections(getUserIdFromJid(getCurrentChatUser())));
            let toUserJid = selectedUsers[userId]?.userJid || formatUserIdToJid(userId);
            const currentNewMsgId = newMsgIdsCopy.shift();
            const recentChatObj = await getRecentChatMsgObjForward(msg, toUserJid, currentNewMsgId);
            recentChatObj.userJid = toUserJid;
            // updating recent chat for last message only
            if (i === forwardMessages.length - 1) {
               dispatch(addRecentChatItem(recentChatObj));
            }
            // updating convresations if active chat or delete conversations data
            if (toUserJid === getCurrentChatUser()) {
               const conversationChatObj = getMessageObjForward(msg, toUserJid, currentNewMsgId);
               conversationChatObj.userJid = toUserJid;
               // adding conversation history
               dispatch(addChatMessageItem(conversationChatObj));
            } else {
               // deleting conversation history data if available to avoid unwanted UI issue or complexity
               dispatch(clearChatMessageData(userId));
               resetChatPage(userId);
            }
         }
      }
      // Sending params to SDK to forward message
      const contactsToForward = Object.values(selectedUsers).map(u => formatUserIdToJid(u?.userJid || u?.userId));
      const msgIds = forwardMessages.map(m => m.msgId);
      await SDK.forwardMessagesToMultipleUsers(contactsToForward, msgIds, true, newMsgIds);
      // navigating the user after setTimeout to finish all the running things in background to avoid unwanted issues
      setTimeout(() => {
         setShowLoader(false);
         onMessageForwaded?.();
         if (Object.values(selectedUsers).length === 1) {
            navigation.navigate(CONVERSATION_SCREEN, { jid: Object.values(selectedUsers)[0]?.userJid });
         } else {
            navigation.goBack();
         }
      }, 0);
   };

   const handleMessageSend = async () => {
      if (!isInternetReachable) {
         showCheckYourInternetToast();
         return;
      }
      setShowLoader(true);
      // doing the complete action in setTimeout to avoid UI render blocking
      setTimeout(forwardMessagesToSelectedUsers, 0);
   };

   const doNothing = () => null;

   const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
      const paddingToBottom = 30;
      return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
   };

   const fetchContactListWithDebounce = debounce(_searchText => {
      fetchContactList(_searchText);
   }, 400);

   const handleScroll = ({ nativeEvent }) => {
      if (isCloseToBottom(nativeEvent)) {
         fetchContactListWithDebounce(searchText.trim());
      }
   };

   const renderHeader = React.useMemo(() => {
      return (
         <Header
            onCancelPressed={handleCancel}
            onSearchPressed={toggleSearching}
            onSearch={setSearchText}
            isSearching={isSearching}
            searchText={searchText}
         />
      );
   }, [isSearching, searchText]);

   const renderRecentChat = React.useMemo(() => {
      return (
         <RecentChatSectionList
            data={filteredRecentChatList}
            selectedUsers={selectedUsers}
            handleChatSelect={handleUserSelect}
            searchText={searchText}
         />
      );
   }, [filteredRecentChatList, selectedUsers]);

   const renderGroupChat = React.useMemo(() => {
      return (
         <GroupChatSectionList
            data={filteredGroupChatList}
            selectedUsers={selectedUsers}
            handleChatSelect={handleUserSelect}
            searchText={searchText}
         />
      );
   }, [filteredRecentChatList, selectedUsers]);

   const renderContactList = React.useMemo(() => {
      return (
         <ContactsSectionList
            data={filteredContactList}
            selectedUsers={selectedUsers}
            handleChatSelect={handleUserSelect}
            searchText={searchText}
            showLoadMoreLoader={showLoadMoreLoader}
         />
      );
   }, [filteredContactList, selectedUsers, showLoadMoreLoader]);

   return (
      <>
         <View style={styles.container}>
            {renderHeader}
            {Boolean(searchText) &&
               !filteredRecentChatList.length &&
               !filteredContactList.length &&
               !filteredGroupChatList.length && (
                  <View
                     style={[
                        commonStyles.alignItemsCenter,
                        commonStyles.justifyContentCenter,
                        commonStyles.width_100_per,
                        commonStyles.height_100_per,
                        commonStyles.bg_white,
                     ]}>
                     <Text style={styles.noMsg}>No Result Found</Text>
                  </View>
               )}
            <ScrollView style={commonStyles.flex1} onScroll={handleScroll} scrollEventThrottle={150}>
               {renderRecentChat}
               {renderGroupChat}
               {renderContactList}
            </ScrollView>
            <SelectedUsersName users={selectedUsersArray} onMessageSend={handleMessageSend} />
         </View>
         {/* Modal for Loader */}
         <Modal visible={showLoader} animationType="fade" onRequestClose={doNothing} transparent>
            <View style={styles.loaderContainer}>
               <View style={styles.loaderWrapper}>
                  <ActivityIndicator color={'#3c3c3c'} size={'large'} style={styles.loader} />
                  <Text style={styles.loaderText}>Sending</Text>
               </View>
            </View>
         </Modal>
      </>
   );
};
export default ForwardMessage;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'space-between',
   },
   headerContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 65,
      backgroundColor: '#e8e8e8',
   },
   cancelIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 45,
      height: 45,
   },
   headerLeftSideContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   forwardToText: {
      color: '#202020',
      fontSize: 20,
      fontWeight: 'bold',
   },
   searchInput: {
      height: 50,
      padding: 5,
      paddingLeft: 10,
      flex: 1,
   },
   searchIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 50,
      height: 50,
   },
   // recent chat section styles
   recentChatContiner: {
      width: '100%',
      marginTop: 2,
   },
   recentChatHeader: {
      backgroundColor: '#d7d7d7',
      height: 40,
      paddingHorizontal: 15,
      justifyContent: 'center',
   },
   recentChatHeaderText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2d2d2d',
   },
   recentChatList: {
      marginTop: 8,
   },
   recentChatListItems: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 13,
   },
   recentChatItemAvatarName: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
   },
   recentChatItemName: {
      fontSize: 16,
      color: '#424242',
      fontWeight: 'bold',
      marginLeft: 15,
   },
   recentChatItemStatus: {
      fontSize: 12,
      color: '#969696',
      marginLeft: 15,
      width: 250,
   },
   dividerLine: {
      marginLeft: 73,
      borderBottomWidth: 1,
      borderBottomColor: '#e3e3e3',
   },
   selectedUsersNameContainer: {
      width: '97%',
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 3,
      marginBottom: 5,
      minHeight: 50,
      backgroundColor: 'white',
      paddingHorizontal: 5,
      paddingVertical: 5,
      borderRadius: 3,
   },
   // Loader styles
   loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
   },
   loaderWrapper: {
      width: 260,
      height: 140,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 10,
   },
   loader: {
      marginBottom: 10,
   },
   loaderText: {
      fontSize: 18,
      color: 'black',
   },
   loadMoreLoader: {
      marginVertical: 15,
   },
   loadMoreLoaderPlaceholder: {
      height: 60,
      width: '100%',
   },
   noMsg: {
      color: '#181818',
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 8,
   },
   checkbox: {
      borderWidth: 2,
      borderRadius: 5,
      borderColor: '#3276E2',
      width: 20,
      height: 20,
   },
});
