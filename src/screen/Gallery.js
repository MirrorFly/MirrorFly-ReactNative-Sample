import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import React from 'react';
import ScreenHeader from '../components/ScreenHeader';
import { useSelector } from 'react-redux';
import { ActivityIndicator, BackHandler, Dimensions, FlatList, View, Image, Text, StyleSheet } from 'react-native';
import { CameraSmallIcon, FolderIcon, TickIcon, VideoSmallIcon } from '../common/Icons';
import GalleryPhotos from './GalleryPhotos';
import store from '../redux/store';
import { addGalleryAlbum, addGalleryPhotos, addGalleyGroupName } from '../redux/Actions/GalleryAction';
import useRosterData from '../hooks/useRosterData';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import { selectedMediaIdRef } from './ChatScreen';

const Gallery = (props = {}) => {
   const PAGE_SIZE = 20;
   const { setLocalNav, selectedImages, handleSelectImage, setSelectedImages, handleMedia } = props;
   const fromUserJid = useSelector(state => state.navigation.fromUserJid);
   const { galleryAlbum, galleryPhotos, galleryName } = useSelector(state => state.galleryData);

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
      return true;
   };

   const renderItem = ({ item }) => {
      const isImageSelected = selectedMediaIdRef.current[item?.node?.image.uri];
      return (
         <View style={[commonStyles.positionRelative, commonStyles.padding_04]}>
            <Pressable
               contentContainerStyle={commonStyles.bgBlack_01}
               style={{
                  width: itemWidth,
               }}
               delayLongPress={200}
               onPress={() => {
                  setCheckbox(false);
                  selectedImages.length === 0 && !checkBox ? handleMedia(item.node) : handleSelectImage(item.node);
               }}
               onLongPress={() => {
                  setCheckbox(false);
                  handleSelectImage(item.node);
               }}>
               <Image alt="" style={{ width: itemWidth, aspectRatio: 1 }} source={{ uri: item?.node?.image.uri }} />
               {Boolean(isImageSelected) && (
                  <View
                     style={[
                        commonStyles.positionAbsolute,
                        commonStyles.p_1,
                        commonStyles.width_100_per,
                        commonStyles.mr_3,
                        commonStyles.bgBlack_04,
                        { aspectRatio: 1 },
                     ]}>
                     <View style={[commonStyles.positionAbsolute, { left: 60, bottom: 60 }]}>{TickIcon()}</View>
                  </View>
               )}
               <View
                  style={[
                     commonStyles.paddingHorizontal_4,
                     commonStyles.borderRadius_5,
                     commonStyles.paddingHorizontal_4,
                     commonStyles.positionAbsolute,
                  ]}
                  bottom={1}
                  left={1}>
                  {item?.node.type.split('/')[0] === 'video' && <View p="0.5">{VideoSmallIcon()}</View>}
               </View>
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
                  include: ['filename', 'fileSize', 'fileExtension', 'imageSize', 'playableDuration', 'orientation'],
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
            include: ['filename', 'fileSize', 'fileExtension', 'imageSize', 'playableDuration', 'orientation'],
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
            const existingPhoto = updatedPhotos.find(photo => photo.image?.uri === newPhoto.image?.uri);
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
         <View style={commonStyles.mb_130}>
            <ActivityIndicator size="large" color={'#3276E2'} />
         </View>
      );
   };

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

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
            style={[commonStyles.padding_04, commonStyles.justifyContentSpaceBetween]}
            contentContainerStyle={[commonStyles.bgBlack_01]}>
            <View style={[commonStyles.positionRelative, { width: itemWidth, height: itemWidth }]}>
               <Image alt="" style={{ width: itemWidth, aspectRatio: 1 }} source={{ uri: item?.value?.uri }} />
               <View
                  style={[
                     commonStyles.hstack,
                     commonStyles.alignItemsCenter,
                     commonStyles.positionAbsolute,
                     commonStyles.bgBlack_01,
                     commonStyles.bottom_1,
                     commonStyles.p_4,
                     { width: '100%' },
                  ]}>
                  {item.value.title === 'Camera' ? <CameraSmallIcon /> : <FolderIcon />}
                  <Text
                     style={[
                        commonStyles.colorWhite,
                        commonStyles.positionAbsolute,
                        commonStyles.fontSize_11,
                        commonStyles.marginLeft_20,
                        galleryStyles.albumText,
                     ]}
                     numberOfLines={1}
                     ellipsizeMode="tail">
                     {item.value.title}
                  </Text>
                  <Text
                     style={[commonStyles.colorWhite, commonStyles.positionAbsolute, commonStyles.fontSize_11]}
                     right={1}>
                     {/** {item.value.count} */}
                  </Text>
               </View>
            </View>
         </Pressable>
      );
   };

   return (
      <>
         {grpView ? (
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
         ) : (
            <View>
               <ScreenHeader title={'Send to ' + nickName} onhandleBack={handleBackBtn} />
               <View>
                  <FlatList
                     numColumns={3}
                     data={galleryData}
                     keyExtractor={item => item.value.title.toString()}
                     bounces={false}
                     ListFooterComponent={renderFooter}
                     renderItem={albumRender}
                     initialNumToRender={20}
                     maxToRenderPerBatch={20}
                     windowSize={15}
                  />
               </View>
            </View>
         )}
      </>
   );
};
export default Gallery;

const galleryStyles = StyleSheet.create({
   albumText: {
      width: '60%',
   },
});
