import {
  getLocationImageURL,
  openLocationExternally,
  showCheckYourInternetToast,
} from '../Helper/index';
import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, View, Text } from 'react-native';
import ic_baloon from '../assets/ic_baloon.png';
import { getImageSource } from '../common/utils';
import ReplyMessage from './ReplyMessage';
import mapStaticFallbackImage from '../assets/google-maps-blur.png';
import { useNetworkStatus } from '../hooks';
import ApplicationColors from '../config/appColors';
import commonStyles from '../common/commonStyles';
import MessagePressable from '../common/MessagePressable';

const MapCard = ({
  status,
  timeStamp,
  handleReplyPress,
  handleContentPress,
  handleContentLongPress,
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

  const handleMapPress = () => {
    if (handleContentPress) {
      handleContentPress();
    } else {
      if (!isInternetReachable) {
        showCheckYourInternetToast();
        return;
      }
      openLocationExternally(latitude, longitude);
    }
  };

  const handleImageLoadError = () => {
    setIsImageLoadingError(true);
  };

  return (
    <View style={[styles.container, replyTo && commonStyles.paddingTop_0]}>
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={message}
          isSame={isSender}
        />
      )}
      <MessagePressable
        onPress={handleMapPress}
        onLongPress={handleContentLongPress}>
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
      </MessagePressable>
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
