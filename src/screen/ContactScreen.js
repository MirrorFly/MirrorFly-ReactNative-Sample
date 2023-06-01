import React from 'react'
import { Center, KeyboardAvoidingView } from 'native-base';
import { BackHandler, Image, StyleSheet } from 'react-native'
import { CHATSCREEN, RECENTCHATSCREEN, SETTINGSCREEN } from '../constant'
import { navigate } from '../redux/navigationSlice'
import { useDispatch } from 'react-redux'
import ScreenHeader from '../components/ScreenHeader'
import SDK from '../SDK/SDK'
import FlatListView from '../components/FlatListView'
import { Text } from 'react-native';

function ContactScreen() {
    const dispatch = useDispatch()
    const [isFetching, setIsFetching] = React.useState(false)
    const [usersList, setUsersList] = React.useState([])
    const [page, setPage] = React.useState(0)
    const [totalPages, setTotalPages] = React.useState()
    const [totoalUsers, setTotoalUsers] = React.useState()
    const [searchText, setSearchText] = React.useState('')
    const [isSearching, setIsSearching] = React.useState(false)

    const handleBackBtn = () => {
        setIsFetching(false)
        let x = { screen: RECENTCHATSCREEN }
        dispatch(navigate(x))
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    const fetchContactList = () => {
        setTimeout(async () => {
            let updateUsersList = await SDK.getUsersList(searchText, "", 100)
            setUsersList(updateUsersList.users)
            setIsFetching(false)
        }, 700)
    }

    React.useEffect(() => {
        (async () => {
            setIsFetching(true)
            let usersList = await SDK.getUsersList()
            setPage(1)
            setTotalPages(usersList.totalPages)
            setTotoalUsers(usersList.totalUsers)
            setUsersList(usersList.users)
            setIsFetching(false)
        })();
        return () => {
            setIsFetching(false);
            backHandler.remove()
        }
    }, [])

    const menuItems = [
        {
            label: 'Settings',
            formatter: () => {
                dispatch(navigate({ screen: SETTINGSCREEN }))
            }
        }
    ]
    const handlePress = (item) => {
        setIsFetching(false)
        dispatch(navigate({ screen: CHATSCREEN, fromUserJID: item.userJid }))
    }

    const handleSearch = async (text) => {
        setIsSearching(true)
        setIsFetching(true)
        setUsersList([]);
        fetchContactList()
        setSearchText(text)
    }

    const handlePagination = async (e) => {
        setIsFetching(true)
        if (!searchText) {
            let updateUsersList = await SDK.getUsersList(searchText, page + 1 + 2, 30)
            setPage(page + 1)
            setUsersList([...usersList, ...updateUsersList.users])
        }
        setIsFetching(false)
    }
    const handleClear = async() => {
        setIsSearching(false)
        await fetchContactList()
    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust the value as per your UI design
        >
            <ScreenHeader
                title='Contacts'
                onhandleBack={handleBackBtn}
                menuItems={menuItems}
                onhandleSearch={handleSearch}
                onClear={handleClear}
            />
            {!usersList?.length && !isFetching ?
                <Center h='90%'>
                    {!isSearching && <Image style={styles.image} resizeMode="cover" source={require('../assets/no_contacts.png')} />}
                    <Text style={styles.noMsg}>No contacts found</Text>
                </Center>
                : <FlatListView
                    onhandlePagination={handlePagination}
                    onhandlePress={(item) => handlePress(item)}
                    isLoading={isFetching}
                    data={usersList}
                />
            }
        </KeyboardAvoidingView>
    )
}

export default ContactScreen

const styles = StyleSheet.create({
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
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8
    }
});