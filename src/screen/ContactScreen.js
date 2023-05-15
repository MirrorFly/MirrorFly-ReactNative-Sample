import React from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { CHATSCREEN, RECENTCHATSCREEN, SETTINGSCREEN } from '../constant'
import { navigate } from '../redux/navigationSlice'
import { useDispatch } from 'react-redux'
import ScreenHeader from '../components/ScreenHeader'
import SDK from '../SDK/SDK'
import FlatListView from '../components/FlatListView'

function ContactScreen() {
    const dispatch = useDispatch()
    const [isFetching, setIsFetching] = React.useState(false)
    const [usersList, setUsersList] = React.useState([])
    const [page, setPage] = React.useState(0)
    const [totalPages, setTotalPages] = React.useState()
    const [totoalUsers, setTotoalUsers] = React.useState()
    const [searchText, setSearchText] = React.useState('')

    const handleBackBtn = () => {
        let x = { screen: RECENTCHATSCREEN }
        dispatch(navigate(x))
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

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
        return () => backHandler.remove()
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
        dispatch(navigate({ screen: CHATSCREEN, fromUserJID: item.userJid }))
    }

    const handleSearch = async (text) => {
        setIsFetching(true)
        let updateUsersList = await SDK.getUsersList(text)
        setSearchText(text)
        setUsersList(updateUsersList.users)
        setIsFetching(false)
    }

    const handlePagination = async (e) => {
        setIsFetching(true)
        let updateUsersList = await SDK.getUsersList(searchText, page + 1 + 2, 30)
        setPage(page + 1)
        setUsersList([...usersList, ...updateUsersList.users])
        setIsFetching(false)
    }

    return (
        <View style={{ flex: 1, position: 'relative', }}>
            <View style={styles.shadowProp}>
                <ScreenHeader
                    title='Contacts'
                    onhandleBack={handleBackBtn}
                    menuItems={menuItems}
                    onhandleSearch={handleSearch}
                />
            </View>
            <FlatListView
                onhandlePagination={handlePagination}
                onhandlePress={(item) => handlePress(item)}
                isLoading={isFetching}
                data={usersList}
            />
        </View>
    )
}

export default ContactScreen

const styles = StyleSheet.create({
    shadowProp: {
        borderRadius: 10,
        elevation: 22,
        zIndex: 999,
        shadowColor: 'black',
        shadowOpacity: 1,
    },
    flastListContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    }
})