import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
   BackHandler,
   FlatList,
   Image,
   Keyboard,
   KeyboardAvoidingView,
   Platform,
   Pressable,
   StyleSheet,
   View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import IconButton from '../common/IconButton';
import { DeleteBinIcon, LeftArrowIcon, PreViewAddIcon, RightArrowIcon, SendBlueIcon } from '../common/Icons';
import LoadingModal from '../common/LoadingModal';
import NickName from '../common/NickName';
import TextInput from '../common/TextInput';
import VideoInfo from '../common/VideoInfo';
import UserAvathar from '../components/UserAvathar';
import {
   getCurrentChatUser,
   getThumbBase64URL,
   getType,
   getUserIdFromJid,
   handleSendMedia,
} from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, MIX_BARE_JID } from '../helpers/constants';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import { mediaCompress, sdkLog } from '../SDK/utils';
import commonStyles from '../styles/commonStyles';
import { CAMERA_SCREEN, GALLERY_PHOTOS_SCREEN, MEDIA_PRE_VIEW_SCREEN } from './constants';
import { CommonActions } from '@react-navigation/native';
import RootNavigation from '../Navigation/rootNavigation';

function MediaPreView() {
   const chatUser = getCurrentChatUser();
   const stringSet = getStringSet();
   const { params: { grpView, preScreen = '', selectedImages } = {} } = useRoute();
   const userId = getUserIdFromJid(chatUser);
   const navigation = useNavigation();
   const themeColorPalatte = useThemeColorPalatte();
   const pagerRef = React.useRef(null);
   const scrollRef = React.useRef();
   const [activeIndex, setActiveIndex] = React.useState(0);
   const [loading, setLoading] = React.useState(false);
   const chatType = MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : '';
   const [componentSelectedImages, setComponentSelectedImages] = React.useState(selectedImages);
   const [loadingMessage, setLoadingMessage] = React.useState('Compressing');

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, []);

   const compressSelectedMedia = async () => {
      if (componentSelectedImages.length === 0) {
         return;
      }

      setLoading(true);
      setLoadingMessage(`Compressing 1 of ${componentSelectedImages.length}`);

      let sortedMedia = [];

      for (let index = 0; index < componentSelectedImages.length; index++) {
         const element = componentSelectedImages[index];
         const type = element.fileDetails.type.includes('/')
            ? element.fileDetails.type.split('/')[0]
            : element.fileDetails.type;

         // ✅ Update message **before** starting compression
         setLoadingMessage(`Compressing ${index + 1} of ${componentSelectedImages.length}`);

         try {
            const response = await mediaCompress({
               uri: element.fileDetails.uri,
               type,
               quality: 'medium',
            });

            sortedMedia.push({
               index,
               compressedData: {
                  ...element,
                  fileDetails: {
                     ...element.fileDetails,
                     uri: response.message.outputPath || element.fileDetails.uri,
                     fileSize: response.message.fileSize || element.fileDetails.fileSize,
                     extension: response.message.extension || element.fileDetails.extension,
                  },
               },
            });
         } catch (error) {
            sdkLog('Compression error ==> ', error);
         }
      }

      // ✅ Sort and update state
      sortedMedia = sortedMedia.sort((a, b) => a.index - b.index).map(item => item.compressedData);
      setComponentSelectedImages(sortedMedia);

      // ✅ Close loader first
      setLoading(false);

      // ✅ Delay execution slightly to ensure UI updates before navigation
      setTimeout(() => {
         handleSendMedia(sortedMedia); // Ensure navigation happens AFTER loader is hidden
      }, 100);
   };

   const handleIndexChange = i => {
      pagerRef.current.setPage(i);
   };

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   const handleOnPageSelected = event => {
      const _index = event.nativeEvent.position;
      setActiveIndex(_index); // Update active index when an item is swiped
      scrollRef?.current.scrollToIndex({
         index: _index,
         animated: true,
         viewPosition: 0.5,
      });
   };

   const handleAddButton = () => {
      const params = {
         grpView,
         selectedImages: componentSelectedImages,
      };

      RootNavigation.resetNavigationStack(navigation, GALLERY_PHOTOS_SCREEN, params, [
         MEDIA_PRE_VIEW_SCREEN,
         GALLERY_PHOTOS_SCREEN,
      ]);
   };

   const renderMediaPages = React.useMemo(() => {
      return (
         <PagerView
            onTouchEnd={Keyboard.dismiss}
            style={commonStyles.flex1}
            initialPage={activeIndex}
            ref={pagerRef}
            onPageSelected={handleOnPageSelected}>
            {componentSelectedImages.map((item, i) => {
               const type = getType(item?.fileDetails?.type);
               return (
                  <View style={commonStyles.flex1} key={`tab${i + 1}`}>
                     {
                        {
                           image: (
                              <Image
                                 resizeMode="contain"
                                 source={{ uri: item?.fileDetails?.uri }}
                                 style={styles.tabContainer}
                              />
                           ),
                           video: <VideoInfo item={item} />,
                        }[type]
                     }
                  </View>
               );
            })}
         </PagerView>
      );
   }, [activeIndex, componentSelectedImages]);

   return (
      <KeyboardAvoidingView style={commonStyles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <View onPress={Keyboard.dismiss} style={styles.container}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.justifyContentSpaceBetween,
                  commonStyles.paddingVertical_12,
                  commonStyles.paddingHorizontal_6,
               ]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <IconButton onPress={handleBackBtn} borderRadius="full">
                     <LeftArrowIcon color={'#fff'} />
                  </IconButton>
                  <UserAvathar userId={userId} type={chatType} width={30} height={30} fontsize={14} />
               </View>
               {componentSelectedImages.length > 1 && (
                  <IconButton
                     onPress={() => {
                        let filtered = componentSelectedImages?.filter((item, i) => {
                           return i !== activeIndex;
                        });
                        setComponentSelectedImages(filtered);
                     }}>
                     <DeleteBinIcon color="#fff" />
                  </IconButton>
               )}
            </View>
            {renderMediaPages}

            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
               {preScreen !== CAMERA_SCREEN && componentSelectedImages.length < 10 && (
                  <IconButton onPress={handleAddButton}>{PreViewAddIcon({ color: '#fff' })}</IconButton>
               )}
               {preScreen !== CAMERA_SCREEN && componentSelectedImages.length < 10 && (
                  <View
                     style={[commonStyles.verticalDividerLine, commonStyles.height_25, commonStyles.marginHorizontal_4]}
                  />
               )}
               {preScreen === CAMERA_SCREEN && <IconButton>{RightArrowIcon('#fff')}</IconButton>}
               <TextInput
                  style={[styles.textInput, commonStyles.textColor('#fff')]}
                  defaultValue={componentSelectedImages[activeIndex]?.caption || ''}
                  numberOfLines={1}
                  multiline={true}
                  onChangeText={text => {
                     setComponentSelectedImages(prevImages =>
                        prevImages.map((item, index) => (index === activeIndex ? { ...item, caption: text } : item)),
                     );
                  }}
                  placeholderTextColor="#7f7f7f"
                  selectionColor={themeColorPalatte.primaryColor}
                  placeholder={stringSet.MEDIA_PREVIEW_SCREEN.ADD_CAPTION_LABEL}
                  cursorColor={themeColorPalatte.primaryColor}
               />
               <IconButton
                  onPress={compressSelectedMedia}
                  style={[commonStyles.alignItemsFlexEnd, commonStyles.r_5, commonStyles.b_m5]}>
                  <SendBlueIcon color="#fff" />
               </IconButton>
            </View>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
               <IconButton>{RightArrowIcon('#fff')}</IconButton>
               <NickName style={styles.nickNameColor} userId={userId} />
            </View>
            <FlatList
               keyboardShouldPersistTaps={'always'}
               ref={scrollRef}
               data={componentSelectedImages}
               style={[styles.miniPreViewScroll(componentSelectedImages), { alignSelf: 'flex-start' }]}
               horizontal
               removeClippedSubviews={true}
               showsVerticalScrollIndicator={false}
               pagingEnabled
               keyExtractor={item => item?.fileDetails?.uri}
               renderItem={({ item, index: i }) => {
                  const uri = item?.fileDetails?.thumbImage
                     ? getThumbBase64URL(item?.fileDetails?.thumbImage)
                     : item?.fileDetails?.uri;
                  return (
                     <Pressable
                        activeOpacity={1}
                        key={item?.fileDetails?.uri}
                        style={styles.tabButton}
                        onPress={() => handleIndexChange(i)}>
                        <Image
                           source={{ uri }}
                           style={[
                              styles.tabImage,
                              activeIndex === i && styles.selectedTabImage,
                              { borderColor: themeColorPalatte.primaryColor },
                           ]}
                        />
                     </Pressable>
                  );
               }}
            />
         </View>
         {/* <EmojiOverlay
            place={CHAT_INPUT}
            state={message}
            setState={setMessage}
            visible={isEmojiPickerShowing}
            onClose={toggleEmojiPicker}
            onSelect={handleEmojiSelect}
         /> */}
         <LoadingModal message={loadingMessage} visible={loading} behavior={'custom'} />
      </KeyboardAvoidingView>
   );
}

export default MediaPreView;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'black',
   },
   miniPreViewScroll: componentSelectedImages => {
      return {
         flexGrow: 0,
         display: componentSelectedImages.length > 1 ? 'flex' : 'none',
      };
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
      borderWidth: 2,
   },
   miniPreviewList: { flexGrow: 0 },
   nickNameColor: {
      color: '#7f7f7f',
      width: '90%',
   },
   textInput: {
      flex: 1,
      color: '#fff',
      fontSize: 14,
      minHeight: 20,
      maxHeight: 100,
   },
});
