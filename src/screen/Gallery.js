import CameraRoll from '@react-native-community/cameraroll';
import { HStack, Icon, Image, Pressable, Text, View } from 'native-base';
import React from 'react';
import ScreenHeader from '../components/ScreenHeader';
import { useSelector } from 'react-redux';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  CameraSmallIcon,
  FolderIcon,
  TickIcon,
  VideoSmallIcon,
} from '../common/Icons';
import GalleryPhotos from './GalleryPhotos';
import store from '../redux/store';
import {
  addGalleryAlbum,
  addGalleryPhotos,
  addGalleyGroupName,
} from '../redux/Actions/GalleryAction';
import useRosterData from '../hooks/useRosterData';
import { getUserIdFromJid } from '../Helper/Chat/Utility';

const Gallery = (props = {}) => {
  const PAGE_SIZE = 20;
  const {
    setLocalNav,
    selectedImages,
    handleSelectImage,
    setSelectedImages,
    handleMedia,
  } = props;
  const fromUserJid = useSelector(state => state.navigation.fromUserJid);
  const { galleryAlbum, galleryPhotos, galleryName } = useSelector(
    state => state.galleryData,
  );

  let { nickName } = useRosterData(getUserIdFromJid(fromUserJid));
  nickName = nickName || getUserIdFromJid(fromUserJid);
  const [galleryData, setGalleryData] = React.useState(galleryAlbum || []);
  const [grpView, setGrpView] = React.useState(galleryName || '');
  const [photos, setPhotos] = React.useState(galleryPhotos || []);
  const [loading, setLoading] = React.useState(false);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [endCursor, setEndCursor] = React.useState(null);
  const [checkBox, setCheckbox] = React.useState(false);
  let numColumns = 3;
  const deviceWidth = Dimensions.get('window').width;
  let itemWidth = deviceWidth / numColumns;
  itemWidth = itemWidth - (itemWidth / 100) * 0.45;

  const handleBackBtn = () => {
    setLocalNav('CHATCONVERSATION');
  };

  const renderItem = ({ item }) => {
    const isImageSelected = selectedImages.some(
      selectedItem => selectedItem?.fileDetails.uri === item?.node?.image.uri,
    );
    return (
      <View position="relative" padding={0.45}>
        <Pressable
          width={itemWidth}
          onPress={() => {
            setCheckbox(false);
            selectedImages.length === 0 && !checkBox
              ? handleMedia(item.node)
              : handleSelectImage(item.node);
          }}
          onLongPress={() => {
            setCheckbox(false);
            handleSelectImage(item.node);
          }}>
          <Image
            alt=""
            width={itemWidth}
            aspectRatio={1}
            source={{ uri: item?.node?.image.uri }}
          />
          {isImageSelected && (
            <View
              position="absolute"
              padding={1}
              width="100%"
              aspectRatio={1}
              marginRight={3}
              backgroundColor="rgba(0,0,0,0.5)">
              <View position={'absolute'} left={60} bottom={60}>
                {<Icon as={TickIcon} name="emoji-happy" />}
              </View>
            </View>
          )}
          <HStack
            borderRadius={'10'}
            px={'0.5'}
            position={'absolute'}
            bottom={1}
            left={1}>
            {item?.node.type.split('/')[0] === 'video' && (
              <View p="0.5">
                <Icon as={() => VideoSmallIcon()} name="emoji-happy" />
              </View>
            )}
          </HStack>
        </Pressable>
      </View>
    );
  };

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const photo = await CameraRoll.getAlbums({
        assetType: 'All',
      });
      const _galleryData = await Promise.allSettled(
        photo.map(async item => {
          const params = {
            first: 5,
            assetType: 'All',
            include: [
              'filename',
              'fileSize',
              'fileExtension',
              'imageSize',
              'playableDuration',
              'orientation',
            ],
            groupName: item.title,
          };
          return CameraRoll.getPhotos(params).then(res => {
            const node = res.edges.find(data => {
              const filename = data.node.image.filename;
              return (
                filename.endsWith('.jpg') ||
                filename.endsWith('.jpeg') ||
                filename.endsWith('.png') ||
                filename.endsWith('.mp4') ||
                filename.endsWith('.MOV')
              );
            });
            if (node) {
              return {
                count: item.count,
                title: item.title,
                uri: node.node.image.uri,
              };
            }
            return null;
          });
        }),
      );
      const filtertedData = _galleryData.filter(item => item.value !== null);
      filtertedData.sort((a, b) => {
        const titleA = a.value.title.toUpperCase();
        const titleB = b.value.title.toUpperCase();
        if (titleA < titleB) {
          return -1;
        } else if (titleA > titleB) {
          return 1;
        } else {
          return 0;
        }
      });
      store.dispatch(addGalleryAlbum(filtertedData));
      setGalleryData(filtertedData);
    } catch (error) {
      console.log('Photo_Error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async (groupName, after = '') => {
    try {
      setLoading(true);
      setGrpView(groupName);
      store.dispatch(addGalleyGroupName(groupName));
      let params = {
        first: PAGE_SIZE,
        groupName: groupName,
        assetType: 'All',
        include: [
          'filename',
          'fileSize',
          'fileExtension',
          'imageSize',
          'playableDuration',
          'orientation',
        ],
      };
      if (after) {
        params.after = after;
      }
      const data = await CameraRoll.getPhotos(params).then(res => {
        const filteredArray = res.edges.filter(item => {
          const filename = item.node.image.filename;
          return (
            filename.endsWith('.jpg') ||
            filename.endsWith('.jpeg') ||
            filename.endsWith('.png') ||
            filename.endsWith('.mp4') ||
            filename.endsWith('.MOV')
          );
        });
        return {
          edges: filteredArray,
          page_info: {
            has_next_page: res.page_info.has_next_page,
            end_cursor: res.page_info.end_cursor,
          },
        };
      });
      /**
                const data = await CameraRoll.getPhotos(params);
                 console.log(data,"datadata");
             * */
      const { has_next_page, end_cursor } = data.page_info;
      setEndCursor(end_cursor);
      setHasNextPage(has_next_page);
      let getPhoto = [];
      if (after) {
        getPhoto = [...photos, ...data.edges];
      } else {
        getPhoto = [...data.edges];
      }
      const updatedPhotos = [...getPhoto];
      for (const newPhoto of getPhoto) {
        const existingPhoto = updatedPhotos.find(
          photo => photo.image?.uri === newPhoto.image?.uri,
        );
        if (!existingPhoto) {
          updatedPhotos.push(newPhoto);
        }
      }
      setPhotos(updatedPhotos);
      store.dispatch(addGalleryPhotos(updatedPhotos));
    } catch (error) {
      console.log('fetchPhotos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async (after = null) => {
    if (!loading && hasNextPage) {
      fetchPhotos(grpView, endCursor);
    }
  };

  const renderFooter = () => {
    if (!loading) {
      return null;
    }
    return (
      <View marginBottom={50}>
        <ActivityIndicator size="large" color={'#3276E2'} />
      </View>
    );
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    fetchGallery();
    return () => {
      backHandler.remove();
    };
  }, []);

  const albumRender = ({ item }) => {
    return (
      <Pressable
        onPress={() => {
          fetchPhotos(item.value.title);
        }}
        padding="0.4"
        justifyContent={'space-between'}>
        <View position={'relative'} width={itemWidth} height={itemWidth}>
          <Image
            resizeMode="cover"
            alt={item.value.title}
            size={itemWidth}
            source={{ uri: item?.value?.uri }}
          />
          <HStack
            px={'0.5'}
            backgroundColor={'rgba(0,0,0,0.1))'}
            position="absolute"
            alignItems={'center'}
            bottom={1}
            width={'100%'}>
            {item.value.title === 'Camera' ? (
              <Icon as={CameraSmallIcon} name="emoji-happy" />
            ) : (
              <Icon as={FolderIcon} name="emoji-happy" />
            )}
            <Text
              ml={1.5}
              color="#fff"
              width={'60%'}
              numberOfLines={1}
              ellipsizeMode="tail"
              fontSize={10}>
              {item.value.title}
            </Text>
            <Text color="#fff" position={'absolute'} right={1} fontSize={10}>
              {/** {item.value.count} */}
            </Text>
          </HStack>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      {grpView ? (
        <View mb={'0.5'} mr={'0.3'} ml={'0.1'}>
          <GalleryPhotos
            renderItem={renderItem}
            handleLoadMore={handleLoadMore}
            photos={photos}
            setPhotos={setPhotos}
            setCheckbox={setCheckbox}
            checkBox={checkBox}
            selectedImages={selectedImages}
            handleBackBtn={handleBackBtn}
            grpView={grpView}
            setGrpView={setGrpView}
            renderFooter={renderFooter}
            setLocalNav={setLocalNav}
            setSelectedImages={setSelectedImages}
          />
        </View>
      ) : (
        <View mb="20">
          <ScreenHeader
            title={'Send to ' + nickName}
            onhandleBack={handleBackBtn}
          />
          <View ml={'0.1'} mb="16">
            <FlatList
              numColumns={3}
              data={galleryData}
              keyExtractor={item => item.value.title.toString()}
              bounces={false}
              ListFooterComponent={renderFooter}
              renderItem={albumRender}
            />
          </View>
        </View>
      )}
    </>
  );
};
export default Gallery;
