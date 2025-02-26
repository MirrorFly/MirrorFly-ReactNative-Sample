import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
   ActivityIndicator,
   Dimensions,
   FlatList,
   KeyboardAvoidingView,
   Platform,
   StyleSheet,
   View,
} from 'react-native';
import Contacts from 'react-native-contacts';
import IconButton from '../common/IconButton';
import {
   BackArrowIcon,
   ClearTextIcon,
   CloseIcon,
   ContactInfoIcon,
   ContactSendIcon,
   SearchIcon,
   TickIcon,
} from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import TextInput from '../common/TextInput';
import { showToast } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { MOBILE_CONTACT_PREVIEW_SCREEN } from './constants';

const screenWidth = Dimensions.get('screen').width;

const maxScreenWidth = Math.min(screenWidth, 500);

const MobileContacts = () => {
   const navigation = useNavigation();
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const [contacts, setContacts] = React.useState([]);
   const [fliterArray, setFliterArray] = React.useState([]);
   const [searchText, setSearchText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);
   const [isLoading, setIsLoading] = React.useState(true);
   const [selectedContacts, setSelectedContacts] = React.useState([]);
   const selectedContactsRef = React.useRef({});

   React.useEffect(() => {
      if (searchText === '') {
         setFliterArray(contacts);
      } else {
         const filtered = contacts.filter(item => item?.displayName?.toLowerCase().includes(searchText.toLowerCase()));
         setFliterArray(filtered);
      }
      isLoading && setIsLoading(false);
   }, [searchText, contacts]);

   React.useEffect(() => {
      fetchContacts();
   }, []);

   const fetchContacts = async () => {
      try {
         setIsLoading(true);
         Contacts.getAll().then(fetchedContacts => {
            let validContactsList = fetchedContacts.filter(c => c.phoneNumbers.length);
            if (Platform.OS === 'ios') {
               validContactsList = validContactsList.map(c => ({
                  ...c,
                  displayName: (c.givenName ? c.givenName + ' ' : c.givenName) + c.familyName,
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
      navigation.goBack();
      return true;
   };

   const toggleSearch = () => {
      setIsSearching(val => !val);
      setSearchText('');
   };

   const handleContactNav = () => {
      navigation.navigate(MOBILE_CONTACT_PREVIEW_SCREEN, { selectedContacts });
   };

   const handleSearch = text => {
      setSearchText(text);
   };

   const handleSelectedItem = item => {
      if (selectedContactsRef.current[item.recordID]) {
         delete selectedContactsRef.current[item.recordID];
         const newListItems = selectedContacts.filter(listItem => listItem !== item);

         setSelectedContacts([...newListItems]);
      } else if (selectedContacts.length < 5) {
         selectedContactsRef.current[item.recordID] = true;
         setSelectedContacts([...selectedContacts, item]);
      } else {
         showToast(stringSet.TOAST_MESSAGES.CANNOT_SHARE_MORE_THAN_5_CONTACTS);
      }
   };

   const renderSelectedContacts = () => {
      const handleRemovePress = item => () => handleRemoveSelectedContact(item);

      return selectedContacts.map(item => (
         <View key={item.recordID} style={styles.SelectedItemContainer}>
            <Pressable contentContainerStyle={styles.SelectedIcon} onPress={handleRemovePress(item)}>
               <ContactInfoIcon />
               <View style={styles.ClearIcon}>
                  <ClearTextIcon color="#fff" />
               </View>
            </Pressable>
            <Text
               style={[styles.selectcontactName, commonStyles.textColor(themeColorPalatte.secondaryTextColor)]}
               numberOfLines={1}
               ellipsizeMode="tail">
               {item.displayName}
            </Text>
         </View>
      ));
   };

   const handleRemoveSelectedContact = itemToRemove => {
      const updatedSelectedContact = selectedContacts.filter(item => item !== itemToRemove);
      delete selectedContactsRef.current[itemToRemove.recordID];
      setSelectedContacts(updatedSelectedContact);
   };

   const clearSearch = () => {
      setSearchText('');
   };

   const doNothing = () => null;

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
                  style={[styles.contactName, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.displayName}
               </Text>
            </View>
            <View style={styles.itemSeparator} />
         </Pressable>
      );
   };

   const renderHeader = () => {
      return (
         <View style={[styles.HeaderContainer, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
            {!isSearching ? (
               <View style={styles.HeadSubcontainer}>
                  <IconButton onPress={goBackToPreviousScreen}>
                     <BackArrowIcon color={themeColorPalatte.iconColor} />
                  </IconButton>
                  <View style={commonStyles.flex1}>
                     <Text
                        style={[styles.HeaderTitle, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                        {stringSet.CHAT_SCREEN_ATTACHMENTS.CONTACT_TO_SEND}
                     </Text>
                     <Text style={[styles.SelectedItem, commonStyles.textColor(themeColorPalatte.secondaryTextColor)]}>
                        {selectedContacts.length} {stringSet.CHAT_SCREEN_ATTACHMENTS.SELECTED}
                     </Text>
                  </View>
                  <IconButton containerStyle={styles.SearchOption} onPress={toggleSearch}>
                     <SearchIcon color={themeColorPalatte.iconColor} />
                  </IconButton>
               </View>
            ) : (
               <View style={styles.searchContainer}>
                  <IconButton onPress={toggleSearch}>
                     <BackArrowIcon color={themeColorPalatte.iconColor} />
                  </IconButton>
                  <TextInput
                     placeholderTextColor={themeColorPalatte.placeholderTextColor}
                     value={searchText}
                     style={[styles.inputstyle, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}
                     onChangeText={handleSearch}
                     placeholder={stringSet.PLACEHOLDERS.SEARCH_PLACEHOLDER}
                     autoFocus={true}
                     autoCorrect={false}
                     cursorColor={themeColorPalatte.primaryColor}
                     selectionColor={themeColorPalatte.primaryColor}
                  />
                  {Boolean(searchText) && (
                     <IconButton containerStyle={commonStyles.marginRight_8} onPress={clearSearch}>
                        <CloseIcon width={'17'} height={'17'} color={themeColorPalatte.iconColor} />
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
            <View style={[commonStyles.flex1_centeredContent, { backgroundColor: themeColorPalatte.screenBgColor }]}>
               <ActivityIndicator size={'large'} color={themeColorPalatte.primaryColor} />
            </View>
         </>
      );
   }

   return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={commonStyles.flex1}>
         {renderHeader()}
         <View style={[commonStyles.bg_color(themeColorPalatte.screenBgColor), { height: '100%' }]}>
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
                  initialNumToRender={10}
                  maxToRenderPerBatch={20}
                  onScrollToIndexFailed={doNothing}
                  scrollEventThrottle={1}
                  windowSize={10}
                  onEndReachedThreshold={1}
                  disableVirtualization={true}
               />
            ) : (
               <View style={styles.NoContact}>
                  <Text style={[styles.NoContactTitle, commonStyles.textColor(themeColorPalatte.secondaryTextColor)]}>
                     {stringSet.COMMON_TEXT.NO_RESULTS_FOUND}
                  </Text>
               </View>
            )}
         </View>
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

export default MobileContacts;

const styles = StyleSheet.create({
   HeaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
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
   },
   SearchOption: {
      marginRight: 15,
   },
   SelectedItem: {
      fontSize: 14,
      fontWeight: '400',
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
      marginVertical: 10,
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
