import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AudioMusicIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import VideoPlayer from './Media/VideoPlayer';

const VideoInfo = props => {
   const { selectedMedia, audioOnly = false, forcePause = {} } = props;
   const SingleSelectedImage = selectedMedia.media;
   let item;
   if (SingleSelectedImage.local_path) {
      item = {
         fileDetails: {
            uri: SingleSelectedImage.local_path,
            height: SingleSelectedImage.originalHeight,
            width: SingleSelectedImage.originalWidth,
         },
      };
   } else {
      item = {
         ...SingleSelectedImage.file,
      };
   }

   return (
      <View style={[styles.player, audioOnly ? styles.audioOnly : styles.video]}>
         {/* Centered AudioMusicIcon */}
         <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
            <AudioMusicIcon width={200} height={200} />
         </View>
         {/* VideoPlayer */}
         <View style={[commonStyles.positionAbsolute, { width: '100%', height: '100%', zIndex: 1 }]}>
            <VideoPlayer forcePause={forcePause} audioOnly={audioOnly} item={item} />
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   player: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
   video: {},
   audioOnly: {
      backgroundColor: '#97A5C7',
   },
});

export default VideoInfo;
