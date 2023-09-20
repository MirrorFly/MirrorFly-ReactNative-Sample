import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  BackHandler,
  Pressable,
  TextInput,
  TouchableHighlight,
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
import ContactInfo from './ContactInfo';

const ContactList = props => {
  const [contacts, setContacts] = React.useState([]);
  const [fliterArray, setFliterArray] = React.useState([]);
  const [searchInfo, setSearchInfo] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [contactNav, setContactNav] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState([]);
  const ContactSelectRef = React.useRef({});
  const [clearItem, setClearItem] = React.useState(false);

  React.useEffect(() => {
    const filtered = contacts.filter(item =>
      item.displayName?.toLowerCase().includes(searchInfo.toLowerCase()),
    );
    setFliterArray(filtered);
  }, [searchInfo, contacts]);

  React.useEffect(() => {
    async function fetchContacts() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'App needs access to your contacts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Contacts.getAll().then(fetchedContacts => {
            setContacts(fetchedContacts);
          });
        } else {
        }
      } catch (error) {
        console.error('Error requesting contacts permission:', error);
      }
    }

    fetchContacts();
  }, []);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackBtn,
    );
    return () => backHandler.remove();
  }, [contactNav]);

  const handleBackBtn = () => {
    if (contactNav) {
      setContactNav(false);
    } else {
      props.setLocalNav('CHATCONVERSATION');
    }
  };

  const handleBackInputBtn = () => {
    setIsSearching(false);
  };

  const handleSearchIconPress = () => {
    setIsSearching(!isSearching);
  };

  const handleContactNav = () => {
    setContactNav(true);
  };

  const handleSearch = text => {
    setSearchInfo(text);

    if (text === '') {
      setFliterArray(contacts);
    } else {
      const filtered = contacts.filter(item =>
        item?.displayName?.toLowerCase().includes(text.toLowerCase()),
      );
      setFliterArray(filtered);
    }
  };

  const handleClear = () => {
    setClearItem(true);
  };

  const handleTextClear = () => {
    setSearchInfo('');
  };
  const handleSelectedItem = item => {
    if (ContactSelectRef.current[item.recordID]) {
      delete ContactSelectRef.current[item.recordID];
      const newListItems = selectedContact.filter(
        listItem => listItem !== item,
      );

      setSelectedContact([...newListItems]);
    } else if (selectedContact.length < 5) {
      ContactSelectRef.current[item.recordID] = true;
      setSelectedContact([...selectedContact, item]);
    }
    // }
    else {
      showToast("can't share more than 5 contacts", {
        id: 'contacts-max-user-toast',
      });
    }
  };
  const renderSelectedContacts = () => {
    return selectedContact.map(item => (
      <View key={item.recordID} style={styles.SelectedItemContainer}>
        <View style={styles.SelectedIcon}>
          <ContactInfoIcon />
        </View>
        <Pressable
          style={styles.ClearIcon}
          onPress={() => handleRemoveSelectedContact(item)}>
          <ClearTextIcon color="#fff" />
        </Pressable>
        <Text style={styles.selectcontactName} numberOfLines={1}>
          {item.displayName}
        </Text>
      </View>
    ));
  };

  const handleRemoveSelectedContact = itemToRemove => {
    const updatedSelectedContact = selectedContact.filter(
      item => item !== itemToRemove,
    );
    delete ContactSelectRef.current[itemToRemove.recordID];
    setSelectedContact(updatedSelectedContact);
  };

  const handleClose = () => {
    setContactNav(false);
    return true;
  };

  const renderItem = ({ item }) => (
    <TouchableHighlight
      activeOpacity={0.6}
      underlayColor="#DDDDDD"
      onPress={() => handleSelectedItem(item)}>
      <View style={styles.contactItem}>
        <View style={styles.SubcontactItem}>
          <ContactInfoIcon />
        </View>
        {ContactSelectRef.current[item.recordID] == true ? (
          <View style={styles.selectedTickContainer}>
            <TickIcon width={'8'} height={'8'} />
          </View>
        ) : null}
        <View style={styles.NameContainer}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <View style={styles.itemSeparator} />
        </View>
      </View>
    </TouchableHighlight>
  );
  return (
    <View style={{ flex: 1 }}>
      {!contactNav ? (
        <>
          <View style={styles.HeaderContainer}>
            {!isSearching && (
              <View style={styles.HeadSubcontainer}>
                <Pressable style={{ padding: 2 }} onPress={handleBackBtn}>
                  <BackArrowIcon />
                </Pressable>
                <View>
                  <Text style={styles.HeaderTitle}>Contacts to Send</Text>
                  <Text style={styles.SelectedItem}>
                    {selectedContact.length} selected
                  </Text>
                </View>
              </View>
            )}
            {isSearching && (
              <View style={styles.searchContainer}>
                <Pressable style={{ padding: 2 }} onPress={handleBackInputBtn}>
                  <BackArrowIcon color={'#767676'} />
                </Pressable>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholderTextColor="#9D9D9D"
                    value={searchInfo}
                    style={styles.inputstyle}
                    onChangeText={handleSearch}
                    placeholder="Search..."
                    selectionColor={'#000'}
                    autoFocus={true}
                  />
                  <Pressable onPress={handleTextClear}>
                    <CloseIcon width={'17'} height={'17'} />
                  </Pressable>
                </View>
              </View>
            )}

            {!isSearching && (
              <Pressable
                style={styles.SearchOption}
                onPress={handleSearchIconPress}>
                <SearchIcon />
              </Pressable>
            )}
          </View>
          {selectedContact?.length > 0 && (
            <Pressable
              onPress={handleContactNav}
              style={styles.elevationContainer}>
              <View style={styles.ArrowIcon}>
                {/* <RightArrowIcon width={'10'} height={'10'} color={'#fff'} /> */}
                <ContactSendIcon width={'130'} height={'120'} />
              </View>
            </Pressable>
          )}

          {!fliterArray.length && (
            <View style={styles.NoContact}>
              <Text style={styles.NoContactTitle}>No contact found</Text>
            </View>
          )}
          {selectedContact.length > 0 &&
            selectedContact.length <= 6 &&
            !clearItem && (
              <View>
                <View style={{ flexDirection: 'row' }}>
                  {renderSelectedContacts()}
                </View>
                <View style={styles.BottomLine}></View>
              </View>
            )}
          {contacts.length > 0 ? (
            <FlatList
              data={fliterArray}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={item => item.recordID}
            />
          ) : null}
        </>
      ) : (
        <ContactInfo
          handleClose={handleBackBtn}
          contactItem={selectedContact}
        />
      )}
    </View>
  );
};

