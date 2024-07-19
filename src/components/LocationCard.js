import React, { useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import mapStaticFallbackImage from '../assets/google-maps-blur.png';
import ic_baloon from '../assets/ic_baloon.png';
import { useNetworkStatus } from '../common/hooks';
import { getConversationHistoryTime } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import {
   getImageSource,
   getLocationImageURL,
   getMessageStatus,
   getUserIdFromJid,
   openLocationExternally,
   showCheckYourInternetToast,
} from '../helpers/chatHelpers';
import { toggleMessageSelection } from '../redux/chatMessageDataSlice';
import { getChatMessages } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import MessagePressable from './MessagePressable';

const LocationCard = ({ chatUser, item, isSender }) => {
   const {
      msgId,
      msgStatus,
      createdAt,
      msgBody: { replyTo = '' },
   } = item;
   const userId = getUserIdFromJid(chatUser);
   const dispatch = useDispatch();
   const [isImageLoading, setIsImageLoading] = useState(false);
   const [isImageLoadingError, setIsImageLoadingError] = useState(false);

   const isInternetReachable = useNetworkStatus();

   const { latitude = '', longitude = '' } = item.msgBody?.location || {};

   const locationImageUrl = React.useMemo(() => {
      return getLocationImageURL({ latitude, longitude });
   }, [latitude, longitude]);

   const handleMapPress = () => {
      const isAnySelected = getChatMessages(userId).some(item => item.isSelected === 1);
      if (isAnySelected) {
         onLongPress();
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

   const onLongPress = () => {
      const selectData = {
         chatUserId: userId,
         msgId,
      };
      dispatch(toggleMessageSelection(selectData));
   };

   return (
      <View style={[styles.container, replyTo && commonStyles.paddingTop_0]}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSame={isSender} />}
         <MessagePressable
            onPress={handleMapPress}
            onLongPress={onLongPress}
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
                  <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} />
               </View>
            )}
         </MessagePressable>
         <View style={styles.statusWithTimestampContainer}>
            <ImageBackground source={getImageSource(ic_baloon)} style={styles.imageBackground}>
               {isSender && getMessageStatus(msgStatus)}
               <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
            </ImageBackground>
         </View>
      </View>
   );
};
export default LocationCard;

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
