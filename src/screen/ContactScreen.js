import React from 'react';
import { Center, KeyboardAvoidingView } from 'native-base';
import { BackHandler, Image, Platform, StyleSheet, Text } from 'react-native';
import { CHATSCREEN, RECENTCHATSCREEN, SETTINGSCREEN } from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import { useDispatch } from 'react-redux';
import ScreenHeader from '../components/ScreenHeader';
import SDK from '../SDK/SDK';
import FlatListView from '../components/FlatListView';
import { useNetworkStatus } from '../hooks';
import * as RootNav from '../Navigation/rootNavigation';
import { fetchContactsFromSDK } from '../Helper/index';
import no_contacts from '../assets/no_contacts.png';
import { getImageSource } from '../common/utils';

function ContactScreen() {
  const dispatch = useDispatch();
  const isNetworkconneted = useNetworkStatus();
  const [isFetching, setIsFetching] = React.useState(true);
  const [usersList, setUsersList] = React.useState([]);
  const [isSearchedList, setIsSearchedList] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [searchText, setSearchText] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const handleBackBtn = () => {
    let x = { screen: RECENTCHATSCREEN };
    dispatch(navigate(x));
    RootNav.navigate(RECENTCHATSCREEN);
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  const fetchContactList = () => {
    setIsFetching(true);
    setTimeout(async () => {
      let updateUsersList = await fetchContactsFromSDK(searchText, '', 20);
      setIsSearchedList(updateUsersList.users);
      setIsFetching(false);
    }, 0);
  };

  React.useEffect(() => {
    (async () => {
      setIsFetching(true);
      let _usersList = await fetchContactsFromSDK();
      setPage(1);
      setUsersList(_usersList.users);
      setIsFetching(false);
    })();
    return () => {
      backHandler.remove();
    };
  }, []);

  const menuItems = [
    {
      label: 'Settings',
      formatter: () => {
        dispatch(navigate({ screen: SETTINGSCREEN }));
        RootNav.navigate(SETTINGSCREEN);
      },
    },
  ];
  const handlePress = item => {
    SDK.activeChatUser(item.userJid);
    dispatch(
      navigate({
        screen: CHATSCREEN,
        fromUserJID: item.userJid,
        profileDetails: item,
      }),
    );
    RootNav.navigate(CHATSCREEN);
  };

  const handleSearch = async text => {
    if (isNetworkconneted) {
      setIsSearching(true);
      setIsFetching(true);
      isNetworkconneted && fetchContactList();
      setSearchText(text);
    }
  };

  const handlePagination = async e => {
    setIsFetching(true);
    if (!searchText) {
      let updateUsersList = await fetchContactsFromSDK(
        searchText,
        page + 1 + 2,
        30,
      );
      setPage(page + 1);
      setUsersList([...usersList, ...updateUsersList.users]);
    }
    setIsFetching(false);
  };
  const handleClear = async () => {
    setSearchText('');
    setIsSearching(false);
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title="Contacts"
        onhandleBack={handleBackBtn}
        menuItems={menuItems}
        onhandleSearch={handleSearch}
        handleClear={handleClear}
      />
      <FlatListView
        onhandlePagination={handlePagination}
        onhandlePress={item => handlePress(item)}
        isLoading={isFetching}
        data={isSearching ? isSearchedList : usersList}
      />
      {isNetworkconneted ? (
        <>
          {!isFetching && usersList?.length === 0 && (
            <Center h="90%">
              <Image
                style={styles.image}
                resizeMode="cover"
                source={getImageSource(no_contacts)}
              />
              <Text style={styles.noMsg}>No contacts found</Text>
            </Center>
          )}
          {!isFetching && isSearching && isSearchedList?.length === 0 && (
            <Center h="90%">
              <Text style={styles.noMsg}>No contacts found</Text>
            </Center>
          )}
        </>
      ) : (
        <Center h="100%">
          <Text style={styles.noMsg}>Please check internet connectivity</Text>
        </Center>
      )}
    </KeyboardAvoidingView>
  );
}

export default ContactScreen;

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
    marginBottom: 8,
  },
});
