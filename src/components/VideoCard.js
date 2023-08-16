import { HStack, Image, Stack, Text, View } from 'native-base';
import React from 'react';
import { PlayIcon, VideoIcon } from '../common/Icons';
import noPreview from '../assets/noPreview.png';
import { ImageBackground, StyleSheet } from 'react-native';
import { millisToMinutesAndSeconds } from '../Helper/Chat/Utility';
import ProgressLoader from './chat/common/ProgressLoader';

const VideoCard = props => {
  const {
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
      media: {
        duration = 0,
        is_uploading,
        androidHeight,
        androidWidth,
        local_path = '',
        fileName,
        thumb_image = '',
      } = {},
    } = {},
  } = messageObject;

  const durationInSeconds = duration;
  const durationInMinutes = millisToMinutesAndSeconds(durationInSeconds);
  const base64ImageData = 'data:image/jpg;base64,' + thumb_image;
  const imageUrl = local_path ? local_path : '';
  const checkDownloaded = isSender ? is_uploading === 2 : imageUrl;

  return (
    <View
      borderRadius={10}
      overflow={'hidden'}
      borderBottomRightRadius={isSender ? 0 : 10}
      borderBottomLeftRadius={isSender ? 10 : 0}
      backgroundColor={isSender ? '#E2E8F7' : '#fff'}>
      <View p="1" position="relative">
        {thumb_image ? (
          <Image
            width={androidWidth}
            borderRadius={5}
            height={androidHeight}
            alt={fileName}
            source={{ uri: base64ImageData }}
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
        <View position={'absolute'} top={2} left={2}>
          <HStack alignItems={'center'}>
            <VideoIcon
              color={thumb_image ? '#fff' : '#000'}
              width="13"
              height="13"
            />
            <Text px="2" fontSize={11} color={thumb_image ? '#fff' : '#000'}>
              {durationInMinutes}
            </Text>
          </HStack>
        </View>

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
          <View position={'absolute'} bottom={2} right={2}>
            <ImageBackground
              source={require('../assets/ic_baloon.png')}
              style={styles.imageBg}>
              {props.status}
              <Text pl="1" color="#fff" fontWeight={400} fontSize="9">
                {props.timeStamp}
              </Text>
            </ImageBackground>
          </View>
        )}
        {checkDownloaded && (
          <View
            bg="#fff"
            position={'absolute'}
            bottom={'45%'}
            right={'43%'}
            shadow={5}
            borderRadius={50}>
            <View p="3">
              <PlayIcon />
            </View>
          </View>
        )}
      </View>
      {media.caption && (
        <Stack pb={2} justifyContent={'space-between'}>
          <Text color={'#000'} pl={3} fontSize={14}>
            {media.caption}
          </Text>
          <HStack alignItems={'center'} justifyContent={'flex-end'}>
            {props.status}
            <Text pl="1" paddingRight={2} fontSize="9">
              {props.timeStamp}
            </Text>
          </HStack>
        </Stack>
      )}
    </View>
  );
};
export default VideoCard;

const styles = StyleSheet.create({
  imageBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 100,
    resizeMode: 'cover',
  },
});
