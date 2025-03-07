import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, BackHandler, Dimensions, FlatList, Image, View } from 'react-native';
import { TickIcon, VideoSmallIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import GalleryHeader from '../components/GalleryHeader';
import {
   getAbsolutePath,
   getThumbBase64URL,
   getType,
   mediaObjContructor,
   showToast,
   validateFileSize,
} from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { mflog } from '../uikitMethods';
import { GALLERY_PHOTOS_SCREEN, MEDIA_PRE_VIEW_SCREEN } from './constants';

const GalleryPhotos = () => {
   const { params: { grpView = '', selectedImages: routesSelectedImages = [] } = {} } = useRoute();
   const stringSet = getStringSet();
   const navigation = useNavigation();
   const themeColorPalatte = useThemeColorPalatte();
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
         return Object.keys(selectedImages).length + '/10' + ' ' + stringSet.CHAT_SCREEN_ATTACHMENTS.SELECTED;
      } else if (checkBox) {
         return stringSet.CHAT_SCREEN_ATTACHMENTS.GALLERY_TAP_SELECT_HEADER;
      } else {
         return grpView;
      }
   };

   const handleBackBtn = () => {
      if (Object.keys(selectedImages).length !== 0) {
         setSelectedImages({});
         setCheckbox(false);
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
         return showToast(sizeError);
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
            return showToast(stringSet.TOAST_MESSAGES.TOAST_SELECTED_MORE_THAN_ITEM);
         }

         if (sizeError) {
            return showToast(sizeError);
         }
         const transformedArray = {
            caption: '',
            fileDetails: mediaObjContructor('CAMERA_ROLL', item),
         };
         setSelectedImages(prevSelectedImages => {
            const uri = item?.image?.uri;

            // Check if the item is already selected
            if (prevSelectedImages[uri]) {
               // If selected, deselect it by creating a new object without the selected key
               const newSelectedImages = { ...prevSelectedImages };
               delete newSelectedImages[uri];
               return newSelectedImages;
            } else {
               // If not selected, select it by adding it to the state
               return { ...prevSelectedImages, [uri]: transformedArray };
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

   const fetchPhotos = async (groupName, after = '') => {
      try {
         setLoading(true);

         // Define parameters for fetching photos
         const params = {
            first: PAGE_SIZE,
            groupName,
            assetType: 'All',
            groupTypes: 'SmartAlbum',
            include: ['filename', 'fileSize', 'fileExtension', 'imageSize', 'playableDuration', 'orientation'],
            ...(after && { after }), // Add 'after' only if it exists
         };

         // Fetch photos using CameraRoll
         const result = await CameraRoll.getPhotos(params);

         // Process each photo to get the absolute path
         const processedEdges = await Promise.all(
            result.edges.map(async item => {
               const { uri, thumbnailBase64 } = await getAbsolutePath(item?.node?.image.uri);
               item.node.image.uri = uri;
               item.node.image.thumbImage = thumbnailBase64;
               return item;
            }),
         );

         // Merge new photos with existing ones
         const updatedPhotos = after ? [...photos, ...processedEdges] : [...processedEdges];

         // Update state with photos and pagination data
         setPhotos(updatedPhotos);
         setEndCursor(result.page_info.end_cursor);
         setHasNextPage(result.page_info.has_next_page);
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
               <Image
                  alt=""
                  style={{ width: itemWidth, aspectRatio: 1 }}
                  source={{
                     uri:
                        item.node.type === 'video' && item?.node?.image.thumbImage
                           ? getThumbBase64URL(item?.node?.image.thumbImage)
                           : item?.node?.image.uri,
                  }}
               />
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
                  {item?.node.type.includes('video') && <View p="0.5">{<VideoSmallIcon />}</View>}
               </View>
            </Pressable>
         </View>
      );
   };

   const renderFooter = () => {
      if (!loading) {
         return null;
      }
      if (loading) {
         return (
            <View style={commonStyles.mb_130}>
               <ActivityIndicator size="large" color={themeColorPalatte.primaryColor} />
            </View>
         );
      }
   };

   return (
      <View style={[commonStyles.bg_color(themeColorPalatte.screenBgColor), commonStyles.flex1]}>
         {renderTitle}
         <View style={[{ marginBottom: 65 }]}>
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
