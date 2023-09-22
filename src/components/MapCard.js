import { showToast } from '../Helper/index';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Linking,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import ic_baloon from '../assets/ic_baloon.png';
import { getImageSource } from '../common/utils';
import config from './chat/common/config';
import ReplyMessage from './ReplyMessage';
import mapStaticFallbackImage from '../assets/google-maps-blur.png';
import { useNetworkStatus } from '../hooks';
import ApplicationColors from '../config/appColors';

const MAP_URL = 'https://maps.googleapis.com/maps/api/staticmap';

const getLocationImageURL = ({ latitude, longitude }) => {
  return `${MAP_URL}?center=${latitude},${longitude}&zoom=15&size=195x170&markers=color:red|${latitude},${longitude}&key=${config.GOOGLE_LOCATION_API_KEY}`;
};

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

  const { latitude = '', longitude = '' } = message.msgBody?.location || {};

  const locationImageUrl = React.useMemo(() => {
    return getLocationImageURL({ latitude, longitude });
  }, [latitude, longitude]);

  const isInternetReachable = useNetworkStatus();

  const [isImageLoadingError, setIsImageLoadingError] = useState(false);

  const mapHandler = () => {
    if (!isInternetReachable) {
      showToast('Please check your internet connection', {
        id: 'map-opening-no-internet-toast',
      });
      return;
    }
    const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const locationUrl = Platform.select({
      ios: `${scheme}${latLng}`,
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

  const handleImageLoadError = () => {
    setIsImageLoadingError(true);
  };

  return (
    <View style={styles.container}>
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={message}
          isSame={isSender}
        />
      )}
      <Pressable onPress={mapHandler}>
        <Image
          source={
            isImageLoadingError
              ? getImageSource(mapStaticFallbackImage)
              : { uri: locationImageUrl, cache: 'force-cache' }
          }
          resizeMode="cover"
          style={styles.mapImage}
          onError={handleImageLoadError}
        />
      </Pressable>
      <View style={styles.statusWithTimestampContainer}>
        <ImageBackground
          source={getImageSource(ic_baloon)}
          style={styles.imageBackground}>
          {status}
          <Text style={styles.timeStampText}>{timeStamp}</Text>
        </ImageBackground>
      </View>
    </View>
  );
};
export default MapCard;

const styles = StyleSheet.create({
  container: {
    padding: 4,
    width: 203,
    height: 178,
  },
  mapImage: {
    width: 195,
    height: 170,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  statusWithTimestampContainer: {
    position: 'absolute',
    borderRadius: 10,
    bottom: 4,
    right: 4,
  },
  imageBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 130,
    resizeMode: 'cover',
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  timeStampText: {
    paddingLeft: 4,
    paddingRight: 8,
    color: ApplicationColors.white,
    fontSize: 10,
    fontWeight: '400',
  },
});
