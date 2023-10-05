import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Center,
  Checkbox,
  Icon,
  IconButton,
  View as NBView,
} from 'native-base';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { CHATSCREEN, CONVERSATION_SCREEN } from '../../src/constant';
import {
  formatUserIdToJid,
  getMessageObjForward,
  getRecentChatMsgObjForward,
  isSingleChat,
} from '../Helper/Chat/ChatHelper';
import { sortBydate } from '../Helper/Chat/RecentChat';
import { debounce, fetchContactsFromSDK, showToast } from '../Helper/index';
import SDK from '../SDK/SDK';
import Avathar from '../common/Avathar';
import {
  BackArrowIcon,
  CloseIcon,
  SearchIcon,
  SendBlueIcon,
} from '../common/Icons';
import commonStyles from '../common/commonStyles';
import { HighlightedText } from '../components/RecentChat';
import ApplicationColors from '../config/appColors';
import { useNetworkStatus } from '../hooks';
import useRosterData from '../hooks/useRosterData';
import {
  addChatConversationHistory,
  deleteChatConversationById,
} from '../redux/Actions/ConversationAction';
import { navigate } from '../redux/Actions/NavigationAction';
import { updateRecentChat } from '../redux/Actions/RecentChatAction';

const showMaxUsersLimitToast = () => {
  const options = {
    id: 'forward-message-user-limit',
  };
  showToast('You can only forward upto 5 users or groups', options);
};

