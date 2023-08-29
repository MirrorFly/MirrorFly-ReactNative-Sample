import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { sortBydate } from 'Helper/Chat/RecentChat';
import { debounce, fetchContactsFromSDK, showToast } from 'Helper/index';
import SDK from 'SDK/SDK';
import Avathar from 'common/Avathar';
import { BackArrowIcon, CloseIcon, SearchIcon } from 'common/Icons';
import {
  Center,
  Checkbox,
  Icon,
  IconButton,
  View as NBView,
} from 'native-base';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useNetworkStatus } from '../hooks';
import commonStyles from 'common/commonStyles';
import { HighlightedText } from 'components/RecentChat';
import {
  formatUserIdToJid,
  getMessageObjForward,
  getRecentChatMsgObjForward,
  isSingleChat,
} from 'Helper/Chat/ChatHelper';
import { v4 as uuidv4 } from 'uuid';
import { updateRecentChat } from 'mf-redux/Actions/RecentChatAction';
import {
  addChatConversationHistory,
  deleteChatConversationById,
} from 'mf-redux/Actions/ConversationAction';
import { SendBlueIcon } from '../common/Icons';
import useRosterData from 'hooks/useRosterData';

const showMaxUsersLimitToast = () => {
  const options = {
    id: 'forward-message-user-limit',
  };
  showToast('You can only forward upto 5 users or groups', options);
};

const Header = ({
  onCancelPressed,
  onSearchPressed,
  onSearch,
  isSearching,
  searchText,
}) => {
  const handleSearchTextChange = value => {
    onSearch(value);
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
        {isSearching ? <CloseIcon /> : <SearchIcon />}
      </IconButton>
    </View>
  );
};

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
  const [isChecked, setIsChecked] = useState(false);
  const {
    nickName = name,
    status: profileStatus = status,
    image: imageToken,
    colorCode,
  } = useRosterData(userId);

  useEffect(() => {
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
            onChange={handleChatItemSelect}
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
  const userNames = useMemo(() => {
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
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [showLoader, setShowLoader] = useState(false);
  const [showLoadMoreLoader, setShowLoadMoreLoader] = useState(false);
  const [filteredRecentChatList, setFilteredRecentChatList] = useState([]);
  const [filteredContactList, setFilteredContactList] = useState([]);
  const recentChatData = useSelector(state => state.recentChatData.data);
  const activeChatUserJid = useSelector(state => state.navigation.fromUserJid);

  const contactsPaginationRef = useRef({ ...contactPaginationRefInitialValue });

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

  useLayoutEffect(() => {
    fetchContactListWithDebounce(searchText.trim());
  }, [searchText]);

  useEffect(() => {
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

  const selectedUsersArray = useMemo(() => {
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
    if (hasNextPage) {
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
    for (let i = 0; i < totalLength; i++) {
      newMsgIds.push(uuidv4());
    }
    for (const msg of forwardMessages) {
      const newMsgIdsCopy = [...newMsgIds];
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
    const contactsToForward = Object.values(selectedUsers).map(u => u.userJid);
    const msgIds = forwardMessages.map(m => m.msgId);
    SDK.forwardMessagesToMultipleUsers(
      contactsToForward,
      msgIds,
      true,
      newMsgIds,
    );
    setShowLoader(false);
    onMessageForwaded?.();
    navigation.goBack();
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
});
