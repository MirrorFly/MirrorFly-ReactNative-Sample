import React from 'react';
import {
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  Divider,
  HStack,
  Icon,
  IconButton,
  ScrollView,
  Spacer,
  Text,
  View,
} from 'native-base';
import { useSelector } from 'react-redux';
import { LeftArrowIcon, RightArrowIcon, SendBlueIcon } from '../common/Icons';
import Avathar from '../common/Avathar';
import { getType } from './chat/common/fileUploadValidation';
import VideoPlayer from './Media/VideoPlayer';
import { CHATCONVERSATION } from '../constant';

const CameraPickView = props => {
  const {
    handleSendMsg,
    setLocalNav,
    selectedSingle,
    setSelectedImages,
    selectedImages,
  } = props;
  const profileDetails = useSelector(state => state.navigation.profileDetails);

  console.log(selectedImages, 'selectedImages');

  const handleBackBtn = () => {
    setSelectedImages([]);
    setLocalNav('CAMERAVIEW');
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, []);

  const handleSendMedia = () => {
    let message = {
      type: 'media',
      content: props.selectedImages,
    };
    handleSendMsg(message);
  };

  return (
    <View style={styles.container}>
      <HStack mb={'2'} mt="5" alignItems={'center'}>
        <IconButton
          _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
          onPress={handleBackBtn}
          icon={<Icon as={() => LeftArrowIcon('#fff')} name="emoji-happy" />}
          borderRadius="full"
        />
        <Avathar
          width={30}
          height={30}
          fontsize={14}
          backgroundColor={profileDetails?.colorCode}
          data={profileDetails?.nickName || '91'}
        />
        <Spacer />
      </HStack>
      {selectedImages[0]?.fileDetails.type === 'image/jpg' && (
        <Image
          resizeMode="contain"
          source={{ uri: selectedImages[0]?.fileDetails?.uri }}
          style={styles.tabContainer}
        />
      )}
      {selectedImages[0]?.fileDetails.type === 'video/mp4' && (
        <VideoPlayer item={selectedImages[0]} />
      )}
      <IconButton
        p="0"
        right="3"
        bottom="-15"
        alignSelf={'flex-end'}
        onPress={() => {
          handleSendMedia();
          setLocalNav(CHATCONVERSATION);
        }}
        _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
        icon={<Icon as={<SendBlueIcon color="#fff" />} name="emoji-happy" />}
        borderRadius="full"
      />
      <HStack ml="2" mb="1" alignItems={'center'}>
        <TextInput
          style={{
            flex: 1,
            color: '#fff',
            fontSize: 14,
            minHeight: 20,
            maxHeight: 100,
          }}
          defaultValue={
            props.selectedImages[0] ? props.selectedImages[0].caption : ''
          }
          numberOfLines={1}
          multiline={true}
          onChangeText={text => {
            selectedImages[0].caption = text;
          }}
          placeholderTextColor="#7f7f7f"
          selectionColor={'#3276E2'}
          placeholder="Add a caption..."
        />
      </HStack>
      <HStack alignItems={'center'} ml={3} mb={5}>
        <IconButton
          icon={<Icon as={() => RightArrowIcon('#fff')} name="emoji-happy" />}
        />
        <Text color="#7f7f7f">{profileDetails?.nickName}</Text>
      </HStack>
    </View>
  );
};

export default CameraPickView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabImage: {
    width: 45,
    height: 45,
    borderColor: '#7f7f7f',
    borderWidth: 0.25,
  },
  tabButton: {
    paddingHorizontal: 2,
  },
  selectedTabImage: {
    width: 45,
    height: 45,
    borderColor: '#3276E2',
    borderWidth: 2,
  },
});
