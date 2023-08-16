import React from 'react';
import ScreenHeader from '../components/ScreenHeader';
import RecentChat from '../components/RecentChat';
import RecentCalls from '../components/RecentCalls';
import { Dimensions, Animated, StyleSheet, BackHandler } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { FloatingBtn } from '../common/Button';
import { batch, useDispatch, useSelector } from 'react-redux';
// import { logout } from '../redux/authSlice';
import { navigate } from '../redux/Actions/NavigationAction';
import {
  CONTACTLIST,
  PROFILESCREEN,
  RECENTCHATSCREEN,
  REGISTERSCREEN,
} from '../constant';
import SDK from '../SDK/SDK';
import { addRecentChat } from '../redux/Actions/RecentChatAction';
import { sortBydate } from '../Helper/Chat/RecentChat';
import * as RootNav from '../Navigation/rootNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileDetail } from '../redux/Actions/ProfileAction';
import { ResetStore } from 'mf-redux/Actions/ResetAction';
import { useFocusEffect } from '@react-navigation/native';

const logo = require('../assets/mirrorfly-logo.png');

const FirstComponent = (isSearching, filteredData, searchValue) => (
  <RecentChat
    isSearching={isSearching}
    data={filteredData}
    searchValue={searchValue}
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
  const [isSearching, setIsSearching] = React.useState(false);
  const [recentData, setrecentData] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');
  const recentChatList = useSelector(state => state.recentChatData.data);

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
    setFilteredData(filtered);
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
    if (isSearching) {
      setIsSearching(false);
      setSearchValue('');
      return true;
    }
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
        first: () => FirstComponent(isSearching, filteredDataList, searchValue),
        second: RecentCalls,
      }),
    [isSearching, filteredDataList, searchValue],
  );

  return (
    <>
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
    </>
  );
}

export default RecentScreen;

const styles = StyleSheet.create({
  tabView: { borderColor: 'black', borderWidth: 1 },
  activeTab: { backgroundColor: 'black' },
});