const Header = React.memo(
  ({ onCancelPressed, onSearchPressed, onSearch, isSearching, searchText }) => {
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
            <IconButton
              style={styles.cancelIcon}
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              onPress={onCancelPressed}
              borderRadius="full">
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
              <IconButton
                style={styles.searchIcon}
                _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                onPress={handleClearSearch}
                borderRadius="full">
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
  },
);

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
  let {
    nickName,
    status: profileStatus,
    image: imageToken,
    colorCode,
  } = useRosterData(userId);
  // updating default values
  nickName = nickName || name || userId;
  colorCode = colorCode || '';
  profileStatus = profileStatus || status || '';

  React.useEffect(() => {
    if (isSelected !== isChecked) {
      setIsChecked(Boolean(isSelected));
    }
  }, []);

  const handleChatItemSelect = () => {
    if (!isChecked && !isCheckboxAllowed) {
      showMaxUsersLimitToast();
      return;
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

  return (
    <>
      <Pressable onPress={handleChatItemSelect}>
        <View style={styles.recentChatListItems}>
          <View style={styles.recentChatItemAvatarName}>
            <Avathar
              data={nickName || userId}
              backgroundColor={colorCode}
              profileImage={imageToken}
            />
            <View>
              <View style={styles.recentChatItemName}>
                <HighlightedText
                  text={nickName || userId}
                  searchValue={searchText?.trim()}
                  index={userId}
                />
              </View>
              <Text
                style={styles.recentChatItemStatus}
                numberOfLines={1}
                ellipsizeMode="tail">
                {profileStatus}
              </Text>
            </View>
          </View>
          <Checkbox
            aria-label="Select Recent Chat User"
            isChecked={isChecked}
            isDisabled={!isChecked && !isCheckboxAllowed}
            style={styles.checkbox}
            onChange={handleChatItemSelect}
            _checked={{
              backgroundColor: ApplicationColors.mainColor,
              borderColor: ApplicationColors.mainColor,
            }}
            _pressed={{
              backgroundColor: ApplicationColors.mainColor,
              borderColor: ApplicationColors.mainColor,
            }}
          />
        </View>
      </Pressable>
      {/* Divider Line */}
      <View style={styles.dividerLine} />
    </>
  );
};

const RecentChatSectionList = ({
  data,
  handleChatSelect,
  selectedUsers,
  searchText,
}) => {
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

const ContactsSectionList = ({
  data,
  handleChatSelect,
  selectedUsers,
  searchText,
  showLoadMoreLoader,
}) => {
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
        <ActivityIndicator size={'large'} style={styles.loadMoreLoader} />
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
    <NBView style={styles.selectedUsersNameContainer} shadow={2}>
      <Text style={commonStyles.flex1}>{userNames}</Text>
      {users?.length > 0 && (
        <IconButton
          style={styles.sendButton}
          onPress={onMessageSend}
          _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
          icon={
            <Icon as={<SendBlueIcon color="#fff" />} name="forward-message" />
          }
          borderRadius="full"
        />
      )}
    </NBView>
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
  const [filteredRecentChatList, setFilteredRecentChatList] = React.useState(
    [],
  );
  const [filteredContactList, setFilteredContactList] = React.useState([]);
  const recentChatData = useSelector(state => state.recentChatData.data);
  const activeChatUserJid = useSelector(state => state.navigation.fromUserJid);

  const searchTextValueRef = React.useRef();

  const contactsPaginationRef = React.useRef({
    ...contactPaginationRefInitialValue,
  });

  const dispatch = useDispatch();

  const isInternetReachable = useNetworkStatus();

  const {
    params: { forwardMessages, onMessageForwaded },
  } = useRoute();

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
    // sorting the data based on dates and getting the first three items
    const sortedList = sortBydate([...recentChatData]).filter(Boolean);
    return getLastThreeRecentChats(sortedList);
  }, []);

  React.useLayoutEffect(() => {
    fetchContactListWithDebounce(searchText.trim());
    searchTextValueRef.current = searchText;
  }, [searchText]);

  React.useEffect(() => {
    if (searchText) {
      // filtering the recent chat and updating the state
      const filteredData = recentChatList.filter(i =>
        i.profileDetails?.nickName
          ?.toLowerCase?.()
          ?.includes(searchText.trim().toLowerCase()),
      );
      setFilteredRecentChatList(filteredData);
    } else {
      setFilteredRecentChatList(recentChatList);
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
    let { nextPage = 1, hasNextPage = true } =
      contactsPaginationRef.current || {};
    // fetching the data from API only when the actual filter value that triggered the function and the searchTextValueRef are equal
    // because this function will be called with debounce with a delay of 400 milliseconds to ignore API calls for every single character change immediately
    if (hasNextPage && filter === searchTextValueRef.current) {
      nextPage = filter ? 1 : nextPage;
      const { statusCode, users, totalPages } = await fetchContactsFromSDK(
        filter,
        nextPage,
        23,
      );
      if (statusCode === 200) {
        updateContactPaginationRefData(totalPages, filter);
        const filteredUsers = getUsersExceptRecentChatsUsers(users);
        setFilteredContactList(
          nextPage === 1 ? filteredUsers : val => [...val, ...filteredUsers],
        );
      } else {
        const toastOptions = {
          id: 'contact-server-error',
        };
        showToast('Could not get contacts from server', toastOptions);
      }
      setShowLoadMoreLoader(false);
    }
  };

  const fetchContactList = filter => {
    setShowLoadMoreLoader(true);
    setTimeout(async () => {
      if (isInternetReachable) {
        fetchContactListFromSDK(filter);
      } else {
        const toastOptions = {
          id: 'no-internet-toast',
        };
        showToast('Please check your internet connectivity', toastOptions);
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
    const totalLength =
      forwardMessages.length * Object.keys(selectedUsers).length;

    const _forwardMessages = forwardMessages.sort((a, b) => {
      if (a.timestamp > b.timestamp) {
        return 1;
      } else if (a.timestamp < b.timestamp) {
        return -1;
      } else {
        return 0;
      }
    });
    for (let i = 0; i < totalLength; i++) {
      newMsgIds.push(uuidv4());
    }
    const newMsgIdsCopy = [...newMsgIds];
    for (const msg of _forwardMessages) {
      for (const userId in selectedUsers) {
        const chatType = 'chat';
        let toUserJid =
          selectedUsers[userId]?.userJid || formatUserIdToJid(userId);
        const currentNewMsgId = newMsgIdsCopy.shift();
        const recentChatObj = await getRecentChatMsgObjForward(
          msg,
          toUserJid,
          currentNewMsgId,
        );
        batch(() => {
          // updating recent chat
          dispatch(updateRecentChat(recentChatObj));
          // updating convresations if active chat or delete conversations data
          if (toUserJid === activeChatUserJid) {
            const conversationChatObj = getMessageObjForward(
              msg,
              toUserJid,
              currentNewMsgId,
            );
            const dispatchData = {
              data: [conversationChatObj],
              ...(isSingleChat(chatType)
                ? { userJid: toUserJid }
                : { groupJid: toUserJid }), // check this when working for group chat
            };
            // adding conversation history
            dispatch(addChatConversationHistory(dispatchData));
          } else {
            // deleting conversation history data if available to avoid unwanted UI issue or complexity
            dispatch(deleteChatConversationById(userId));
          }
        });
      }
    }
    // Sending params to SDK to forward message
    const contactsToForward = Object.values(selectedUsers).map(u =>
      formatUserIdToJid(u?.userJid || u?.userId),
    );
    const msgIds = forwardMessages.map(m => m.msgId);
    await SDK.forwardMessagesToMultipleUsers(
      contactsToForward,
      msgIds,
      true,
      newMsgIds,
    );
    setShowLoader(false);
    onMessageForwaded?.();
    if (Object.values(selectedUsers).length === 1) {
      // navigating the user after setTimeout to finish all the running things in background to avoid unwanted issues
      setTimeout(() => {
        dispatch(
          navigate({
            screen: CHATSCREEN,
            fromUserJID: Object.values(selectedUsers)[0]?.userJid,
            profileDetails: {
              userJid: Object.values(selectedUsers)[0]?.userJid,
              userId: Object.values(selectedUsers)[0]?.userId,
              nickName:
                Object.values(selectedUsers)[0]?.name ||
                Object.values(selectedUsers)[0]?.userId,
              colorCode: Object.values(selectedUsers)[0]?.colorCode,
              profileStatus: Object.values(selectedUsers)[0]?.status,
            },
          }),
        );
        navigation.navigate(CONVERSATION_SCREEN);
      }, 0);
    } else {
      navigation.goBack();
    }
  };

  const handleMessageSend = async () => {
    setShowLoader(true);
    // doing the complete action in setTimeout to avoid UI render blocking
    setTimeout(forwardMessagesToSelectedUsers, 0);
  };

  const doNothing = () => null;

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 30;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const fetchContactListWithDebounce = debounce(_searchText => {
    fetchContactList(_searchText);
  }, 400);

  const handleScroll = ({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent)) {
      fetchContactListWithDebounce(searchText.trim());
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Header
          onCancelPressed={handleCancel}
          onSearchPressed={toggleSearching}
          onSearch={setSearchText}
          isSearching={isSearching}
          searchText={searchText}
        />
        {!filteredRecentChatList.length && !filteredContactList.length && (
          <Center h="full" bgColor={'#fff'}>
            <Text style={styles.noMsg}>No Result Found</Text>
          </Center>
        )}
        <ScrollView
          style={commonStyles.flex1}
          onScroll={handleScroll}
          scrollEventThrottle={150}>
          <RecentChatSectionList
            data={filteredRecentChatList}
            selectedUsers={selectedUsers}
            handleChatSelect={handleUserSelect}
            searchText={searchText}
          />
          <ContactsSectionList
            data={filteredContactList}
            selectedUsers={selectedUsers}
            handleChatSelect={handleUserSelect}
            searchText={searchText}
            showLoadMoreLoader={showLoadMoreLoader}
          />
        </ScrollView>
        <SelectedUsersName
          users={selectedUsersArray}
          onMessageSend={handleMessageSend}
        />
      </View>
      {/* Modal for Loader */}
      <Modal
        visible={showLoader}
        animationType="fade"
        onRequestClose={doNothing}
        transparent>
        <View style={styles.loaderContainer}>
          <View style={styles.loaderWrapper}>
            <ActivityIndicator
              color={'#3c3c3c'}
              size={'large'}
              style={styles.loader}
            />
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
    marginHorizontal: 5,
    width: 50,
    height: 50,
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
  sendButton: {
    width: 40,
    height: 40,
    marginRight: 5,
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
    borderColor: '#3276E2',
  },
});
