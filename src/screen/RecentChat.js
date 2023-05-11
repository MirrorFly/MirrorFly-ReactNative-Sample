import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TextInput, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FloatingBtn } from '../common/Button';
import { CONTACTLIST, RECENTCHATLOADING, USERLISTSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { getRecentChat } from '../redux/chatSlice';
import RecentChatItem from '../model/RecentChatItem'
import { CloseIcon, ManigifyingGlass, ShapeIcon } from '../common/Icons';
import { Appbar, Menu } from 'react-native-paper';
import MenuContainer from '../common/MenuContainer';

const RecentChatScreen = () => {
    const dispatch = useDispatch();
    const recentChatList = useSelector(state => state?.chat?.recentChat)
    const messages = useSelector(state => state.chat.chatMessages)
    const isLoading = useSelector(state => state.chat.status)
    const [iconClicked, setIconClicked] = React.useState('')
    const [filteredData, setFilteredData] = React.useState([])
    const [menuOpen, setMenuOpen] = React.useState(false);

    const handleToggleMenu = () => {
        setMenuOpen(!menuOpen)
    }

    useEffect(() => {
        (async () => {
            dispatch(getRecentChat())
        })();
    }, [messages])

    const handleClick = (name) => {
        setIconClicked(name)
        if (!name) {
            setFilteredData(recentChatList)
        }
    }

    React.useEffect(() => {
        setFilteredData(recentChatList)
    }, [recentChatList])

    const handleSearch = (text) => {
        const filtered = recentChatList.filter((item) =>
            item.fromUserId.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered);
    }


    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    {iconClicked == 'search'
                        ? <TextInput
                            style={styles.inputStyle}
                            onChangeText={handleSearch}
                            value={filteredData}
                            placeholder='Search...'
                            placisLoadingholderTextColor={"#959595"}
                            keyboardType="default"
                        />
                        : <Text style={styles.title}>Chats</Text>}
                </View>
                <View style={styles.iconContainer}>
                    {iconClicked == 'search'
                        ? <CloseIcon onPress={() => handleClick('')} style={styles.icon} width={20} height={20} />
                        : <ManigifyingGlass onPress={() => handleClick('search')} style={styles.icon} width={20} height={20} />
                    }
                    <MenuContainer toggleMenu={handleToggleMenu} visible={menuOpen} />
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
                            // inverted
                            // contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                        />
                    }
                </View>}
            <FloatingBtn onPress={() => dispatch(navigate({ screen: CONTACTLIST }))} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
        paddingHorizontal: 10,
        backgroundColor: '#F2F2F2',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10
    },
    title: {
        color: "#181818",
        fontSize: 24,
        fontWeight: "bold"
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

export default RecentChatScreen;