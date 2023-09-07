import React from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  Divider,
  HStack,
  Icon,
  IconButton,
  KeyboardAvoidingView,
  Spacer,
  Text,
  View,
} from 'native-base';
import { useSelector } from 'react-redux';
import {
  DeleteBinIcon,
  LeftArrowIcon,
  PreViewAddIcon,
  RightArrowIcon,
  SendBlueIcon,
} from '../common/Icons';
import Avathar from '../common/Avathar';
import { SceneMap, TabView } from 'react-native-tab-view';
import { getType } from './chat/common/fileUploadValidation';
import VideoPlayer from './Media/VideoPlayer';
import useRosterData from '../hooks/useRosterData';

function GalleryPickView(props) {
  const {
    handleSendMsg,
    setLocalNav,
    selectedSingle,
    setSelectedImages,
    selectedImages,
  } = props;
  const scrollRef = React.useRef();
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const [index, setIndex] = React.useState(0);
  const [_selectedImages, set_selectedImages] = React.useState(selectedImages);
  let {
    nickName,
    image: imageToken,
    colorCode,
  } = useRosterData(profileDetails?.userId);
  // updating the default values
  nickName =
    nickName || profileDetails?.nickName || profileDetails?.userId || '';
  imageToken = imageToken || '';

  const handleBackBtn = () => {
    selectedSingle && setSelectedImages([]);
    setLocalNav('Gallery');
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

  const handleIndexChange = ind => {
    console.log(ind, 'index');
    scrollRef?.current.scrollToIndex({
      index: ind,
      animated: true,
      viewPosition: 0.5,
    });
    setIndex(ind);
  };

  const renderTabBar = () => {
    return <></>;
  };

  const handleSendMedia = () => {
    let message = {
      type: 'media',
      content: _selectedImages,
    };
    handleSendMsg(message);
  };

  const renderScene = React.useMemo(
    () =>
      SceneMap(
        _selectedImages?.reduce((scenes, item, itemIndex) => {
          const type = getType(item?.fileDetails?.type);
          scenes[`tab${itemIndex + 1}`] = () => (
            <>
              {type === 'image' && (
                <Image
                  resizeMode="contain"
                  source={{ uri: item?.fileDetails?.uri }}
                  style={styles.tabContainer}
                />
              )}
              {type === 'video' && <VideoPlayer item={item} />}
            </>
          );
          return scenes;
        }, {}),
      ),
    [_selectedImages],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            backgroundColor={colorCode}
            data={nickName}
            profileImage={imageToken}
          />
          <Spacer />
          {_selectedImages.length > 1 && (
            <IconButton
              mr={'2'}
              onPress={() => {
                let filtered = _selectedImages?.filter(
                  (item, i) => i !== index,
                );
                set_selectedImages(filtered);
              }}
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              icon={
                <Icon as={<DeleteBinIcon color="#fff" />} name="emoji-happy" />
              }
              borderRadius="full"
            />
          )}
        </HStack>
        <TabView
          navigationState={{
            index,
            routes: _selectedImages?.map((_, i) => ({
              key: `tab${i + 1}`,
            })),
          }}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={handleIndexChange}
        />
        <IconButton
          p="0"
          right="3"
          bottom="-15"
          alignSelf={'flex-end'}
          onPress={() => {
            handleSendMedia();
            setLocalNav('CHATCONVERSATION');
          }}
          _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
          icon={<Icon as={<SendBlueIcon color="#fff" />} name="emoji-happy" />}
          borderRadius="full"
        />
        <HStack ml="2" mb="1" alignItems={'center'}>
          {_selectedImages.length < 10 && (
            <IconButton
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              onPress={async () => {
                setSelectedImages(_selectedImages);
                setLocalNav('Gallery');
              }}
              icon={<Icon as={PreViewAddIcon} name="emoji-happy" />}
              borderRadius="full"
            />
          )}
          {_selectedImages.length < 10 && (
            <Divider
              h="7"
              bg="#7f7f7f"
              thickness="1"
              mx="2"
              orientation="vertical"
            />
          )}
          <TextInput
            style={{
              flex: 1,
              color: '#fff',
              fontSize: 14,
              minHeight: 20,
              maxHeight: 100,
            }}
            defaultValue={
              _selectedImages[index] ? _selectedImages[index].caption : ''
            }
            numberOfLines={1}
            multiline={true}
            onChangeText={text => {
              _selectedImages[index].caption = text;
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
        <FlatList
          ref={scrollRef}
          data={_selectedImages}
          style={styles.miniPreViewScroll}
          horizontal
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.code}
          renderItem={({ item, index: i }) => (
            <Pressable
              activeOpacity={1}
              key={item?.fileDetails?.uri}
              style={styles.tabButton}
              onPress={() => handleIndexChange(i)}>
              <Image
                source={{ uri: item?.fileDetails?.uri }}
                style={[
                  styles.tabImage,
                  index === i && styles.selectedTabImage,
                ]}
              />
            </Pressable>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default GalleryPickView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  miniPreViewScroll: {
    flexGrow: 0,
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
