import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import { AudioWhileIcon, PlayIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import { useChatMessage } from '../hooks/useChatMessage';

const AudioWhileIconComponent = () => AudioWhileIcon();

function MediaTile({ item, onDelete }) {
   let numColumns = 4;
   const { width } = Dimensions.get('window');
   const tileSize = width / numColumns;
   const message = useChatMessage(item.msgId);
   const {
      deleteStatus,
      recallStatus,
      msgBody: {
         media: { thumb_image = '', local_path = '', is_downloaded, is_uploading } = {},
         message_type = '',
      } = {},
   } = message;
   const thumbURL = local_path || getThumbBase64URL(thumb_image);

   if (deleteStatus !== 0 || recallStatus !== 0 || is_downloaded !== 2 || is_uploading !== 2) {
      onDelete(item.msgId);
      return null;
   }

   if (['image', 'video'].includes(message_type)) {
      return (
         <View
            style={[
               {
                  width: tileSize,
                  height: tileSize,
               },
               styles.mediaTile,
            ]}>
            <Image
               source={{ uri: message_type === 'video' ? getThumbBase64URL(thumb_image) : thumbURL }}
               style={styles.imageView}
            />

            {message_type === 'video' && (
               <View style={styles.playIconWrapper}>
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
            {<AudioWhileIconComponent />}
         </View>
      );
   }
}

export default MediaTile;

const styles = StyleSheet.create({
   mediaTile: {
      backgroundColor: '#f2f2f2',
      padding: 2,
   },
   imageView: { flex: 1, resizeMode: 'cover' },
   playIconWrapper: {
      backgroundColor: ApplicationColors.mainbg,
      position: 'absolute',
      top: '50%',
      left: '50%',
      // transforming X and Y for actual width of the icon plus the padding divided by 2 to make it perfectly centered ( 15(width) + 12(padding) / 2 = 13.5 )
      transform: [{ translateX: -13.5 }, { translateY: -13.5 }],
      elevation: 5,
      shadowColor: ApplicationColors.shadowColor,
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
