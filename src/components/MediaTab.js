import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { AudioWhileIcon, PlayIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { getThumbBase64URL } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useMediaMessages, useThemeColorPalatte } from '../redux/reduxHook';
import { getMessageTypeCount } from '../screens/ViewAllMedia';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

const AudioWhileIconComponent = () => AudioWhileIcon();

const MediaTab = ({ chatUserId }) => {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const mediaMessages = useMediaMessages(chatUserId, ['image', 'video', 'audio']);
   const navigation = useNavigation();
   let numColumns = 4;
   const { width } = Dimensions.get('window');
   const tileSize = width / numColumns;

   const renderImageCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'image') > 1
         ? getMessageTypeCount(mediaMessages, 'image') + ' Photos'
         : getMessageTypeCount(mediaMessages, 'image') + ' Photo';
   };

   const renderVideoCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'video') > 1
         ? getMessageTypeCount(mediaMessages, 'video') + ' Videos'
         : getMessageTypeCount(mediaMessages, 'video') + ' Video';
   };

   const renderAudioCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'audio') > 1
         ? getMessageTypeCount(mediaMessages, 'audio') + ' Audios'
         : getMessageTypeCount(mediaMessages, 'audio') + ' Audio';
   };

   const renderMediaFooter = () => {
      return (
         <>
            {mediaMessages.length > 0 && (
               <Text style={[commonStyles.textCenter, { color: themeColorPalatte.primaryTextColor }]}>
                  {renderImageCountLabel()}, {renderVideoCountLabel()}, {renderAudioCountLabel()}
               </Text>
            )}
         </>
      );
   };

   const renderTileBasedOnMessageType = item => {
      const {
         deleteStatus = 0,
         recallStatus = 0,
         msgBody: {
            media: { thumb_image = '', local_path = '', is_downloaded, is_uploading } = {},
            message_type = '',
         } = {},
      } = item;
      const thumbURL = local_path || getThumbBase64URL(thumb_image);

      if (
         (deleteStatus !== undefined && deleteStatus !== 0) ||
         (recallStatus !== undefined && recallStatus !== 0) ||
         is_downloaded !== 2 ||
         is_uploading !== 2
      ) {
         return null;
      }
      if (['image', 'video'].includes(message_type)) {
         return (
            <View
               style={[
                  {
                     width: tileSize,
                     height: tileSize,
                     backgroundColor: themeColorPalatte.screenBgColor,
                  },
                  styles.mediaTile,
               ]}>
               <Image
                  source={{ uri: message_type === 'video' ? getThumbBase64URL(thumb_image) : thumbURL }}
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
      if (['audio'].includes(message_type)) {
         return (
            <View
               style={[
                  commonStyles.justifyContentCenter,
                  commonStyles.alignItemsCenter,
                  styles.aduioTile,
                  { width: tileSize - 4, height: tileSize - 4 },
               ]}>
               <AudioWhileIconComponent />
            </View>
         );
      }
   };

   const renderMediaTile = ({ item }) => {
      const handleMediaPress = () => {
         navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid: chatUserId, msgId: item.msgId });
      };
      return <Pressable onPress={handleMediaPress}>{renderTileBasedOnMessageType(item)}</Pressable>;
   };

   return (
      <FlatList
         numColumns={4}
         keyExtractor={item => item.msgId}
         data={mediaMessages}
         bounces={false}
         ListFooterComponent={renderMediaFooter}
         renderItem={renderMediaTile}
         initialNumToRender={20}
         maxToRenderPerBatch={20}
         windowSize={15}
         ListEmptyComponent={
            <View
               style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.height_100_per]}>
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
   mediaTile: {
      padding: 2,
   },
   imageView: { flex: 1, resizeMode: 'cover' },
   playIconWrapper: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      // transforming X and Y for actual width of the icon plus the padding divided by 2 to make it perfectly centered ( 15(width) + 12(padding) / 2 = 13.5 )
      transform: [{ translateX: -13.5 }, { translateY: -13.5 }],
      elevation: 5,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      padding: 6,
      borderRadius: 50,
   },
   aduioTile: {
      marginTop: 2,
      backgroundColor: '#97A5C7',
      padding: 2,
      marginHorizontal: 2,
   },
});
