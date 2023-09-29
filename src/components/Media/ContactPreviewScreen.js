import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ScreenHeader from '../ScreenHeader';
import { PhoneIcon, ContactInfoIcon, SendBlueIcon } from '../../common/Icons';
import commonStyles from '../../common/commonStyles';
import { Checkbox } from 'native-base';
import { CHATCONVERSATION } from '../../constant';

const ContactPreviewScreen = ({
  handleClose,
  contactItems,
  handleSendMsg,
  setLocalNav,
}) => {
  const [selectedContacts, setSelectedContacts] = React.useState([]);

  React.useEffect(() => {
    const processedContactsWithCheckbox = contactItems.map(item => {
      const updatedNumbers = item.phoneNumbers.map(num => ({
        ...num,
        isChecked: true,
      }));
      item.phoneNumbers = updatedNumbers;
      return item;
    });
    setSelectedContacts(processedContactsWithCheckbox);
  }, []);

  const handleSendContacts = () => {
    const _selectedContacts = selectedContacts.map(contact => {
      const filteredPhoneNumbers = [];
      contact.phoneNumbers.forEach(number => {
        if (number.isChecked) {
          filteredPhoneNumbers.push(number.number?.replace(/[ ()-]/gi, ''));
        }
      });
      contact.phoneNumbers = filteredPhoneNumbers;
      return {
        name: contact.displayName,
        phone_number: filteredPhoneNumbers,
        active_status: Array(filteredPhoneNumbers.length).fill('0'), // filling activeStatus as '0' for all numbers
      };
    });
    const contactObj = {
      type: 'contact',
      contacts: _selectedContacts,
    };
    handleSendMsg(contactObj);
    setLocalNav(CHATCONVERSATION);
  };

  const toggleNumberSelection = (contactIndex, numberIndex) => () => {
    const updatedData = [...selectedContacts];
    if (updatedData[contactIndex]?.phoneNumbers?.[numberIndex]?.isChecked) {
      updatedData[contactIndex].phoneNumbers[numberIndex].isChecked = false;
    } else {
      updatedData[contactIndex].phoneNumbers[numberIndex].isChecked = true;
    }
    setSelectedContacts(updatedData);
  };

  const renderSelectedContacts = () => {
    return selectedContacts.map((item, contactIndex) => {
      const showCheckbox = item.phoneNumbers?.length > 1;
      const disableUnCheck =
        showCheckbox &&
        item.phoneNumbers?.filter(i => Boolean(i.isChecked)).length === 1;

      return (
        <React.Fragment key={item.recordID}>
          <View style={styles.SelectedItemContainer}>
            <View style={styles.SelectedIcon}>
              <ContactInfoIcon />
            </View>

            <Text
              style={styles.selectcontactName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.displayName}
            </Text>
          </View>
          <View style={styles.itemSeperator} />
          {item.phoneNumbers?.map((num, numberIndex) => (
            <View key={num?.number} style={styles.SelectedItemContainer}>
              <View
                style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                <View style={commonStyles.marginLeft_10}>
                  <PhoneIcon />
                </View>
                <View style={styles.NumberContainer}>
                  <Text style={styles.NumberText}>{num.number}</Text>
                  <Text style={styles.MobileText}>{num.label}</Text>
                </View>
              </View>
              {showCheckbox && (
                <Checkbox
                  isDisabled={num.isChecked && disableUnCheck}
                  isChecked={num.isChecked}
                  onChange={toggleNumberSelection(contactIndex, numberIndex)}
                  _checked={{
                    backgroundColor: '#30C076',
                    borderColor: '#30C076',
                  }}
                  _pressed={{
                    backgroundColor: '#30C076',
                    borderColor: '#30C076',
                  }}
                />
              )}
            </View>
          ))}
          <View style={styles.itemMobileNumSeperator} />
        </React.Fragment>
      );
    });
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerSubContainer}>
        <ScreenHeader title="Send contacts" onhandleBack={handleClose} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.contactList}>
        {renderSelectedContacts()}
        <View style={styles.bottomPlaceholderForScroll} />
      </ScrollView>

      <Pressable onPress={handleSendContacts} style={styles.elevationContainer}>
        <View style={styles.ArrowIcon}>
          <SendBlueIcon />
        </View>
      </Pressable>
    </View>
  );
};

export default ContactPreviewScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
  },
  headerSubContainer: {
    backgroundColor: '#4879F9',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    elevation: 3,
  },
  SelectedIcon: {
    marginTop: 10,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 1,
    backgroundColor: '#9D9D9D',
    borderRadius: 25,
  },
  contactList: {
    marginVertical: 5,
  },
  itemSeperator: {
    paddingTop: 10,
    borderBottomColor: '#00000036',
    borderBottomWidth: 0.5,
  },
  itemMobileNumSeperator: {
    paddingTop: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    elevation: 1,
  },
  SelectedItemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  selectcontactName: {
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
    marginTop: 8,
    flex: 1,
  },
  NumberText: {
    marginLeft: 20,
    marginTop: 6,
    fontSize: 11,
    color: '#181818',
  },
  MobileText: {
    marginLeft: 23,
    marginTop: 3,
    fontSize: 10,
    marginBottom: 10,
    color: '#737373',
  },
  ArrowIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  NumberContainer: {
    flexDirection: 'column',
    marginVertical: 6,
  },
  elevationContainer: {
    position: 'absolute',
    backgroundColor: '#4879F9',
    width: 20,
    height: 20,
    padding: 25,
    borderRadius: 30,
    zIndex: 1,
    bottom: 20,
    right: 15,
  },
  sendButton: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPlaceholderForScroll: {
    width: '100%',
    height: 75,
  },
});
