import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { AudioWhileIcon, PlayIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { getThumbBase64URL } from '../helpers/chatHelpers';
import { useMergedMediaMessages } from '../hooks/useMediaMessaegs';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import { getMessageTypeCount } from '../screens/ViewAllMedia';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

const MediaTab = ({ chatUserId, jid }) => {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const { mergedMediaMessages, isLoading } = useMergedMediaMessages(jid, ['image', 'video', 'audio']);
   const navigation = useNavigation();
   const { width } = Dimensions.get('window');
   const numColumns = 4;
   const tileSize = width / numColumns;

   const renderImageCountLabel = useMemo(() => {
      const count = getMessageTypeCount(mergedMediaMessages, 'image');
      return count > 1 ? `${count} Photos` : `${count} Photo`;
   }, [mergedMediaMessages]);

   const renderVideoCountLabel = useMemo(() => {
      const count = getMessageTypeCount(mergedMediaMessages, 'video');
      return count > 1 ? `${count} Videos` : `${count} Video`;
   }, [mergedMediaMessages]);

   const renderAudioCountLabel = useMemo(() => {
      const count = getMessageTypeCount(mergedMediaMessages, 'audio');
      return count > 1 ? `${count} Audios` : `${count} Audio`;
   }, [mergedMediaMessages]);

   const renderMediaFooter = () =>
      mergedMediaMessages.length > 0 && (
         <>
            <Text style={[commonStyles.textCenter, { color: themeColorPalatte.primaryTextColor }]}>
               {renderImageCountLabel}, {renderVideoCountLabel}, {renderAudioCountLabel}
            </Text>
            {isLoading && <ActivityIndicator size={'large'} color={themeColorPalatte.primaryColor} />}
         </>
      );

   const renderTileBasedOnMessageType = useCallback(
      item => {
         const {
            deleteStatus = 0,
            recallStatus = 0,
            msgBody: { media: { thumb_image = '', is_downloaded, is_uploading } = {}, message_type = '' } = {},
         } = item;

         if (deleteStatus !== 0 || recallStatus !== 0 || is_downloaded !== 2 || is_uploading !== 2) {
            return null;
         }

         if (['image', 'video'].includes(message_type)) {
            return (
               <View
                  style={[
                     { width: tileSize, height: tileSize, backgroundColor: themeColorPalatte.screenBgColor },
                     styles.mediaTile,
                  ]}>
                  <Image
                     source={{
                        uri: message_type === 'video' ? getThumbBase64URL(thumb_image) : getThumbBase64URL(thumb_image),
                     }}
                     style={styles.imageView}
                  />
                  {message_type === 'video' && (
                     <View
                        style={[
                           styles.playIconWrapper,
                           {
                              backgroundColor: themeColorPalatte.colorOnPrimary,
                              shadowColor: themeColorPalatte.shadowColor,
                           },
                        ]}>
                        <PlayIcon width={10} height={10} />
                     </View>
                  )}
               </View>
            );
         }

         if (message_type === 'audio') {
            return (
               <View
                  style={[
                     commonStyles.justifyContentCenter,
                     commonStyles.alignItemsCenter,
                     styles.audioTile,
                     { width: tileSize - 4, height: tileSize - 4 },
                  ]}>
                  <AudioWhileIcon />
               </View>
            );
         }
      },
      [themeColorPalatte, tileSize],
   );

   const renderMediaTile = useCallback(
      ({ item }) => {
         const handleMediaPress = () => {
            navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid, msgId: item.msgId });
         };
         return (
            <Pressable contentContainerStyle={{}} onPress={handleMediaPress}>
               {renderTileBasedOnMessageType(item)}
            </Pressable>
         );
      },
      [chatUserId, renderTileBasedOnMessageType],
   );

   return (
      <FlatList
         numColumns={numColumns}
         horizontal={false}
         keyExtractor={item => item.msgId}
         data={mergedMediaMessages}
         bounces={false}
         ListFooterComponent={renderMediaFooter}
         renderItem={renderMediaTile}
         initialNumToRender={20}
         maxToRenderPerBatch={20}
         windowSize={15}
         ListEmptyComponent={
            <View
               style={[
                  commonStyles.justifyContentCenter,
                  commonStyles.alignItemsCenter,
                  commonStyles.height_100_per,
                  commonStyles.mt_12,
               ]}>
               <Text style={{ color: themeColorPalatte.primaryTextColor }}>
                  {stringSet.VIEW_ALL_MEDIA_SCREEN.NO_MEDIA_FOUND}
               </Text>
            </View>
         }
      />
   );
};

export default React.memo(MediaTab);

const styles = StyleSheet.create({
   mediaTile: { padding: 2 },
   imageView: { flex: 1, resizeMode: 'cover' },
   playIconWrapper: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -11.5 }, { translateY: -11.5 }],
      elevation: 5,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      padding: 6,
      borderRadius: 50,
   },
   audioTile: {
      marginTop: 2,
      backgroundColor: '#97A5C7',
      padding: 2,
      marginHorizontal: 2,
   },
});
