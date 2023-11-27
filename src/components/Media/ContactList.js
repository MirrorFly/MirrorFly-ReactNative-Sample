import {
  View,
  Text,
  FlatList,
  StyleSheet,
  BackHandler,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Contacts from 'react-native-contacts';
import React from 'react';
import {
  BackArrowIcon,
  CloseIcon,
  ContactInfoIcon,
  TickIcon,
  SearchIcon,
  ContactSendIcon,
  ClearTextIcon,
} from '../../common/Icons';
import { showToast } from '../../Helper/index';
import ContactPreviewScreen from './ContactPreviewScreen';
import commonStyles from '../../common/commonStyles';
import Pressable from '../../common/Pressable';
import IconButton from '../../common/IconButton';
import ApplicationColors from '../../config/appColors';

const screenWidth = Dimensions.get('screen').width;

const maxScreenWidth = Math.min(screenWidth, 500);

const ContactList = ({ handleSendMsg, setLocalNav }) => {
  const [contacts, setContacts] = React.useState([]);
  const [fliterArray, setFliterArray] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showSelectedContactsPreview, setShowSelectedContactsPreview] =
    React.useState(false);
  const [selectedContacts, setSelectedContacts] = React.useState([]);
  const selectedContactsRef = React.useRef({});

  React.useEffect(() => {
    setSearchText('');
    setIsSearching(false);
    setSelectedContacts([]);
    selectedContactsRef.current = {};
  }, [showSelectedContactsPreview]);

  React.useEffect(() => {
    if (searchText === '') {
      setFliterArray(contacts);
    } else {
      const filtered = contacts.filter(item =>
        item?.displayName?.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFliterArray(filtered);
    }
    isLoading && setIsLoading(false);
  }, [searchText, contacts]);

  React.useEffect(() => {
    fetchContacts();
  }, []);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      goBackToPreviousScreen,
    );
    return () => backHandler.remove();
  }, [showSelectedContactsPreview]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      Contacts.getAll().then(fetchedContacts => {
        let validContactsList = fetchedContacts.filter(
          c => c.phoneNumbers.length,
        );
        if (Platform.OS === 'ios') {
          validContactsList = validContactsList.map(c => ({
            ...c,
            displayName:
              (c.givenName ? c.givenName + ' ' : c.givenName) + c.familyName,
          }));
        }
        const sortedContacts = validContactsList.sort((a, b) => {
          const nameA = a.displayName.toLowerCase();
          const nameB = b.displayName.toLowerCase();
          if (nameA < nameB) {
            return -1;
          } else if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        setContacts(sortedContacts);
      });
    } catch (error) {
      console.error('Error fetching contacts: ', error);
    }
  };

  const goBackToPreviousScreen = () => {
    if (showSelectedContactsPreview) {
      setShowSelectedContactsPreview(false);
    } else {
      setLocalNav('CHATCONVERSATION');
    }
  };

  const toggleSearch = () => {
    setIsSearching(val => !val);
    setSearchText('');
  };

  const handleContactNav = () => {
    setShowSelectedContactsPreview(true);
  };

  const handleSearch = text => {
    setSearchText(text);
  };

  const handleSelectedItem = item => {
    if (selectedContactsRef.current[item.recordID]) {
      delete selectedContactsRef.current[item.recordID];
      const newListItems = selectedContacts.filter(
        listItem => listItem !== item,
      );

      setSelectedContacts([...newListItems]);
    } else if (selectedContacts.length < 5) {
      selectedContactsRef.current[item.recordID] = true;
      setSelectedContacts([...selectedContacts, item]);
    } else {
      showToast("Can't share more than 5 contacts", {
        id: 'contacts-max-user-toast',
      });
    }
  };

  const renderSelectedContacts = () => {
    const handleRemovePress = item => () => handleRemoveSelectedContact(item);

    return selectedContacts.map(item => (
      <View key={item.recordID} style={styles.SelectedItemContainer}>
        <Pressable
          contentContainerStyle={styles.SelectedIcon}
          onPress={handleRemovePress(item)}>
          <ContactInfoIcon />
          <View style={styles.ClearIcon}>
            <ClearTextIcon color="#fff" />
          </View>
        </Pressable>
        <Text
          style={styles.selectcontactName}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.displayName}
        </Text>
      </View>
    ));
  };

  const handleRemoveSelectedContact = itemToRemove => {
    const updatedSelectedContact = selectedContacts.filter(
      item => item !== itemToRemove,
    );
    delete selectedContactsRef.current[itemToRemove.recordID];
    setSelectedContacts(updatedSelectedContact);
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const renderItem = ({ item }) => {
    const handlePress = () => handleSelectedItem(item);

    return (
      <Pressable onPress={handlePress}>
        <View style={styles.contactItem}>
          <View style={styles.SubcontactItem}>
            <ContactInfoIcon />
            {selectedContactsRef.current[item.recordID] === true ? (
              <View style={styles.selectedTickContainer}>
                <TickIcon width={'8'} height={'8'} />
              </View>
            ) : null}
          </View>
          <Text
            style={styles.contactName}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.displayName}
          </Text>
        </View>
        <View style={styles.itemSeparator} />
      </Pressable>
    );
  };

  if (showSelectedContactsPreview) {
    return (
      <ContactPreviewScreen
        handleClose={goBackToPreviousScreen}
        contactItems={selectedContacts}
        handleSendMsg={handleSendMsg}
        setLocalNav={setLocalNav}
      />
    );
  }

  const renderHeader = () => {
    return (
      <View style={styles.HeaderContainer}>
        {!isSearching ? (
          <View style={styles.HeadSubcontainer}>
            <IconButton onPress={goBackToPreviousScreen}>
              <BackArrowIcon />
            </IconButton>
            <View style={commonStyles.flex1}>
              <Text style={styles.HeaderTitle}>Contacts to send</Text>
              <Text style={styles.SelectedItem}>
                {selectedContacts.length} Selected
              </Text>
            </View>
            <IconButton
              containerStyle={styles.SearchOption}
              onPress={toggleSearch}>
              <SearchIcon />
            </IconButton>
          </View>
        ) : (
          <View style={styles.searchContainer}>
            <IconButton onPress={toggleSearch}>
              <BackArrowIcon color={'#767676'} />
            </IconButton>
            <TextInput
              placeholderTextColor="#9D9D9D"
              value={searchText}
              style={styles.inputstyle}
              onChangeText={handleSearch}
              placeholder=" Search..."
              autoFocus={true}
              autoCorrect={false}
              cursorColor={ApplicationColors.mainColor}
            />
            {Boolean(searchText) && (
              <IconButton
                containerStyle={commonStyles.marginRight_8}
                onPress={clearSearch}>
                <CloseIcon width={'17'} height={'17'} />
              </IconButton>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <>
        {renderHeader()}
        <View style={commonStyles.flex1_centeredContent}>
          <ActivityIndicator
            size={'large'}
            color={ApplicationColors.mainColor}
          />
        </View>
      </>
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : ''}
      style={commonStyles.flex1}>
      {renderHeader()}
      {/* Selected Contacts Section */}
      {selectedContacts.length > 0 && (
        <View>
          <View style={[commonStyles.hstack]}>{renderSelectedContacts()}</View>
          <View style={styles.BottomLine} />
        </View>
      )}
      {/* Filtered or all contacts list */}
      {fliterArray.length > 0 ? (
        <FlatList
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          data={fliterArray}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={item => item.recordID}
        />
      ) : (
        <View style={styles.NoContact}>
          <Text style={styles.NoContactTitle}>No results found</Text>
        </View>
      )}
      {/* Floating action button */}
      {selectedContacts?.length > 0 && (
        <Pressable onPress={handleContactNav} style={styles.elevationContainer}>
          <View style={styles.ArrowIcon}>
            <ContactSendIcon width={'130'} height={'120'} />
          </View>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
};

export default ContactList;

const styles = StyleSheet.create({
  HeaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingLeft: 10,
    height: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E2',
    elevation: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 20,
    flex: 1,
  },
  phoneNumber: {
    fontSize: 16,
  },
  itemSeparator: {
    marginLeft: 15 + 45 + 20,
    borderBottomColor: '#d9d9d9',
    borderBottomWidth: 1,
  },
  SubcontactItem: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 1,
    width: 45,
    height: 45,
    backgroundColor: '#9D9D9D',
    borderRadius: 25,
  },
  // NameContainer: {
  //   flexDirection: 'column',
  // },
  HeaderTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
    // marginTop: 10,
  },
  HeadSubcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  NoContact: {
    marginTop: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  NoContactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#767676',
  },
  SearchOption: {
    marginRight: 15,
  },
  SelectedItem: {
    fontSize: 14,
    fontWeight: '400',
    color: '#767676',
    marginLeft: 10,
  },
  SelectedItemContainer: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: maxScreenWidth / 5,
  },
  BottomLine: {
    borderBottomColor: '#d9d9d9',
    borderBottomWidth: 1,
    marginTop: 8,
    marginBottom: 5,
  },
  selectcontactName: {
    fontSize: 12,
    color: '#767676',
    marginTop: 3,
  },
  ClearIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#9D9D9D',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    width: 15,
    height: 15,
  },
  SelectedIcon: {
    position: 'relative',
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 1,
    backgroundColor: '#9D9D9D',
    borderRadius: 25,
  },
  inputstyle: {
    flex: 1,
    color: 'black',
    fontSize: 18,
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTickContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#32CD32',
    padding: 4,
    borderRadius: 10,
  },
  ArrowIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevationContainer: {
    position: 'absolute',
    width: 10,
    height: 10,
    padding: 25,
    borderRadius: 30,
    zIndex: 1,
    bottom: 20,
    right: 15,
  },
});
