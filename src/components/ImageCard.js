import { HStack, Image, Stack, Text, View } from 'native-base';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import noPreview from '../assets/noPreview.png';
import ProgressLoader from './chat/common/ProgressLoader';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import { GalleryAllIcon } from '../common/Icons';

const ImageCard = props => {
  const {
    imgSrc,
    uploadStatus = 0,
    setUploadStatus,
    isSender,
    fileSize,
    messageObject = {},
  } = props;

  const {
    msgId = '',
    msgBody: { media },
    msgBody: {
      message_type = '',
      media: {
        file: { fileDetails = {} } = {},
        file_url = '',
        androidHeight,
        androidWidth,
        local_path = '',
        fileName,
        thumb_image = '',
      } = {},
    } = {},
  } = messageObject;
  console.log('ImageCrd', media.caption);
  const imageUrl = local_path ? local_path : fileDetails?.image?.uri;
  const [imageSource, setImageSource] = React.useState(
    imgSrc || getThumbBase64URL(thumb_image),
  );

  React.useEffect(() => {
    if (imgSrc) {
      setImageSource(imgSrc);
    } else {
      setImageSource(getThumbBase64URL(thumb_image));
    }
  }, [imgSrc, msgId]);

  React.useEffect(() => {
    if (message_type === 'image' && file_url) {
      isSender && setImageSource(imageUrl);
      imageUrl && !isSender && setImageSource(imageUrl);
    }
  }, [file_url, message_type, local_path]);

  return (
    <View
      backgroundColor={isSender ? '#E2E8F7' : '#fff'}
      borderColor={'#E5E5E5'}
      borderWidth={2}
      borderRadius={8}
      paddingBottom={2.5} >
     
      <View
        paddingX={'1'}
        paddingY={'1'}
        backgroundColor={isSender ? '#E2E8F7' : '#fff'}>
        <Stack
          paddingX={'3'}
          paddingY={'0'}
          backgroundColor={'#0000001A'}
          borderRadius={15}>
          <View marginY={'2'} justifyContent={'flex-start'}>
            <Text fontSize={14}  fontWeight={500} color={"#000"} pb={2} numberOfLines={1}>You</Text>
            <HStack alignItems={'center'} pl={1}>
              <GalleryAllIcon color={"#6A6A6A"} />
              <Text pl={2} fontSize={14}  fontWeight={400}>
                Image
              </Text>
            </HStack>
          </View>
        </Stack>
      </View>

      <View
        height={androidHeight}
        width={androidWidth}
        backgroundColor={isSender ? '#E2E8F7' : '#fff'}
        borderColor={'#E5E5E5'}
        borderWidth={2}
        borderRadius={30}
        position="relative">
        {imageSource ? (
          <Image
            width={androidWidth}
            height={androidHeight}
            borderRadius={20}
            alt={fileName}
            source={{ uri: imageSource }}
            resizeMode="cover"
          />
        ) : (
          <View backgroundColor={'#fff'}>
            <Image
              resizeMode="contain"
              alt={fileName}
              source={noPreview}
              width={androidWidth}
              height={androidHeight}
            />
          </View>
        )}
        <View
          position={'absolute'}
          top={0}
          left={0}
          right={0}
          bottom={0}
          justifyContent={'center'}
          alignItems={'center'}>
          <ProgressLoader
            isSender={isSender}
            imageUrl={imageUrl}
            media={media}
            fileSize={fileSize}
            setUploadStatus={setUploadStatus}
            msgId={msgId}
            mediaData={media}
            uploadStatus={uploadStatus}
          />
        </View>
        {!media.caption && (
          <View position={'absolute'} bottom={1} right={1}>
            <ImageBackground
              source={require('../assets/ic_baloon.png')}
              style={styles.imageBg}>
              <Text pl="1" color="#fff" fontSize={9}>
                {props.timeStamp}
              </Text>
            </ImageBackground>
          </View>
        )}
      </View>
      {media.caption ? (
        <>
          <Stack
            borderBottomLeftRadius={1}
            backgroundColor={isSender ? '#E2E8F7' : '#fff'}
            pb={2}
            pt={3}
            justifyContent={'space-between'}>
            <Text
              numberOfLines={1}
              color={'#000'}
              pl={3}
              fontSize={14}
              fontWeight={400}>
              {media.caption}
            </Text>
            <HStack alignItems={'center'} justifyContent={'flex-end'}>
              <Text paddingRight={1}>{props.status}</Text>
              <Text paddingRight={2}>{props.timeStamp}</Text>
            </HStack>
          </Stack>
        </>
      ) : null}
    </View>
  );
};

export default ImageCard;

const styles = StyleSheet.create({
  imageBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 100,
    resizeMode: 'cover',
  },
});
