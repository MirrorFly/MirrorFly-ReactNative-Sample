import React from 'react';
import { BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { batch, useDispatch, useSelector } from 'react-redux';
import { FloatingBtn } from '../common/Button';
import RecentCalls from '../components/RecentCalls';
import RecentChat from '../components/RecentChat';
import ScreenHeader from '../components/ScreenHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ResetStore } from '../redux/Actions/ResetAction';
import { sortBydate } from '../Helper/Chat/RecentChat';
import * as RootNav from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import {
  CHATSCREEN,
  CONTACTLIST,
  PROFILESCREEN,
  RECENTCHATSCREEN,
  REGISTERSCREEN,
} from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import { profileDetail } from '../redux/Actions/ProfileAction';
import {
  addRecentChat,
  deleteActiveChatAction,
} from '../redux/Actions/RecentChatAction';
import RecentHeader from '../components/RecentHeader';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { DeleteChatHistoryAction } from '../redux/Actions/ConversationAction';
import { updateRosterData } from '../redux/Actions/rosterAction';
import logo from '../assets/mirrorfly-logo.png';
import Modal, { ModalCenteredContent } from '../common/Modal';
import ApplicationColors from '../config/appColors';
import commonStyles from '../common/commonStyles';
import Pressable from '../common/Pressable';

function RecentScreen() {
  const dispatch = useDispatch();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Chats' },
    { key: 'second', title: 'Calls' },
  ]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [filteredMessages, setFilteredMessages] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [recentData, setrecentData] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');
  const recentChatList = useSelector(state => state.recentChatData.data);
  const [recentItem, setRecentItem] = React.useState([]);
  const [showDeleteChatModal, setShowDeleteChatModal] = React.useState(false);

  const handleSearch = text => {
    setIsSearching(true);
    setSearchValue(text);
    searchFilter(text);
  };

  const searchFilter = text => {
    const filtered = recentData?.filter(
      item =>
        item.fromUserId.toLowerCase().includes(text.toLowerCase()) ||
        item?.profileDetails?.nickName
          ?.toLowerCase()
          .includes(text.toLowerCase()),
    );
    SDK.messageSearch(text).then(res => {
      if (res.statusCode === 200) {
        setFilteredMessages(res.data);
      }
    });
    setFilteredData(filtered);
  };

  const handleRecentItemSelect = item => {
    let recentSelected = recentItem.some(selectedItem =>
      selectedItem?.userJid
        ? selectedItem?.userJid === item?.userJid
        : selectedItem?.toUserId === item?.toUserId,
    );
    if (recentSelected) {
      setRecentItem(prevArray =>
        prevArray.filter(
          selectedItem => selectedItem.userJid !== item?.userJid,
        ),
      );
    } else {
      setRecentItem(prevState => [...prevState, item]);
    }
  };

  const handleSelect = item => {
    if (recentItem.length) {
      handleRecentItemSelect(item);
    } else {
      let jid = formatUserIdToJid(
        item?.fromUserId,
      ); /** Need to add chat type here while working in Group
      formatUserIdToJid(
       item?.fromUserId,
       item?.chatType,
     )
     */
      SDK.activeChatUser(jid);
      let x = {
        screen: CHATSCREEN,
        fromUserJID: item?.userJid || jid,
        profileDetails: item?.profileDetails,
      };
      dispatch(navigate(x));
      RootNav.navigate(CHATSCREEN);
    }
  };

  const handleBack = () => {
    setIsSearching(false);
    setSearchValue('');
  };

  const handleClear = () => {
    setFilteredData(recentData);
    setSearchValue('');
  };

  React.useEffect(() => {
    (async () => {
      const recentChats = await SDK.getRecentChatsDB();
      const recentChatsFilter = recentChats?.data.filter(
        item => item.chatType === 'chat',
      );
      dispatch(addRecentChat(recentChatsFilter));
      updateRosterDataForRecentChats(recentChatsFilter);
    })();
  }, []);

  const constructRecentChatItems = recentChatArrayConstruct => {
    let recent = [];
    sortBydate([...recentChatArrayConstruct]).map(async chat => {
      recent.push(chat);
    });

    return recent.filter(eachmessage => eachmessage);
  };

  const updateRosterDataForRecentChats = singleRecentChatList => {
    const userProfileDetails = singleRecentChatList.map(
      chat => chat.profileDetails,
    );
    dispatch(updateRosterData(userProfileDetails));
  };

  React.useEffect(() => {
    let recentChatItems = constructRecentChatItems(recentChatList);
    setrecentData(recentChatItems);
  }, [recentChatList]);

  React.useEffect(() => {
    if (!searchValue) {
      setFilteredData(recentData);
    } else {
      searchFilter(searchValue);
    }
  }, [recentData, isSearching]);

  const renderTabBar = React.useCallback(
    props => {
      return (
        <>
          {!isSearching && (
            <TabBar
              {...props}
              style={styles.tabbar}
              indicatorStyle={styles.tabbarIndicator}
              labelStyle={styles.tabarLabel}
              activeColor={'#3276E2'}
            />
          )}
        </>
      );
    },
    [isSearching],
  );

  const handleBackBtn = () => {
    if (recentItem.length) {
      setRecentItem([]);
      return true;
    }
    if (isSearching) {
      setFilteredMessages([]);
      setIsSearching(false);
      setSearchValue('');
      return true;
    }
  };

  const handleRemove = () => {
    setRecentItem([]);
  };

  const deleteChat = () => {
    recentItem.forEach(item => {
      let userJid =
        item?.userJid ||
        formatUserIdToJid(
          item?.fromUserId,
        ); /** Need to add chat type here while working in Group
         formatUserIdToJid(
          item?.fromUserId,
          item?.chatType,
        )
        */
      SDK.deleteChat(userJid);
      batch(() => {
        dispatch(deleteActiveChatAction({ fromUserId: item?.fromUserId }));
        dispatch(DeleteChatHistoryAction({ fromUserId: item?.fromUserId }));
      });
    });
    setRecentItem([]);
    toggleDeleteModal();
  };

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackBtn,
    );
    return () => {
      backHandler.remove();
    };
  });

  const handleLogout = async () => {
    SDK.logout();
    const getPrevUserIdentifier = await AsyncStorage.getItem('userIdentifier');
    AsyncStorage.setItem('prevUserIdentifier', getPrevUserIdentifier || '');
    AsyncStorage.setItem('credential', '');
    AsyncStorage.setItem('userIdentifier', '');
    AsyncStorage.setItem('screenObj', '');
    AsyncStorage.setItem('vCardProfile', '');
    batch(() => {
      dispatch(profileDetail({}));
      dispatch(navigate({ screen: REGISTERSCREEN }));
      dispatch(ResetStore());
    });
    RootNav.reset(REGISTERSCREEN);
  };

  const toggleDeleteModal = () => {
    setShowDeleteChatModal(val => !val);
  };

  const menuItems = React.useMemo(
    () => [
      {
        label: 'Profile',
        formatter: () => {
          let x = { prevScreen: RECENTCHATSCREEN, screen: PROFILESCREEN };
          dispatch(navigate(x));
          RootNav.navigate(PROFILESCREEN);
        },
      },
      {
        label: 'Logout',
        formatter: handleLogout,
      },
    ],
    [],
  );

  const renderScene = React.useMemo(() => {
    return SceneMap({
      first: () => (
        <RecentChat
          isSearching={isSearching}
          data={filteredData}
          searchValue={searchValue}
          handleSelect={handleSelect}
          handleOnSelect={handleRecentItemSelect}
          recentItem={recentItem}
          filteredMessages={filteredMessages}
        />
      ),
      second: RecentCalls,
    });
  }, [isSearching, filteredData, searchValue, recentItem, filteredMessages]);

  return (
    <>
      {!recentItem.length ? (
        <ScreenHeader
          setIsSearching={setIsSearching}
          onhandleSearch={handleSearch}
          onCloseSearch={handleBack}
          menuItems={menuItems}
          logo={logo}
          handleBackBtn={handleBackBtn}
          isSearching={isSearching}
          handleClear={handleClear}
        />
      ) : (
        <RecentHeader
          handleRemove={handleRemove}
          recentItem={recentItem}
          handleDeleteChat={toggleDeleteModal}
        />
      )}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
        tabStyle={styles.tabView}
        activeTabStyle={styles.activeTab}
        lazy
      />
      <FloatingBtn
        onPress={() => {
          RootNav.navigate(CONTACTLIST);
          dispatch(navigate({ screen: CONTACTLIST }));
        }}
      />
      <Modal visible={showDeleteChatModal} onRequestClose={toggleDeleteModal}>
        <ModalCenteredContent onPressOutside={toggleDeleteModal}>
          <View style={styles.deleteChatModalContentContainer}>
            <Text style={styles.deleteChatModalTitle}>
              {recentItem.length === 1
                ? `${
                    'Delete chat with "' +
                    `${
                      recentItem[0]?.profileDetails?.nickName ||
                      recentItem[0]?.fromUserId
                    }"` +
                    '?'
                  }`
                : `Delete ${recentItem.length} selected chats?`}
            </Text>
            <View style={styles.modalActionButtonContainer}>
              <Pressable
                style={commonStyles.marginRight_8}
                onPress={toggleDeleteModal}>
                <Text style={styles.modalActionButtonText}>NO</Text>
              </Pressable>
              <Pressable onPress={deleteChat}>
                <Text style={styles.modalActionButtonText}>YES</Text>
              </Pressable>
            </View>
          </View>
        </ModalCenteredContent>
      </Modal>
    </>
  );
}

export default RecentScreen;

const styles = StyleSheet.create({
  tabView: { borderColor: 'black', borderWidth: 1 },
  activeTab: { backgroundColor: 'black' },
  deleteChatModalContentContainer: {
    backgroundColor: ApplicationColors.white,
    width: '88%',
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontWeight: '300',
  },
  deleteChatModalTitle: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: 16,
    color: ApplicationColors.black,
  },
  modalActionButtonContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    marginTop: 20,
  },
  modalActionButtonText: {
    fontWeight: '500',
    color: ApplicationColors.mainColor,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  tabbar: {
    backgroundColor: '#F2F2F2',
    color: 'black',
  },
  tabbarIndicator: {
    backgroundColor: '#3276E2',
    borderColor: '#3276E2',
    borderWidth: 1.3,
  },
  tabarLabel: {
    color: 'black',
    fontWeight: 'bold',
  },
});
