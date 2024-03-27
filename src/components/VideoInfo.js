import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import { AudioMusicIcon, PlayIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import { VIDEO_PLAYER_SCREEN } from '../constant';

const VideoInfo = props => {
   const navigation = useNavigation();
   const {
      item: galleryItem = {},
      selectedMedia = {},
      audioOnly = false,
      forcePause: { mediaForcePause } = {},
   } = props;
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
   const { fileDetails: { uri } = {}, thumbImage = '' } = item;
   const handleVideoPlayButton = () => {
      navigation.navigate(VIDEO_PLAYER_SCREEN, { item });
   };

   return (
      <View style={[styles.player, audioOnly ? styles.audioOnly : styles.video]}>
         {/* Centered AudioMusicIcon */}
         {audioOnly && (
            <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
               <AudioMusicIcon width={200} height={200} />
            </View>
         )}
         <Pressable onPress={handleVideoPlayButton} style={[styles.playIconWrapper]}>
            <View style={styles.playIconWrapper}>
               <PlayIcon width={15} height={15} />
            </View>
         </Pressable>
         <Image
            style={[commonStyles.flex1, commonStyles.resizeContain]}
            source={{ uri: thumbImage ? getThumbBase64URL(thumbImage) : uri }}
         />
      </View>
   );
};

const styles = StyleSheet.create({
   player: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
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
