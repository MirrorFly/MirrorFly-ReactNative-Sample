import { HStack, Image, Pressable, Text, View } from 'native-base';
import React from 'react';
import { ImageBackground } from 'react-native';
import { DownloadIcon } from '../common/Icons';
import noPreview from '../assets/noPreview.png'
import ProgressLoader from './chat/common/ProgressLoader';
import { getThumbBase64URL } from '../Helper/Chat/Utility';

const ImageCard = (props) => {
  const {
    imgSrc,
    uploadStatus = 0,
    messageObject = {}
  } = props;
  const {
    msgId = "",
    msgBody: { media },
    msgBody: {
      message_type = "",
      media: { file: { fileDetails = {} } = {}, caption = "", file_url = "", androidHeight, androidWidth, local_path = "", fileName, fileSize,
        thumb_image = "", webWidth, webHeight, file_key } = {}
    } = {}
  } = messageObject;
  const imageUrl = local_path ? local_path : fileDetails?.image?.uri
  const [imageSource, setImageSource] = React.useState(imgSrc || getThumbBase64URL(thumb_image));
  
  React.useEffect(() => {
    if (imgSrc) {
      setImageSource(imgSrc);
    } else {
      setImageSource(getThumbBase64URL(thumb_image));
    }
  }, [imgSrc, msgId]);

  React.useEffect(() => {
    if (message_type === "image" && file_url) {
      setImageSource(imageUrl)
    }
  }, [file_url, message_type]);

  return (
    <View height={androidHeight} width={androidWidth} borderColor={'#E5E5E5'} borderWidth={2} borderRadius={5} position='relative'>
      {imgSrc
        ? <Image alt={fileName} source={{ uri: imageSource }} resizeMode="cover" style={{ width: androidWidth, height: androidHeight, borderRadius: 5 }} />
        : <Image alt={fileName} source={noPreview} width={androidWidth} height={androidHeight} />
      }
      <View position={'absolute'} style={{ top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <ProgressLoader
          msgId={msgId}
          fileSize={fileSize}
          mediaData={media}
          uploadStatus={uploadStatus}
        />
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
