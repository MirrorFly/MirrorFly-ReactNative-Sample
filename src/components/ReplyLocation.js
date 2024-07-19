import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import mapStaticBlurImage from '../assets/google-maps-blur.png';
import { ClearTextIcon, LocationMarkerIcon } from '../common/Icons';
import NickName from '../common/NickName';
import { getImageSource, getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

const ReplyLocation = props => {
   const { replyMsgItems, handleRemove } = props;
   const { publisherJid } = replyMsgItems;
   const isSender = publisherJid === getCurrentUserJid();

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <View style={styles.container}>
         <View>
            {isSender ? (
               <Text color={'#000'} fontSize={14} mb={1} pl={1} fontWeight={600} py="0">
                  You
               </Text>
            ) : (
               <NickName style={commonStyles.userName} userId={getUserIdFromJid(publisherJid)} />
            )}
         </View>
         <View style={styles.replyMessageSection}>
            <Image resizeMode="cover" style={styles.mapStaticImage} source={getImageSource(mapStaticBlurImage)} />

            <Pressable style={styles.clearButton} onPress={RemoveHandle}>
               <ClearTextIcon />
            </Pressable>
         </View>

         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <LocationMarkerIcon color={'#7285B5'} />
            <Text pl={1} fontSize={14} color={'#313131'} fontWeight={400}>
               Location
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
