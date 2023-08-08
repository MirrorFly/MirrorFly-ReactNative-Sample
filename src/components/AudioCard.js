import React from 'react';
import { HStack, View, Text, Slider, Center } from 'native-base';
import { AudioMusicIcon, DownloadIcon } from '../common/Icons';
import AudioPlayer from './Media/AudioPlayer';
import { StyleSheet } from 'react-native';

const AudioCard = props => {
  const { messageObject, isSender } = props;

  const {
    msgId = '',
    msgBody: { media },
  } = messageObject;
  const uri = media.local_path || media?.file?.fileDetails?.uri;
  // const durationInSeconds = props.data.msgBody.media.duration;
  // const durationInMinutes = Math.floor(durationInSeconds / 1000);
  // const handleUnfilledTrackColor = '#D0D8EB';
  // const sliderStyle = {
  //   track: { backgroundColor: handleUnfilledTrackColor },
  // };
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
        <AudioPlayer msgId={msgId} uri={uri} media={media} />
      </HStack>
      {/* <HStack
        px="2"
        style={{
          backgroundColor: '#EFEFEF',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}>
        <View
          borderRadius={25}
          padding={'2'}
          backgroundColor={'#7285B5'}
          width="30"
          height="30">
          <AudioMusicIcon width="14" height="14" />
        </View>
        <View
          style={{
            borderRadius: 5,
            borderWidth: 2,
            borderColor: '#AFB8D0',
            paddingHorizontal: 6,
            paddingVertical: 3,
            marginLeft: 10,
          }}>
          <DownloadIcon width="15" height="22" />
        </View>
        <View mx={'3'} mt={4} w="75%" maxW="140" style={sliderStyle}>
          <Slider defaultValue={60} colorScheme="#7285B5" size="sm">
            <Slider.Track>
              <Slider.FilledTrack bg="#7285B5" />
            </Slider.Track>
            <Slider.Thumb bg="#7285B5" />
          </Slider>
          <View bottom={2}>
            <Text color="#000" fontWeight={'300'} fontSize="9">
              {`${String(Math.floor(durationInMinutes / 60)).padStart(
                2,
                '0',
              )}:${String(durationInMinutes % 60).padStart(2, '0')}`}
            </Text>
          </View>
        </View>
      </HStack> */}
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
          fontWeight={'350'}
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
