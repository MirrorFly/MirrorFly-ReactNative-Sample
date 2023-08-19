import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { sortBydate } from 'Helper/Chat/RecentChat';
import { showToast } from 'Helper/index';
import SDK from 'SDK/SDK';
import Avathar from 'common/Avathar';
import { CloseIcon, SearchIcon } from 'common/Icons';
import { Checkbox, IconButton, View as NBView } from 'native-base';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useNetworkStatus } from '../hooks';
import commonStyles from 'common/commonStyles';
import { HighlightedText } from 'components/RecentChat';
import { getRecentChatMsgObjForward } from 'Helper/Chat/ChatHelper';
import { v4 as uuidv4 } from 'uuid';
import { updateRecentChat } from 'mf-redux/Actions/RecentChatAction';

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
        <TextInput
          value={searchText}
          placeholder=" Search..."
          autoFocus
          onChangeText={handleSearchTextChange}
          style={styles.searchInput}
        />
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
  colorCode,
  status,
  handleItemSelect,
  isSelected,
  isCheckboxAllowed,
  searchText,
}) => {
  const [isChecked, setIsChecked] = useState(false);
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
      name,
      colorCode,
      status,
      userJid,
    });
  };

  return (
    <>
      <Pressable onPress={handleChatItemSelect}>
        <View style={styles.recentChatListItems}>
          <View style={styles.recentChatItemAvatarName}>
            <Avathar data={name || userId} backgroundColor={colorCode} />
            <View>
              <View style={styles.recentChatItemName}>
                <HighlightedText
                  text={name || userId}
                  searchValue={searchText}
                  index={userId}
                />
              </View>
              <Text
                style={styles.recentChatItemStatus}
                numberOfLines={1}
                ellipsizeMode="tail">
                {status}
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
      <View style={styles.recentChatHeader}>
        <Text style={styles.recentChatHeaderText}>Recent Chat</Text>
      </View>
      {/* List */}
      <View style={styles.recentChatList}>
        {data.map(item => (
          <ContactItem
            key={item.fromUserId}
            userId={item.fromUserId}
            userJid={item.userJid}
            name={item.profileDetails?.nickName}
            status={item.profileDetails?.status}
            colorCode={item.profileDetails?.colorCode}
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
}) => {
  return (
    <View style={styles.recentChatContiner}>
      {/* Header */}
      <View style={styles.recentChatHeader}>
        <Text style={styles.recentChatHeaderText}>Contacts</Text>
      </View>
      {/* List */}
      <View style={styles.recentChatList}>
        {data.map(item => (
          <ContactItem
            key={item.userId}
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
      <Text style={styles.sendButton} onPress={onMessageSend}>
        NEXT
      </Text>
    </NBView>
  );
};

// Main Component
const ForwardMessage = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [filteredRecentChatList, setFilteredRecentChatList] = useState([]);
  const [filteredContactList, setFilteredContactList] = useState([]);
  const recentChatData = useSelector(state => state.recentChatData.data);
  const activeChatUserJid = useSelector(state => state.navigation.fromUserJid);
  const vCardData = useSelector(state => state.profile.profileDetails);

  const dispatch = useDispatch();

  const isInternetReachable = useNetworkStatus();

  const {
    params: { forwardMessages },
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
    fetchContactList(searchText);
  }, [searchText]);

  useEffect(() => {
    if (searchText) {
      // filtering the recent chat and updating the state
      const filteredData = recentChatList.filter(i =>
        i.profileDetails?.nickName
          ?.toLowerCase?.()
          ?.includes(searchText.toLowerCase()),
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

  const fetchContactList = async filter => {
    if (isInternetReachable) {
      const { statusCode, users } = await SDK.getUsersList(filter, 1, 23);
      if (statusCode === 200) {
        const filteredUsers = getUsersExceptRecentChatsUsers(users);
        setFilteredContactList(filteredUsers);
      } else {
        const toastOptions = {
          id: 'contact-server-error',
        };
        showToast('Could not get contacts from server', toastOptions);
      }
    } else {
      const toastOptions = {
        id: 'no-internet-toast',
      };
      showToast('Please check your internet connectivity', toastOptions);
    }
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

  const handleMessageSend = async () => {
    // console.log('forwardMessages', JSON.stringify(forwardMessages, null, 2));
    // console.log('Selected Users', JSON.stringify(selectedUsers, null, 2));
    // TODO: send message to the selected users
    // STEP 1: send message to all the users through SDK
    // STEP 2: update the Recent Chat data with last message
    // STEP 3: update chat conversations only if available

    // Sending params to SDK to forward message
    const contactsToForward = Object.values(selectedUsers).map(u => u.userJid);
    const msgIds = forwardMessages.map(m => m.msgId);
    console.log('Forward params', contactsToForward, msgIds);
    SDK.forwardMessagesToMultipleUsers(contactsToForward, msgIds, true);

    const newMsgIds = [];
    const totalLength =
      forwardMessages.length * Object.keys(selectedUsers).length;
    for (let i = 0; i < totalLength; i++) {
      newMsgIds.push(uuidv4());
    }
    for (const msg of forwardMessages) {
      /*
      OLD CODE
      const {
        msgBody: { message_type = 'text', message = '' } = {},
        chatType = 'chat',
      } = msg;
        const messageObject = {
          type: message_type,
          content: message,
          replyTo: '',
        }; */
      for (const userId in selectedUsers) {
        const { userJid } = selectedUsers[userId];
        const currentNewMsgId = newMsgIds.pop();
        const recentChatObj = await getRecentChatMsgObjForward(
          msg,
          userJid,
          currentNewMsgId,
        );
        console.log('recentChatObj', JSON.stringify(recentChatObj, null, 2));
        batch(() => {
          // updating recent chat
          dispatch(updateRecentChat(recentChatObj));
          // updating convresations if active chat or delete conversations data
          if (userJid === activeChatUserJid) {
            // TODO: add conversation history
          } else {
            // TODO: delete conversation history data if available
          }
        });
        // dispatch(RecentChatUpdateAction(recentChatObj));
        // this.handleUpdateHistory(toJid, contactsToForward, originalMsg, newMsgIds, j);
        /*
        OLD code
        console.log(
          'Forwarding Message',
          messageObject,
          currentUserJID,
          vCardData,
          selectedUsers[user].userJid,
          chatType,
        );
        await sendMessageToUserOrGroup(
          messageObject,
          currentUserJID,
          vCardData,
          selectedUsers[user].userJid,
          chatType,
        ); */
      }
      // navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        onCancelPressed={handleCancel}
        onSearchPressed={toggleSearching}
        onSearch={setSearchText}
        isSearching={isSearching}
        searchText={searchText}
      />
      <ScrollView style={commonStyles.flex1}>
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
        />
      </ScrollView>
      <SelectedUsersName
        users={selectedUsersArray}
        onMessageSend={handleMessageSend}
      />
    </View>
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
    borderRadius: 3,
  },
  sendButton: {
    width: 50,
    height: 40,
    padding: 5,
    margin: 5,
    marginRight: 0,
    textAlignVertical: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
  },
});
