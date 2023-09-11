import { showToast } from '../Helper/index';
import { View, Text } from 'native-base';
import React from 'react';
import {
  Image,
  Pressable,
  Linking,
  ImageBackground,
  Platform,
} from 'react-native';
import ic_baloon from '../assets/ic_baloon.png';
import mapImage from '../assets/google-maps-blur.png';
import { getImageSource } from '../common/utils';
import ReplyMessage from './ReplyMessage';
import { StyleSheet } from 'react-native';

const MapCard = ({
  status,
  timeStamp,
  handleReplyPress,
  message,
  isSender,
}) => {
  const {
    msgBody: { replyTo = '' },
  } = message;

  const mapHandler = () => {
    const { latitude = '', longitude = '' } = message.msgBody?.location || {};
    // const locationUrl =
    //   Platform.OS === 'ios'
    //     ? ''
    //     : 'https://www.google.co.in/maps/place/CONTUS+TECH/@13.0104824,80.2064899,17z/data=!3m2!4b1!5s0x3a5267401095b6c3:0x8e18de1ed0748b0a!4m6!3m5!1s0x3a5260d084dc54cd:0xb3e84ab20dc3785e!8m2!3d13.0104824!4d80.2090648!16s%2Fg%2F1tjym3x5?entry=ttu';

    const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const label = '';
    const locationUrl = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}`,
    });
    if (Linking.canOpenURL(locationUrl)) {
      Linking.openURL(locationUrl).catch(() => {
        showToast('Unable to open the location', {
          id: 'location-open-error-toast',
        });
      });
    } else {
      showToast('No app found to open location', {
        id: 'location-open-error-toast',
      });
    }
  };

  console.log('Message object', JSON.stringify(message.msgBody, null, 2));

  return (
    <View borderColor={'#E2E8F7'} borderWidth={2} borderRadius={10}>
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={message}
          isSame={isSender}
        />
      )}
      <View width={195} height={170}>
        <Pressable onPress={mapHandler}>
          <Image
            source={getImageSource(mapImage)}
            resizeMode="cover"
            style={styles.staticMapImage}
          />
        </Pressable>
        <View position="absolute" borderRadius={10} bottom={0.4} right={1}>
          <ImageBackground
            source={getImageSource(ic_baloon)}
            style={styles.imageBackground}>
            {status}
            <Text pl={1} pr="2" color="#FFF" fontSize="10" fontWeight={400}>
              {timeStamp}
            </Text>
          </ImageBackground>
        </View>
      </View>
    </View>
  );
};
export default MapCard;

const styles = StyleSheet.create({
  staticMapImage: {
    width: 194,
    height: 171,
    borderRadius: 8,
  },
  imageBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 130,
    resizeMode: 'cover',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
});
