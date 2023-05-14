import React from 'react'
import ScreenHeader from '../components/ScreenHeader'
import RecentChat from '../components/RecentChat'
import RecentCalls from '../components/RecentCalls'
import { Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { FloatingBtn } from '../common/Button'
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { navigate } from '../redux/navigationSlice';
import { CONTACTLIST } from '../constant';
const logo = require('../assets/mirrorfly-logo.png')

function RecentScreen() {
    const dispatch = useDispatch()
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: 'Chats' },
        { key: 'second', title: 'Calls' },
    ]);
    const recentChatList = useSelector(state => state.chat.recentChat)
    const [filteredData, setFilteredData] = React.useState([])

    const handleSearch = (text) => {
        const filtered = recentChatList.filter((item) =>
            item.fromUserId.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered);
    }

    React.useEffect(() => {
        setFilteredData(recentChatList)
    }, [recentChatList])

    const renderTabBar = props => (
        <TabBar
            {...props}
            style={{ backgroundColor: '#F2F2F2', color: 'black' }}
            indicatorStyle={{ backgroundColor: '#3276E2' }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
            activeColor={'#3276E2'}
        />
    );

    const menuItems = [
        {
            label: 'Logout',
            formatter: () => {
                dispatch(logout())
            }
        }
    ]

    const renderScene = SceneMap({
        first: () => <RecentChat data={filteredData} />,
        second: RecentCalls,
    });

    return (
        <>
            <ScreenHeader
                onhandleSearch={handleSearch}
                menuItems={menuItems}
                logo={logo}
            />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={renderTabBar}
                tabStyle={{ borderColor: 'blck', borderWidth: 1 }}
                activeTabStyle={{ backgroundColor: 'black' }}
            />
            <FloatingBtn onPress={() => dispatch(navigate({ screen: CONTACTLIST }))} />
        </>
    )
}

export default RecentScreen

