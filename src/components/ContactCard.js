import { Image } from 'react-native';
import React from 'react';
import BG from '../assets/BG.png';
import { View, Text, HStack } from 'native-base';
import { getImageSource } from '../common/utils';

const ContactCard = props => {
  const ContactInfo = props.data.msgBody.nickName;

  return (
    <View
      borderWidth={props.isSame ? 0 : 0.25}
      borderColor={'#959595'}
      bgColor={props.isSame ? '#E2E8F7' : '#fff'}
      borderRadius={5}>
      <View
        flex={1}
        width={210}
        mx={1.2}
        my={0.9}
        height={100}
        position={'relative'}>
        <View
          style={{
            paddingTop: 12,
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={getImageSource(BG)}
            resizeMode="cover"
            style={{
              alignItems: 'center',
              width: 30,
              height: 30,
              borderRadius: 20,
            }}
          />
          <Text
            style={{
              color: '#000',
              fontSize: 12,
              fontWeight: '400',
              paddingLeft: 5,
            }}>
            {ContactInfo}
          </Text>
        </View>
        <HStack
          style={{
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 0.8,
          }}>
          {props.status}
          <Text style={{ color: '#000', fontSize: 10, paddingRight: 6 }}>
            {' '}
            {props.timeStamp}{' '}
          </Text>
        </HStack>
        <View style={{ borderWidth: 0.2, borderColor: '#BFBFBF' }} />
        <View style={{ justifyContent: 'center', marginTop: 5 }}>
          <Text
            style={{
              color: '#000',
              fontSize: 12,
              fontWeight: '500',
              textAlign: 'center',
            }}>
            Invite
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ContactCard;
