import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import BG from '../assets/BG.png';
import { getImageSource } from '../common/utils';

const ContactCard = props => {
  const ContactInfo = props.data.msgBody.nickName;

  return (
    <View style={styles.container}>
      <View style={styles.contactInfo}>
        <Image source={getImageSource(BG)} style={styles.imageBackground} />
        <Text style={styles.contactNickname}>{ContactInfo}</Text>
      </View>
      <View style={styles.timeStampWrapper}>
        {props.status}
        <Text style={styles.timeStampText}>{props.timeStamp} </Text>
      </View>
      <View style={styles.borderLine} />
      <View style={styles.inviteTextWrapper}>
        <Text style={styles.inviteText}>Invite</Text>
      </View>
    </View>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  container: {
    width: 210,
    marginHorizontal: 6,
    marginVertical: 4,
    height: 100,
    position: 'relative',
  },
  contactInfo: {
    paddingTop: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBackground: {
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  contactNickname: {
    color: '#000',
    fontSize: 12,
    fontWeight: '400',
    paddingLeft: 5,
  },
  timeStampWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 0.8,
  },
  timeStampText: {
    color: '#000',
    fontSize: 10,
    paddingRight: 6,
    fontWeight: '400',
  },
  borderLine: { borderWidth: 0.2, borderColor: '#BFBFBF' },
  inviteTextWrapper: { justifyContent: 'center', marginTop: 5 },
  inviteText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
