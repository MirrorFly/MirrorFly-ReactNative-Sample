import React from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { batch, useDispatch, useSelector } from 'react-redux';
import { FloatingBtn } from '../common/Button';
import RecentCalls from '../components/RecentCalls';
import RecentChat from '../components/RecentChat';
import ScreenHeader from '../components/ScreenHeader';
// import { logout } from '../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ResetStore } from 'mf-redux/Actions/ResetAction';
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
import RecentHeader from 'components/RecentHeader';
import { formatUserIdToJid } from 'Helper/Chat/ChatHelper';
import { HStack, Modal, Text } from 'native-base';
import { DeleteChatHIstoryAction } from 'mf-redux/Actions/ConversationAction';

const logo = require('../assets/mirrorfly-logo.png');

const FirstComponent = (
  isSearching,
  filteredData,
  searchValue,
  handleSelect,
  handleOnSelect,
  recentItem,
  filteredMessages,
) => (
  <RecentChat
    isSearching={isSearching}
    data={filteredData}
    searchValue={searchValue}
    handleSelect={handleSelect}
    handleOnSelect={handleOnSelect}
    recentItem={recentItem}
    filteredMessages={filteredMessages}
  />
);

function RecentScreen() {
  const av = new Animated.Value(0);
  av.addListener(() => {
    return;
  }); /** resolving WARN Sending `onAnimatedValueUpdate` with no listeners registered */
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
  const [isOpenAlert, setIsOpenAlert] = React.useState(false);

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
          .toLowerCase()
          .includes(text.toLowerCase()),
    );
    SDK.messageSearch(text).then(res => {
      if (res.statusCode === 200) {
        setFilteredMessages(res.data);
      }
    });
    setFilteredData(filtered);
  };

  const handleSelect = item => {
    if (recentItem.length) {
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
        setRecentItem([item]);
      }
    } else {
      let jid = formatUserIdToJid(item?.fromUserId, item?.chatType);
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
    })();
  }, []);

  const constructRecentChatItems = recentChatArrayConstruct => {
    let recent = [];
    sortBydate([...recentChatArrayConstruct]).map(async chat => {
      recent.push(chat);
    });

    return recent.filter(eachmessage => eachmessage);
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
              style={{ backgroundColor: '#F2F2F2', color: 'black' }}
              indicatorStyle={{
                backgroundColor: '#3276E2',
                borderColor: '#3276E2',
                borderWidth: 1.3,
              }}
              labelStyle={{ color: 'black', fontWeight: 'bold' }}
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

  const handleOnSelect = item => {
    recentItem.length === 0 && setRecentItem([item]);
  };

  const handleRemove = () => {
    setRecentItem([]);
  };

  const handleDeleteChat = () => {
    setIsOpenAlert(true);
  };

  const deleteChat = () => {
    recentItem.forEach(item => {
      let userJid =
        item?.userJid || formatUserIdToJid(item?.fromUserId, item?.chatType);
      SDK.deleteChat(userJid);
      dispatch(deleteActiveChatAction({ fromUserId: item?.fromUserId }));
      dispatch(DeleteChatHIstoryAction({ fromUserId: item?.fromUserId }));
    });
    setRecentItem([]);
    setIsOpenAlert(false);
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
    console.log('logged out');
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
    RootNav.navigate(REGISTERSCREEN);
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

  const filteredDataList = isSearching ? filteredData : recentData;

  const renderScene = React.useMemo(
    () =>
      SceneMap({
        first: () =>
          FirstComponent(
            isSearching,
            filteredDataList,
            searchValue,
            handleSelect,
            handleOnSelect,
            recentItem,
            filteredMessages,
          ),
        second: RecentCalls,
      }),
    [
      isSearching,
      filteredDataList,
      searchValue,
      recentItem,
      recentData,
      filteredMessages,
    ],
  );

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
          handleDeleteChat={handleDeleteChat}
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
      <Modal
        isOpen={isOpenAlert}
        safeAreaTop={true}
        onClose={() => setIsOpenAlert(false)}>
        <Modal.Content
          w="88%"
          borderRadius={0}
          px="6"
          py="4"
          fontWeight={'300'}>
          <Text fontSize={16} color={'#000'}>
            {`${
              'Delete chat with "' +
              `${
                recentItem[0]?.profileDetails?.nickName ||
                recentItem[0]?.fromUserId
              }"` +
              '?'
            }`}
          </Text>
          <HStack justifyContent={'flex-end'} pb={'1'} pt={'7'}>
            <Pressable
              onPress={() => {
                setIsOpenAlert(false);
              }}>
              <Text pr={'6'} fontWeight={'500'} color={'#3276E2'}>
                NO
              </Text>
            </Pressable>
            <Pressable onPress={deleteChat}>
              <Text fontWeight={'500'} color={'#3276E2'}>
                YES
              </Text>
            </Pressable>
          </HStack>
        </Modal.Content>
      </Modal>
    </>
  );
}

export default RecentScreen;

const styles = StyleSheet.create({
  tabView: { borderColor: 'black', borderWidth: 1 },
  activeTab: { backgroundColor: 'black' },
});