export default ContactList;

const styles = StyleSheet.create({
  HeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingLeft: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E2',
    elevation: 2,
    paddingBottom: 8,
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
    marginTop: 10,
    marginHorizontal: 15,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 20,
    paddingTop: 12,
  },
  phoneNumber: {
    fontSize: 16,
  },
  itemSeparator: {
    width: 250,
    paddingTop: 18,
    marginLeft: 30,
    borderBottomColor: '#00000036',
    borderBottomWidth: 0.5,
  },
  SubcontactItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#9D9D9D',
    borderRadius: 25,
  },
  NameContainer: {
    flexDirection: 'column',
  },
  HeaderTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 20,
    marginTop: 10,
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
    marginLeft: 20,
  },
  SelectedItemContainer: {
    marginLeft: 7,
    marginTop: 8,
    alignItems: 'center',
    width: 63,
  },
  BottomLine: {
    width: 340,
    borderBottomColor: '#00000036',
    borderBottomWidth: 0.5,
    marginTop: 8,
    marginLeft: 8,
    marginBottom: 5,
  },
  selectcontactName: {
    fontSize: 12,
    color: '#767676',
    marginLeft: 3,
    marginTop: -10,
  },
  ClearIcon: {
    marginLeft: 26,
    padding: 4,
    top: -11,
    backgroundColor: '#9D9D9D',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    width: 15,
    height: 15,
  },
  SelectedIcon: {
    padding: 7,
    paddingLeft: 8,
    width: 40,
    height: 40,
    backgroundColor: '#9D9D9D',
    borderRadius: 25,
  },
  inputstyle: {
    width: 288,
    color: 'black',
    fontSize: 18,
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTickContainer: {
    position: 'absolute',
    bottom: 0,
    left: 24,
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
