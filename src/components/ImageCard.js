import { HStack, Image, Text, View } from 'native-base';
import React from 'react';
import { ImageBackground } from 'react-native';
import { DownloadIcon } from '../common/Icons';
import noPreview from '../assets/noPreview.png'
import ProgressLoader from './chat/common/ProgressLoader';

function convertBytesToKB(bytes) {
  const KB = bytes / 1024;
  return KB.toFixed(0);
}

const ImageCard = (props) => {
  const mediaData = props.data.msgBody.media

  const fileSizeInKB = convertBytesToKB(props.fileSize);

  const base64ImageData = 'data:image/png;base64,' + mediaData.thumb_image;
  return (
    <View borderColor={'#E5E5E5'} borderWidth={2} borderRadius={5} position='relative'>

      {mediaData.thumb_image
        ? <Image alt={mediaData.fileName} source={{ uri: base64ImageData }} resizeMode="cover" style={{ width: mediaData.androidWidth, height: mediaData.androidHeight, borderRadius: 5 }} />

        : <Image alt={mediaData.fileName} source={noPreview} width={mediaData.androidWidth} height={mediaData.androidHeight} />
      }

      <View position={'absolute'} bottom={1} right={1}>
        <ImageBackground
          source={require('../assets/ic_baloon.png')}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", width: 100, resizeMode: 'cover' }}
        >
          {props.status}
          <Text pl='1' color='#fff' fontSize='9'>{props.timeStamp}</Text>
        </ImageBackground>
        <ProgressLoader/>
      </View>
    </View>
  );
};
export default ImageCard;
