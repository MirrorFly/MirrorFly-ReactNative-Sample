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
      backgroundColor={isSender ? '#E2E8F7' : '#fff'}
      borderColor={'#E5E5E5'}
      borderWidth={2}
      borderRadius={8}>
      <View
        paddingX={'1'}
        paddingY={'1'}
        backgroundColor={isSender ? '#E2E8F7' : '#fff'}>
        <Stack
          paddingX={'3'}
          paddingY={'0'}
          backgroundColor={'#0000001A'}
          borderRadius={15}>
          <View marginY={'3'} justifyContent={'flex-start'}>
            <Text
              fontSize={14}
              fontWeight={500}
              color={'#000'}
              pb={2}
              numberOfLines={1}>
              You
            </Text>
            <HStack alignItems={'center'} pl={1}>
              <VideoIcon color={'#767676'} width="13" height="13" />
              <Text pl={2} fontSize={14} color="#313131" fontWeight={400}>
                Video
              </Text>
            </HStack>
          </View>
        </Stack>
      </View>

      <View
        backgroundColor={'#fff'}
        borderColor={'#E5E5E5'}
        borderWidth={2}
        borderRadius={10}
        position="relative">
        {thumb_image ? (
          <Image
            alt={fileName}
            source={{ uri: base64ImageData }}
            resizeMode="cover"
            width={androidWidth}
            height={androidHeight}
            borderRadius={5}
          />
        ) : (
          <Image
            resizeMode="contain"
            alt={fileName}
            source={noPreview}
            width={androidWidth}
            height={androidHeight}
          />
        )}
        <View position={'absolute'} top={1} left={1}>
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
          <View position={'absolute'} bottom={1} right={1}>
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
        {media.caption ? (
          <Stack
            borderBottomLeftRadius={10}
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
        ) : null}
      </View>
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
