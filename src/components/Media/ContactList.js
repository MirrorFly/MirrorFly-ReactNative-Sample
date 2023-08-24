import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  BackHandler,
  Pressable,
  // TextInput
} from 'react-native';
import Contacts from 'react-native-contacts';
import React from 'react';
// import ScreenHeader from 'components/ScreenHeader';
import {
  BackArrowIcon,
  ContactInfoIcon,
  // ForwardIcon,
  SearchIcon,
} from 'common/Icons';

const ContactList = props => {
  const [contacts, setContacts] = React.useState([]);
  const [fliterArray, setFliterArray] = React.useState([]);
  const [searchInfo, setSearchInfo] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);


  React.useEffect(() => {
    const filtered = contacts.filter(item =>
      item.displayName?.toLowerCase().includes(searchInfo.toLowerCase()),
    );
    setFliterArray(filtered);
  }, [searchInfo,contacts]);

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

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => backHandler.remove();
  }, []);

  const handleBackBtn = () => {
    props.setLocalNav('CHATCONVERSATION');
  };

  // const handleSearch = text => {
  //  // setIsSearching(true);
  //   setSearchInfo(text);
  // };

  const handleSearchIconPress = () => {
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setSearchInfo('');
    setIsSearching(false);
  };

  const handleSearch = text => {
    setSearchInfo(text);
    if (text === '') {
      setFliterArray(contacts);
    } else {
      const filtered = contacts.filter(
        item => item?.displayName?.toLowerCase().includes(text.toLowerCase())
      );
      setFliterArray(filtered);
    }
  };
  //   const handleReset = () => {
  //     setContacts([]);
  //   };


  const renderItem = ({ item }) => (
    <View style={styles.contactItem}>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 10,
          backgroundColor: '#9D9D9D',
          borderRadius: 25,
        }}>
        <ContactInfoIcon />
      </View>

   <View style={{flexDirection:"column"}} >
   <Text style={styles.contactName}>{item.displayName}</Text>
<View style={styles.itemSeparator} />
   </View>
      
    </View>
  );
  return (
    <View>
      {/* <ScreenHeader
          title="Contacts to Send"
          onhandleBack={handleBackBtn}
          onhandleSearch={handleSearch}
          onClear={handleReset}
        /> */}
      <View style={styles.HeaderContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable style={{ padding: 2 }} onPress={handleBackBtn}>
            <BackArrowIcon />
          </Pressable>
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 20,
              }}>
              Contacts to Send
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '400',
                color: '#767676',
                marginLeft: 20,
              }}>
              0 selected
            </Text>
          </View>
        </View>
        {/* {!isSearching && (
            <TextInput
              placeholderTextColor="#d3d3d3"
              value={searchInfo}
              style={{ flex: 0.7, color: 'black', fontSize: 16 }}
              onChangeText={ 
                setSearchInfo()
              }
              placeholder="Search..."
              selectionColor={'#3276E2'}
              autoFocus={true}
            />
          )} */}
          {!isSearching && (
          <Pressable style={{ marginRight: 15 }} onPress={handleSearchIconPress}>
            <SearchIcon />
          </Pressable>
        )}
      </View>

      {contacts.length > 0 ? (
        <FlatList
          data={fliterArray}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={item => item.recordID}
         
        />
      ) : (
        <View
          style={{
            marginTop: 300,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
        {!contacts.length > 0 && (

          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>
            No contacts found.
          </Text>)}
        </View>
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
    backgroundColor: '#E2E2E2',
    height: 70,
    paddingLeft: 10,
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
    // borderBottomColor: '#757575',
    // borderBottomWidth: 1,
  },
  contactName: {
    fontSize: 14,
    // paddingTop:10,
    fontWeight: 'bold',
    marginLeft: 20,
    paddingTop:12,
  },
  phoneNumber: {
    fontSize: 16,
  },
  itemSeparator: {
    // height: 1,
    width:250,
     paddingTop:15,
     marginLeft:30,
    borderBottomColor: '#00000036',
    borderBottomWidth: 1,
  },
});
