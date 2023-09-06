import { HStack, Image, Stack, Text, View } from 'native-base';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import noPreview from '../assets/noPreview.png';
import ProgressLoader from './chat/common/ProgressLoader';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import ReplyMessage from './ReplyMessage';

const ImageCard = props => {
  const {
    imgSrc,
    uploadStatus = 0,
    setUploadStatus,
    isSender,
    fileSize,
    messageObject = {},
    handleReplyPress,
  } = props;

  const {
    msgId = '',
    msgBody: { media },
    msgBody: {
      replyTo = '',
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

  const imageUrl = local_path || fileDetails?.uri;
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
      borderRadius={10}
      overflow={'hidden'}
      borderBottomRightRadius={isSender ? 0 : 10}
      borderBottomLeftRadius={isSender ? 10 : 0}
      backgroundColor={isSender ? '#E2E8F7' : '#fff'}
      px="1">
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={messageObject}
          isSame={isSender}
        />
      )}
      <View py="1" position="relative">
        {imageSource ? (
          <Image
            width={replyTo ? 250 : androidWidth}
            borderRadius={5}
            height={replyTo ? 150 : androidHeight}
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
          <View position={'absolute'} bottom={2} right={2}>
            <ImageBackground
              source={require('../assets/ic_baloon.png')}
              style={styles.imageBg}>
              {props.status}
              <Text pl="1" color="#fff" fontSize="9">
                {props.timeStamp}
              </Text>
            </ImageBackground>
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
