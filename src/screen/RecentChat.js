import React from 'react';
import { View, FlatList, Text, StyleSheet, Image, TextInput, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FloatingBtn } from '../common/Button';
import { navigate } from '../redux/navigationSlice';
import { CONTACTLIST, RECENTCHATLOADING } from '../constant';
import RecentChatItem from '../model/RecentChatItem';
import { CloseIcon, ManigifyingGlass } from '../common/Icons';
import MenuContainer from '../common/MenuContainer';
import { logout } from '../redux/authSlice';

const RecentChatScreen = () => {
    const dispatch = useDispatch();
    const recentChatList = useSelector(state => state.chat.recentChat)
    const messages = useSelector(state => state.chat.chatMessages)
    const isLoading = useSelector(state => state.chat.recentChatStatus)
    const [iconClicked, setIconClicked] = React.useState('')
    const [filteredData, setFilteredData] = React.useState(recentChatList)
    const [menuOpen, setMenuOpen] = React.useState(false);
    const textInputRef = React.useRef(null);

    const recentChatMenu = [
        { id: '1', label: 'My profile' },
        { id: '2', label: 'Logout', formatter: () => dispatch(logout()) },
    ]

    const handleToggleMenu = () => {
        setMenuOpen(!menuOpen)
    }
    const handleClick = (name) => {
        setIconClicked(name)
        if (!name) {
            setFilteredData(recentChatList)
        }
    }

    const handleSearch = (text) => {
        const filtered = recentChatList.filter((item) =>
            item.fromUserId.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered);
    }

    React.useEffect(() => {
        console.log(messages)
        setFilteredData(recentChatList)
    }, [messages])

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    {iconClicked == 'search'
                        ? <TextInput
                            ref={textInputRef}
                            onChangeText={handleSearch}
                            placeholder='Search...'
                            placisLoadingholderTextColor={"#959595"}
                            keyboardType="default"
                        />
                        : <Text style={styles.title}>Chats</Text>
                    }
                </View>
                <View style={styles.iconContainer}>
                    {iconClicked == 'search'
                        ? <CloseIcon onPress={() => handleClick('')} style={styles.icon} width={20} height={20} />
                        : <ManigifyingGlass onPress={() => { handleClick('search'); textInputRef.current?.focus(); }} style={styles.icon} width={20} height={20} />
                    }
                    <MenuContainer menuItems={recentChatMenu} toggleMenu={handleToggleMenu} visible={menuOpen} />
                </View>
            </View>
            {isLoading == RECENTCHATLOADING
                ? <ActivityIndicator size="large" color="#000" />
                : <View style={{ flex: 1 }}>
                    {(!filteredData?.length) ?
                        <View style={styles.imageView}>
                            <Image style={styles.image} width={10} height={10} resizeMode="cover" source={require('../assets/no_messages.png')} />
                            {iconClicked == 'search'
                                ? <Text style={styles.noMsg}>No Chats Found</Text>
                                : <>
                                    <Text style={styles.noMsg}>No New Messages</Text>
                                    <Text>Any new messages will appear here</Text>
                                </>
                            }
                        </View>
                        : <FlatList
                            data={filteredData}
                            keyExtractor={item => item.msgId}
                            renderItem={({ item }) => {
                                return <RecentChatItem RecentItem={item} />
                            }}
                        />
                    }
                </View>
            }
            <FloatingBtn onPress={() => dispatch(navigate({ screen: CONTACTLIST }))} />
        </View>
    )
}

export default RecentChatScreen

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
        paddingHorizontal: 10,
        backgroundColor: '#F2F2F2',
        height: 79,
    },
    chatHeader: {
        backgroundColor: '#F2F2F2',
        height: 80,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15
    },
    avatarContainer: {
        marginStart: 16.97,
        display: 'flex',
        flexDirection: 'row',
    },
    avatar: {
        width: 36.37,
        height: 36.37,
        borderRadius: 50,
        backgroundColor: 'black',
    },
    title: {
        color: "#181818",
        fontSize: 24,
        fontWeight: "bold"
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        paddingHorizontal: 20,
    },
    imageView: {
        flex: 0.72,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200,
    },
    noMsg: {
        color: '#181818',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8
    }
});
