import React from 'react';
import { HStack, View, Text, Slider, Center } from 'native-base';
import { AudioMusicIcon, DownloadIcon } from '../common/Icons';
import AudioPlayer from './Media/AudioPlayer';
import { StyleSheet } from 'react-native';
import AttachmentProgressLoader from './chat/common/AttachmentProgressLoader';
import useMediaProgress from 'hooks/useMediaProgress';

const AudioCard = props => {
  const { messageObject, isSender } = props;

  const {
    msgId = '',
    msgBody: { media },
  } = messageObject;
  const uri = media.local_path || media?.file?.fileDetails?.uri;

  const { mediaStatus, downloadMedia, retryUploadMedia } = useMediaProgress({
    isSender,
    mediaUrl: uri,
    uploadStatus: media?.is_uploading || 0,
    media: media,
    msgId: msgId,
  });

  return (
    <View
      borderColor={'#E5E5E5'}
      borderWidth={1}
      flex={1}
      overflow={'hidden'}
      backgroundColor={isSender ? '#E2E8F7' : '#0000001A'}
      width={250}
      borderRadius={10}
      borderBottomRightRadius={isSender ? 0 : 10}
      borderBottomLeftRadius={isSender ? 10 : 0}
      mb={1}>
      <HStack
        alignItems={'center'}
        height={'16'}
        backgroundColor={isSender ? '#D0D8EB' : '#EFEFEF'}
        px="2">
        <View
          borderRadius={25}
          padding={'2'}
          backgroundColor={'#97A5C7'}
          width="30"
          height="30">
          <AudioMusicIcon width="14" height="14" />
        </View>
        <View ml={2}>
          <AttachmentProgressLoader
            isSender={isSender}
            mediaStatus={mediaStatus}
            onDownload={downloadMedia}
            onUpload={retryUploadMedia}
          />
        </View>
        <AudioPlayer
          msgId={msgId}
          uri={uri}
          media={media}
          mediaStatus={mediaStatus}
        />
      </HStack>
      <View
        style={[
          styles.bottomView,
          { backgroundColor: isSender ? '#E2E8F7' : '#fff' },
        ]}>
        {props.status}
        <Text
          px={1}
          textAlign={'right'}
          color={isSender ? '#455E93' : '#000'}
          fontWeight={'300'}
          fontSize="10">
          {props.timeStamp}
        </Text>
      </View>
    </View>
  );
};

export default AudioCard;

const styles = StyleSheet.create({
  bottomView: {
    height: 22,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
