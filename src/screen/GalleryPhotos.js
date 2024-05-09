import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, BackHandler, Dimensions, FlatList, Image, View } from 'react-native';
import { showToast } from '../Helper';
import { TickIcon, VideoSmallIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import { mediaObjContructor } from '../common/utils';
import GalleryHeader from '../components/GalleryHeader';
import { getType, validateFileSize } from '../components/chat/common/fileUploadValidation';
import ApplicationColors from '../config/appColors';
import { GALLERY_PHOTOS_SCREEN, MEDIA_PRE_VIEW_SCREEN } from '../constant';
import { mflog } from '../uikitHelpers/uikitMethods';

const GalleryPhotos = () => {
   const { params: { grpView = '', selectedImages: routesSelectedImages = [] } = {} } = useRoute();
   const navigation = useNavigation();
   const PAGE_SIZE = 20;
   let numColumns = 3;
   const [photos, setPhotos] = React.useState([]);
   const [loading, setLoading] = React.useState(false);
   const [hasNextPage, setHasNextPage] = React.useState(false);
   const [endCursor, setEndCursor] = React.useState(null);
   const [checkBox, setCheckbox] = React.useState(false);
   const [selectedImages, setSelectedImages] = React.useState({});

   const deviceWidth = Dimensions.get('window').width;
   let itemWidth = deviceWidth / numColumns;
   itemWidth = itemWidth - (itemWidth / 100) * 0.45;

   React.useEffect(() => {
      fetchPhotos(grpView);
   }, []);

   React.useEffect(() => {
      if (routesSelectedImages.length) {
         const convertedData =
            routesSelectedImages.length > 0
               ? routesSelectedImages.reduce((acc, obj) => {
                    acc[obj.fileDetails.uri] = obj;
                    return acc;
                 }, {})
               : {};
         // Update selectedImages state with the received updatedImages
         setSelectedImages(convertedData);
      }
   }, [routesSelectedImages]);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

      return () => {
         backHandler.remove();
      };
   }, [selectedImages, checkBox]);

   const getTitle = () => {
      if (Object.keys(selectedImages).length) {
         return Object.keys(selectedImages).length + '/10 Selected';
      } else if (checkBox) {
         return 'Tap Photo to select';
      } else {
         return grpView;
      }
   };

   const handleBackBtn = () => {
      if (!checkBox && Object.keys(selectedImages).length !== 0) {
         setSelectedImages({});
      } else if (checkBox) {
         setCheckbox(false);
      } else {
         navigation.goBack();
      }
      return true;
   };

   const handleMedia = item => {
      const sizeError = validateFileSize(item.image.fileSize, getType(item.type));
      if (sizeError) {
         return showToast(sizeError, {
            id: 'media-size-error-toast',
         });
      }
      const transformedArray = {
         caption: '',
         fileDetails: mediaObjContructor('CAMERA_ROLL', item),
      };
      navigation.navigate(MEDIA_PRE_VIEW_SCREEN, {
         grpView,
         preScreen: GALLERY_PHOTOS_SCREEN,
         selectedImages: [transformedArray],
      });
   };

   const handleSelectImage = React.useCallback(
      item => {
         const sizeError = validateFileSize(item.image.fileSize, getType(item.type));
         const isImageSelected = selectedImages[item?.image?.uri];

         if (Object.keys(selectedImages).length >= 10 && !isImageSelected) {
            return showToast("Can't share more than 10 media items", {
               id: 'media-error-toast',
            });
         }

         if (sizeError) {
            return showToast(sizeError, {
               id: 'media-size-error-toast',
            });
         }
         const transformedArray = {
            caption: '',
            fileDetails: mediaObjContructor('CAMERA_ROLL', item),
         };
         setSelectedImages(prevSelectedImages => {
            // Check if the item is already selected
            if (prevSelectedImages[item?.image?.uri]) {
               // If selected, deselect it by removing it from the state
               const { [item.image.uri]: _, ...rest } = prevSelectedImages;
               return { ...rest };
            } else {
               // If not selected, select it by adding it to the state
               return { ...prevSelectedImages, [item?.image?.uri]: transformedArray };
            }
         });
      },
      [selectedImages],
   );

   const handleFinishSelection = () => {
      navigation.navigate(MEDIA_PRE_VIEW_SCREEN, {
         grpView,
         preScreen: GALLERY_PHOTOS_SCREEN,
         selectedImages: Object.values(selectedImages),
      });
   };

   const renderTitle = React.useMemo(() => {
      return (
         <GalleryHeader
            title={getTitle()}
            setCheckbox={setCheckbox}
            checkBox={checkBox}
            selectedImages={selectedImages}
            onhandleBack={handleBackBtn}
            onDone={handleFinishSelection}
         />
      );
   }, [checkBox, selectedImages]);

   const memoizedData = React.useMemo(() => photos, [photos]);

   const renderItem = ({ item }) => {
      const isImageSelected = selectedImages[item?.node?.image.uri];
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
                  Object.keys(selectedImages).length === 0 && !checkBox
                     ? handleMedia(item.node)
                     : handleSelectImage(item.node);
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

   const fetchPhotos = async (groupName, after = '') => {
      try {
         setLoading(true);

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
               return item;
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
        mflog(data,"datadata");
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
      } catch (error) {
         mflog('fetchPhotos', error);
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
      if (loading) {
         return (
            <View style={commonStyles.mb_130}>
               <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
            </View>
         );
      }
   };

   return (
      <View>
         {renderTitle}
         <View style={commonStyles.mb_130}>
            <FlatList
               numColumns={3}
               data={memoizedData}
               keyExtractor={(item, index) => item.id + index.toString()}
               horizontal={false}
               showsVerticalScrollIndicator={false}
               onEndReached={handleLoadMore}
               onEndReachedThreshold={16}
               ListFooterComponent={renderFooter}
               bounces={true}
               renderItem={renderItem}
               initialNumToRender={20}
               maxToRenderPerBatch={20}
               windowSize={15}
            />
         </View>
      </View>
   );
};

export default GalleryPhotos;
