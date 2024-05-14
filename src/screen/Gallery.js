import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, BackHandler, Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { CameraSmallIcon, FolderIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import ScreenHeader from '../components/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { GALLERY_PHOTOS_SCREEN } from '../constant';
import { selectedMediaIdRef } from '../hooks/useChatMessage';
import useRosterData from '../hooks/useRosterData';
import { mflog } from '../uikitHelpers/uikitMethods';

const Gallery = () => {
   const navigation = useNavigation();
   const fromUserJid = useSelector(state => state.navigation.fromUserJid);
   const { galleryAlbum } = useSelector(state => state.galleryData);

   let { nickName } = useRosterData(getUserIdFromJid(fromUserJid));
   nickName = nickName || getUserIdFromJid(fromUserJid);
   const [galleryData, setGalleryData] = React.useState(galleryAlbum || []);
   const [loading, setLoading] = React.useState(false);
   let numColumns = 3;
   const deviceWidth = Dimensions.get('window').width;
   let itemWidth = deviceWidth / numColumns;
   itemWidth = itemWidth - (itemWidth / 100) * 0.6;

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   React.useEffect(() => {
      fetchGallery();

      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

      return () => {
         backHandler.remove();
      };
   }, []);

   const fetchGallery = async () => {
      try {
         setLoading(true);
         const photo = await CameraRoll.getAlbums({
            assetType: 'All',
         });
         const _galleryData = await Promise.allSettled(
            photo.map(async item => {
               const params = {
                  first: 1,
                  assetType: 'All',
                  include: ['filename', 'fileSize', 'fileExtension', 'imageSize', 'playableDuration', 'orientation'],
                  groupName: item.title,
               };
               return CameraRoll.getPhotos(params).then(res => {
                  const node = res.edges.find(data => {
                     return data;
                     /**
                     const filename = data.node.image.filename
                     return (
                        filename.endsWith('.jpg') ||
                        filename.endsWith('.jpeg') ||
                        filename.endsWith('.png') ||
                        filename.endsWith('.mp4') ||
                        filename.endsWith('.MOV')
                     );
                     */
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
         setGalleryData(filtertedData);
      } catch (error) {
         mflog('Photo_Error', error);
      } finally {
         setLoading(false);
      }
   };

   const renderFooter = () => {
      if (!loading) {
         return null;
      }
      return (
         <View style={commonStyles.mb_130}>
            <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
         </View>
      );
   };

   const handleOnPress = item => () => {
      selectedMediaIdRef.current = {};
      navigation.navigate(GALLERY_PHOTOS_SCREEN, { grpView: item.value.title });
   };

   const albumRender = ({ item }) => {
      return (
         <Pressable
            onPress={handleOnPress(item)}
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
                     right={5}>
                     {item.value.count}
                  </Text>
               </View>
            </View>
         </Pressable>
      );
   };

   return (
      <>
         <View>
            <ScreenHeader title={'Send to ' + nickName} onhandleBack={handleBackBtn} />
            <View style={commonStyles.mb_130}>
               <FlatList
                  numColumns={3}
                  data={galleryData}
                  keyExtractor={item => item.value.title.toString()}
                  bounces={false}
                  ListFooterComponent={renderFooter}
                  renderItem={albumRender}
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
               />
            </View>
         </View>
      </>
   );
};
export default Gallery;

const galleryStyles = StyleSheet.create({
   albumText: {
      width: '60%',
   },
});
