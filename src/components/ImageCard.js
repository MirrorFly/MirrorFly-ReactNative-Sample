import { HStack, Image, Pressable, Text, View } from 'native-base';
import React from 'react';
import { ImageBackground } from 'react-native';
import { DownloadIcon } from '../common/Icons';
import noPreview from '../assets/noPreview.png'
import ProgressLoader from './chat/common/ProgressLoader';

const ImageCard = (props) => {
  const mediaData = props.data.msgBody.media
  const base64ImageData = 'data:image/png;base64,' + mediaData.thumb_image;
  return (
    <View height={mediaData.androidHeight} width={mediaData.androidWidth} borderColor={'#E5E5E5'} borderWidth={2} borderRadius={5} position='relative'>
      {mediaData.thumb_image
        ? <Image alt={mediaData.fileName} source={{ uri: base64ImageData }} resizeMode="cover" style={{ width: mediaData.androidWidth, height: mediaData.androidHeight, borderRadius: 5 }} />
        : <Image alt={mediaData.fileName} source={noPreview} width={mediaData.androidWidth} height={mediaData.androidHeight} />
      }
      <View position={'absolute'} style={{ top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <ProgressLoader fileSize={props.fileSize} mediaData={mediaData}/>
      </View>
      <View position={'absolute'} bottom={1} right={1}>
        <ImageBackground
          source={require('../assets/ic_baloon.png')}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", width: 100, resizeMode: 'cover' }}
        >
          {props.status}
          <Text pl='1' color='#fff' fontSize='9'>{props.timeStamp}</Text>
        </ImageBackground>
      </View>
    </View>
  );
};
export default ImageCard;
