import {
  getLocationImageURL,
  openLocationExternally,
  showCheckYourInternetToast,
} from '../Helper/index';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
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

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isImageLoadingError, setIsImageLoadingError] = useState(false);

  const isInternetReachable = useNetworkStatus();

  const { latitude = '', longitude = '' } = message.msgBody?.location || {};

  const locationImageUrl = React.useMemo(() => {
    return getLocationImageURL({ latitude, longitude });
  }, [latitude, longitude]);

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
    setIsImageLoading(false);
  };

  const handleImageLoadStart = () => {
    setIsImageLoading(true);
  };

  const handleImageLoadEnd = () => {
    setIsImageLoading(false);
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
        onLongPress={handleContentLongPress}
        contentContainerStyle={commonStyles.positionRelative}>
        <Image
          source={
            isImageLoadingError
              ? getImageSource(mapStaticFallbackImage)
              : { uri: locationImageUrl, cache: 'force-cache' }
          }
          onLoadStart={handleImageLoadStart}
          onLoadEnd={handleImageLoadEnd}
          resizeMode="cover"
          style={styles.mapImage}
          onError={handleImageLoadError}
        />
        {isImageLoading && (
          <View style={styles.imageLoaderWrapper}>
            <ActivityIndicator
              size={'large'}
              color={ApplicationColors.mainColor}
            />
          </View>
        )}
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
    resizeMode: 'cover',
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
  imageLoaderWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignContent: 'center',
  },
});
