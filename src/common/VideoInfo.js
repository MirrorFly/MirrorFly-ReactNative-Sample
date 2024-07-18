import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import RNConvertPhAsset from 'react-native-convert-ph-asset';
import { AudioMusicIcon, PlayIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import { getThumbBase64URL } from '../helpers/chatHelpers';
import { VIDEO_PLAYER_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

const VideoInfo = props => {
   const navigation = useNavigation();
   const { item: galleryItem = {}, selectedMedia = {}, audioOnly = false } = props;
   const SingleSelectedImage = selectedMedia.media;
   let item = galleryItem;
   if (SingleSelectedImage?.local_path) {
      item = {
         fileDetails: {
            uri: SingleSelectedImage.local_path,
            height: SingleSelectedImage.originalHeight,
            width: SingleSelectedImage.originalWidth,
         },
         thumbImage: SingleSelectedImage.thumb_image,
      };
   } else if (SingleSelectedImage) {
      item = {
         ...SingleSelectedImage.file,
         thumbImage: SingleSelectedImage.thumb_image,
      };
   }
   const { fileDetails: { uri = '' } = {}, thumbImage = '' } = item;

   React.useLayoutEffect(() => {
      if (Platform.OS === 'ios' && uri.includes('ph://')) {
         RNConvertPhAsset.convertVideoFromUrl({
            url: uri,
            convertTo: 'mov',
            quality: 'original',
         })
            .then(response => {
               item.fileDetails = { ...item.fileDetails, videoUri: response.path };
            })
            .catch(err => {
               mflog(err);
            });
      } else {
         item.fileDetails = { ...item.fileDetails, videoUri: uri };
      }
   }, []);

   const handleVideoPlayButton = () => {
      navigation.navigate(VIDEO_PLAYER_SCREEN, { item, audioOnly });
   };

   return (
      <View style={[styles.player, audioOnly ? styles.audioOnly : styles.video]}>
         {audioOnly && (
            <View style={[commonStyles.flex1, commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
               <AudioMusicIcon width={200} height={200} />
            </View>
         )}
         <Pressable onPress={handleVideoPlayButton} style={[styles.playIconWrapper]}>
            <View style={styles.playIconWrapper}>
               <PlayIcon width={15} height={15} />
            </View>
         </Pressable>
         {!audioOnly && (
            <Image
               style={[commonStyles.flex1, commonStyles.resizeContain]}
               source={{ uri: thumbImage ? getThumbBase64URL(thumbImage) : uri }}
            />
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   player: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
   video: {},
   audioOnly: {
      backgroundColor: '#97A5C7',
   },
   videoPlayerContainer: { width: '100%', height: '100%', zIndex: 1 },
   playIconWrapper: {
      zIndex: 10,
      backgroundColor: ApplicationColors.mainbg,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -13.5 }, { translateY: -13.5 }],
      elevation: 5,
      shadowColor: ApplicationColors.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      padding: 12,
      borderRadius: 50,
   },
});

export default VideoInfo;
