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
const logo = require('../assets/mirrorfly-logo.png');

const FirstComponent = (isSearching, filteredData) => <RecentChat isSearching={isSearching} data={filteredData} />;

function RecentScreen() {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.chatMessages);
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Chats' },
    { key: 'second', title: 'Calls' },
  ]);
  const recentChatList = useSelector((state) => state.chat.recentChat);
  const [filteredData, setFilteredData] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = React.useCallback((text) => {
    setIsSearching(true);
    const filtered = recentChatList.filter((item) =>
      item.fromUserId.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  }, [recentChatList]);

  const handleBack = React.useCallback(() => {
    setIsSearching(false);
  }, []);

  const handleReset = React.useCallback(() => {
    setFilteredData(recentChatList);
  }, [recentChatList]);

  React.useEffect(() => {
    (async () => {
      const recentChats = await SDK.getRecentChats();
      setFilteredData(recentChats.data?.reverse());
    })();
  }, [messages]);

  React.useEffect(() => {
    setFilteredData(recentChatList)
  }, [recentChatList, isSearching])

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
          let x = { prevScreen: RECENTCHATSCREEN ,screen: PROFILESCREEN }
          dispatch(navigate(x))
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



  const renderScene = React.useMemo(
    () =>
      SceneMap({
        first: () => FirstComponent(isSearching, filteredData),
        second: RecentCalls,
      }),
    [isSearching, filteredData]
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
        onClear={handleReset}
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
      <FloatingBtn onPress={() => dispatch(navigate({ screen: CONTACTLIST }))} />
    </>
  );
}

export default RecentScreen;
