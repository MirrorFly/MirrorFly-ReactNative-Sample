import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ScreenHeader from '../ScreenHeader';
import { PhoneIcon, ContactInfoIcon, SendBlueIcon } from '../../common/Icons';

const ContactInfo = props => {
  const { handleClose, contactItem } = props;

  const renderSelectedContacts = () => {
    return contactItem.map(item => (
      <ScrollView key={item.recordID} showsVerticalScrollIndicator={true}>
        <View>
          <View style={styles.SelectedItemContainer}>
            <View style={styles.SelectedIcon}>
              <ContactInfoIcon />
            </View>

            <Text style={styles.selectcontactName}>{item.displayName}</Text>
          </View>
          <View style={styles.itemSeperator} />
          <View
            key={item?.phoneNumbers[0]?.id}
            style={styles.SelectedItemContainer}>
            <View style={{ marginLeft: 10 }}>
              <PhoneIcon />
            </View>
            <View style={styles.NumberContainer}>
              <Text style={styles.NumberText}>
                {item?.phoneNumbers[1]?.number}
              </Text>
              <Text style={styles.MobileText}>Mobile</Text>
            </View>
          </View>
          <View style={styles.itemMobileNumSeperator} />
        </View>
      </ScrollView>
    ));
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerSubContainer}>
        <ScreenHeader title="send contacts" onhandleBack={handleClose} />
      </View>
      <ScrollView showsVerticalScrollIndicator={true}>
        <View style={styles.contactItem}>{renderSelectedContacts()}</View>
      </ScrollView>

      <Pressable
        onPress={console.log('ok ok')}
        style={styles.elevationContainer}>
        <View style={styles.ArrowIcon}>
          <SendBlueIcon />
        </View>
      </Pressable>
    </View>
  );
};

export default ContactInfo;

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
    padding: 12,
    width: 45,
    marginLeft: 8,
    marginTop: 10,
    backgroundColor: '#9D9D9D',
    borderRadius: 25,
  },
  contactItem: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  itemSeperator: {
    paddingTop: 10,
    borderBottomColor: '#00000036',
    borderBottomWidth: 0.5,
  },
  itemMobileNumSeperator: {
    paddingTop: 10,
    borderBottomColor: '#00000036',
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#00000014',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
  SelectedItemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  selectcontactName: {
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
    marginTop: 8,
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
});
