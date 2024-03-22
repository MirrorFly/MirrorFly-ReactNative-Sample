import React from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CHATSCREEN, RECENTCHATSCREEN, SETTINGSCREEN } from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import { useDispatch } from 'react-redux';
import ScreenHeader from '../components/ScreenHeader';
import FlatListView from '../components/FlatListView';
import { useNetworkStatus } from '../hooks';
import * as RootNav from '../Navigation/rootNavigation';
import { debounce, fetchContactsFromSDK, showToast } from '../Helper/index';
import no_contacts from '../assets/no_contacts.png';
import { getImageSource } from '../common/utils';
import commonStyles from '../common/commonStyles';

const contactPaginationRefInitialValue = {
  nextPage: 1,
  hasNextPage: true,
};

function ContactScreen() {
  const dispatch = useDispatch();
  const isNetworkconneted = useNetworkStatus();
  const [isFetching, setIsFetching] = React.useState(true);
  const [searchText, setSearchText] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [contactList, setContactList] = React.useState([]);

  const contactsPaginationRef = React.useRef({
    ...contactPaginationRefInitialValue,
  });
  const searchTextValueRef = React.useRef('');

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackBtn,
    );
    return () => {
      backHandler.remove();
    };
  }, []);

  React.useEffect(() => {
    isNetworkconneted && fetchContactList(searchText);
  }, [isNetworkconneted]);

  const handleBackBtn = () => {
    let x = { screen: RECENTCHATSCREEN };
    dispatch(navigate(x));
    RootNav.navigate(RECENTCHATSCREEN);
    return true;
  };

  const updateContactPaginationRefData = (totalPages, filter) => {
    if (filter) {
      contactsPaginationRef.current = { ...contactPaginationRefInitialValue };
      return;
    }
    if (!contactsPaginationRef.current) {
      contactsPaginationRef.current = {};
    }
    if (contactsPaginationRef.current.nextPage < totalPages) {
      contactsPaginationRef.current.nextPage++;
    } else {
      contactsPaginationRef.current.hasNextPage = false;
    }
  };

  const fetchContactListFromSDK = async _searchText => {
    let { nextPage = 1, hasNextPage = true } =
      contactsPaginationRef.current || {};
    if (hasNextPage && _searchText === searchTextValueRef.current) {
      nextPage = _searchText ? 1 : nextPage;
      const { statusCode, users, totalPages } = await fetchContactsFromSDK(
        _searchText,
        nextPage,
        23,
      );
      if (statusCode === 200) {
        updateContactPaginationRefData(totalPages, _searchText);
        setContactList(nextPage === 1 ? users : val => [...val, ...users]);
      } else if (isNetworkconneted && statusCode !== 200) {
        const toastOptions = {
          id: 'contact-server-error',
        };
        showToast('Could not get contacts from server', toastOptions);
      }
      setIsFetching(false);
    }
  };

  const fetchContactListFromSDKWithDebounce = debounce(
    fetchContactListFromSDK,
    300,
  );

  const fetchContactList = text => {
    setIsFetching(true);
    setTimeout(() => {
      const _searchText = text?.trim?.();
      searchTextValueRef.current = _searchText;
      if (isNetworkconneted) {
        if (_searchText) {
          fetchContactListFromSDKWithDebounce(_searchText);
        } else {
          fetchContactListFromSDK(_searchText);
        }
      }
    }, 0);
  };

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
      setSearchText(text);
      fetchContactList(text);
    }
  };

  const handlePagination = () => {
    fetchContactList(searchText);
  };

  const handleClear = async () => {
    setSearchText('');
    setIsSearching(false);
  };

  const renderContactList = () => {
    if (!isNetworkconneted) {
      return (
        <View style={commonStyles.flex1_centeredContent}>
          <Text style={styles.noMsg}>Please check internet connectivity</Text>
        </View>
      );
    }
    if (!isFetching && contactList?.length === 0) {
      return isSearching ? (
        <View style={commonStyles.flex1_centeredContent}>
          <Text style={styles.noMsg}>No contacts found</Text>
        </View>
      ) : (
        <View style={commonStyles.flex1_centeredContent}>
          <Image
            style={styles.image}
            resizeMode="cover"
            source={getImageSource(no_contacts)}
          />
          <Text style={styles.noMsg}>No contacts found</Text>
        </View>
      );
    }

    return (
      <FlatListView
        onhandlePagination={handlePagination}
        onhandlePress={item => handlePress(item)}
        isLoading={isFetching}
        data={contactList}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.flex1}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title="Contacts"
        onhandleBack={handleBackBtn}
        menuItems={menuItems}
        onhandleSearch={handleSearch}
        handleClear={handleClear}
      />
      {renderContactList()}
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
    marginTop: -100, // margin negative half the height to make it center
  },
  noMsg: {
    color: '#181818',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
});
