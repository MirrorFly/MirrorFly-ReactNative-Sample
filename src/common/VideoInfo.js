import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { I18nManager, Image, Platform, StyleSheet, View } from 'react-native';
import RNConvertPhAsset from 'react-native-convert-ph-asset';
import { AudioMicIcon, AudioMusicIcon, PlayIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { getThumbBase64URL } from '../helpers/chatHelpers';
import { useThemeColorPalatte } from '../redux/reduxHook';
import { VIDEO_PLAYER_SCREEN } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { mflog } from '../uikitMethods';

const VideoInfo = props => {
   const navigation = useNavigation();
   const themeColorPalatte = useThemeColorPalatte();
   const { item: galleryItem = {}, selectedMedia = {}, audioOnly = false } = props;
   const SingleSelectedImage = selectedMedia.media;
   const audioType = selectedMedia.media?.audioType;

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
   const { fileDetails: { thumbImage: fileDetailsThumbImage, uri = '' } = {}, thumbImage = '' } = item;

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
      navigation.navigate(VIDEO_PLAYER_SCREEN, { item, audioOnly, audioType });
   };

   return (
      <View style={[styles.player, audioOnly ? styles.audioOnly : styles.video]}>
         {audioOnly && (
            <View style={[commonStyles.flex1, commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
               {audioType ? <AudioMicIcon width={200} height={200} /> : <AudioMusicIcon width={200} height={200} />}
            </View>
         )}
         <Pressable
            onPress={handleVideoPlayButton}
            style={[
               styles.playIconWrapper,
               { backgroundColor: themeColorPalatte.colorOnPrimary, shadowColor: themeColorPalatte.shadowColor },
            ]}>
            <PlayIcon width={15} height={15} />
         </Pressable>
         {!audioOnly && (fileDetailsThumbImage || thumbImage || uri) && (
            <Image
               style={[commonStyles.flex1, commonStyles.resizeContain]}
               source={{
                  uri:
                     thumbImage || fileDetailsThumbImage ? getThumbBase64URL(thumbImage || fileDetailsThumbImage) : uri,
               }}
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
      position: 'absolute',
      top: '50%',
      right: I18nManager.isRTL ? '50%' : 'auto',
      left: I18nManager.isRTL ? 'auto' : '50%',
      transform: [{ translateX: -13.5 }, { translateY: -13.5 }],
      elevation: 5,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      padding: 12,
      borderRadius: 50,
   },
});

export default VideoInfo;
