import { View } from 'react-native';
import React from 'react';
import VideoPlayer from './Media/VideoPlayer';

const VideoInfo = props => {
  const { selectedMedia } = props;
  const SingleSelectedImage = selectedMedia.media;

  let item;
  if (SingleSelectedImage.local_path) {
    item = {
      fileDetails: {
        image: {
          uri: SingleSelectedImage.local_path,
          height: SingleSelectedImage.originalHeight,
          width: SingleSelectedImage.originalWidth,
        },
      },
    };
  } else {
    item = {
      ...SingleSelectedImage.file,
    };
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <VideoPlayer item={item} />
      </View>
    </View>
  );
};

export default VideoInfo;
