import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import mapStaticBlurImage from '../assets/google-maps-blur.png';
import { ClearTextIcon, LocationMarkerIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Text from '../common/Text';
import { getImageSource, getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

const ReplyLocation = props => {
   const { replyMsgItems, handleRemove, stringSet } = props;
   const { publisherJid } = replyMsgItems;

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <View style={styles.container}>
         <NickName style={commonStyles.userName} userId={getUserIdFromJid(publisherJid)} />
         <View style={styles.replyMessageSection}>
            <Image resizeMode="cover" style={styles.mapStaticImage} source={getImageSource(mapStaticBlurImage)} />

            <Pressable style={styles.clearButton} onPress={RemoveHandle}>
               <ClearTextIcon />
            </Pressable>
         </View>

         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <LocationMarkerIcon color={'#7285B5'} />
            <Text pl={1} fontSize={14} color={'#313131'} fontWeight={400} style={{ paddingHorizontal: '4' }}>
               {stringSet.COMMON_TEXT.LOCATION_MSG_TYPE}
            </Text>
         </View>
      </View>
   );
};

export default ReplyLocation;

const styles = StyleSheet.create({
   container: { position: 'relative' },
   replyMessageSection: {
      width: 70,
      height: 64,
      alignItems: 'flex-end',
      position: 'absolute',
      top: -12,
      bottom: 0,
      right: -10,
   },
   mapStaticImage: { width: 60, height: 69 },
   clearButton: {
      padding: 5,
      top: -65,
      right: 10,
      bottom: 0,
      backgroundColor: '#FFF',
      borderRadius: 20,
   },
});
