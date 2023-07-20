import React from 'react';
import ScreenHeader from '../components/ScreenHeader';
import RecentChat from '../components/RecentChat';
import RecentCalls from '../components/RecentCalls';
import { Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { FloatingBtn } from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { navigate } from '../redux/navigationSlice';
import { CONTACTLIST, PROFILESCREEN, RECENTCHATSCREEN } from '../constant';
import SDK from '../SDK/SDK';
import { addRecentChat } from '../redux/recentChatDataSlice';
import { sortBydate } from '../Helper/Chat/RecentChat';
import * as RootNav from '../Navigation/rootNavigation'

const logo = require('../assets/mirrorfly-logo.png');

const FirstComponent = (isSearching, filteredData) => <RecentChat isSearching={isSearching} data={filteredData} />;

function RecentScreen() {
  const dispatch = useDispatch();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Chats' },
    { key: 'second', title: 'Calls' },
  ]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [recentData, setrecentData] = React.useState([]);
  const recentChatList = useSelector((state) => state.recentChatData.data);

  const handleSearch = React.useCallback((text) => {
    setIsSearching(true);
    const filtered = recentData?.filter((item) =>
      item.fromUserId.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  }, [recentData]);

  const handleBack = React.useCallback(() => {
    setIsSearching(false);
  }, []);

  const handleClear = React.useCallback(() => {
    setFilteredData(recentData);
  }, [recentData]);

  React.useEffect(() => {
    (async () => {
      const recentChats = await SDK.getRecentChatsDB();
      const recentChatsFilter = recentChats?.data.filter(item => item.chatType == 'chat')
      dispatch(addRecentChat(recentChatsFilter))
    })()
  }, []);

  const constructRecentChatItems = (recentChatArrayConstruct) => {
    let recent = [];
    sortBydate([...recentChatArrayConstruct]).map(async (chat) => {
      recent.push(chat);
    });
    return recent.filter((eachmessage) => eachmessage);
  };

  React.useEffect(() => {
    let recentChatItems = constructRecentChatItems(recentChatList);
    setrecentData(recentChatItems)
  }, [recentChatList])

  React.useEffect(() => {
    setFilteredData(recentData)
  }, [recentData, isSearching])

  const renderTabBar = React.useCallback(
    (props) => {
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
    [isSearching]
  );

  const menuItems = React.useMemo(
    () => [
      {
        label: 'Profile',
        formatter: () => {
          let x = { prevScreen: RECENTCHATSCREEN, screen: PROFILESCREEN }
          dispatch(navigate(x))
          RootNav.navigate(PROFILESCREEN)
        }
      },
      {
        label: 'Logout',
        formatter: () => {
          dispatch(logout());
        },
      }
    ],
    []
  );

  const filteredDataList = isSearching ? filteredData : recentData

  const renderScene = React.useMemo(
    () =>
      SceneMap({
        first: () => FirstComponent(isSearching, filteredDataList),
        second: RecentCalls,
      }),
    [isSearching, filteredDataList]
  );

  return (
    <>
      <ScreenHeader
        setIsSearching={setIsSearching}
        onhandleSearch={handleSearch}
        onCloseSearch={handleBack}
        menuItems={menuItems}
        logo={logo}
        isSearching={isSearching}
        handleClear={handleClear}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
        tabStyle={{ borderColor: 'black', borderWidth: 1 }}
        activeTabStyle={{ backgroundColor: 'black' }}
        lazy
      />
      <FloatingBtn onPress={() => {
        RootNav.navigate(CONTACTLIST)
        dispatch(navigate({ screen: CONTACTLIST }))
      }} />
    </>
  );
}

export default RecentScreen;
