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
   TextInput,
   View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSelector } from 'react-redux';
import { CHAT_TYPE_GROUP, MIX_BARE_JID } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import Avathar from '../common/Avathar';
import IconButton from '../common/IconButton';
import { DeleteBinIcon, LeftArrowIcon, PreViewAddIcon, RightArrowIcon, SendBlueIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import useRosterData from '../hooks/useRosterData';
import { selectedMediaIdRef } from '../screen/ChatScreen';
import VideoPlayer from './Media/VideoPlayer';
import { getType } from './chat/common/fileUploadValidation';
import NickName from './NickName';

function GalleryPickView(props) {
   const { handleSendMsg, setLocalNav, selectedSingle, setSelectedImages, selectedImages } = props;
   const scrollRef = React.useRef();
   const pagerRef = React.useRef(null);
   const fromUserJid = useSelector(state => state.navigation.fromUserJid);
   const [mediaForcePause, setMediaForcePause] = React.useState(false);
   const [activeIndex, setActiveIndex] = React.useState(0);
   const [componentSelectedImages, setComponentSelectedImages] = React.useState(selectedImages);
   let { nickName, image: imageToken, colorCode } = useRosterData(getUserIdFromJid(fromUserJid));
   const chatType = MIX_BARE_JID.test(fromUserJid) ? CHAT_TYPE_GROUP : '';
   // updating the default values
   nickName = nickName || getUserIdFromJid(fromUserJid) || '';
   imageToken = imageToken || '';

   const handleBackBtn = () => {
      if (selectedSingle) {
         selectedMediaIdRef.current = {};
         setSelectedImages([]);
      }
      setLocalNav('Gallery');
      return true;
   };

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [setSelectedImages, selectedSingle]);

   const handleIndexChange = i => {
      pagerRef.current.setPage(i);
   };

   const handleOnPageSelected = event => {
      setMediaForcePause(true);
      const _index = event.nativeEvent.position;
      setActiveIndex(_index); // Update active index when an item is swiped
      scrollRef?.current.scrollToIndex({
         index: _index,
         animated: true,
         viewPosition: 0.5,
      });
   };

   const handleSendMedia = () => {
      let message = {
         type: 'media',
         content: componentSelectedImages,
      };
      handleSendMsg(message);
   };

   const renderMediaPages = React.useMemo(() => {
      return (
         <PagerView
            style={commonStyles.flex1}
            initialPage={activeIndex}
            ref={pagerRef}
            onPageSelected={handleOnPageSelected}>
            {componentSelectedImages.map((item, i) => {
               const type = getType(item?.fileDetails?.type);
               return (
                  <View key={`tab${i + 1}`}>
                     {
                        {
                           image: (
                              <Image
                                 resizeMode="contain"
                                 source={{ uri: item?.fileDetails?.uri }}
                                 style={styles.tabContainer}
                              />
                           ),
                           video: <VideoPlayer forcePause={{ mediaForcePause, setMediaForcePause }} item={item} />,
                        }[type]
                     }
                  </View>
               );
            })}
         </PagerView>
      );
   }, [componentSelectedImages, mediaForcePause]);

   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <Pressable onPress={Keyboard.dismiss} style={styles.container}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.justifyContentSpaceBetween,
                  commonStyles.paddingVertical_12,
                  commonStyles.paddingHorizontal_6,
               ]}>
               <View style={[commonStyles.hstack]}>
                  <IconButton onPress={handleBackBtn} borderRadius="full">
                     {LeftArrowIcon('#fff')}
                  </IconButton>
                  <Avathar
                     type={chatType}
                     width={30}
                     height={30}
                     fontsize={14}
                     backgroundColor={colorCode}
                     data={nickName}
                     profileImage={imageToken}
                  />
               </View>
               {componentSelectedImages.length > 1 && (
                  <IconButton
                     onPress={() => {
                        let filtered = componentSelectedImages?.filter((item, i) => {
                           if (i === activeIndex) {
                              delete selectedMediaIdRef.current[item?.fileDetails?.uri];
                           }
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
               {componentSelectedImages.length < 10 && (
                  <IconButton
                     onPress={async () => {
                        setSelectedImages(componentSelectedImages);
                        setLocalNav('Gallery');
                     }}>
                     {PreViewAddIcon()}
                  </IconButton>
               )}
               {componentSelectedImages.length < 10 && (
                  <View
                     style={[commonStyles.verticalDividerLine, commonStyles.height_25, commonStyles.marginHorizontal_4]}
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
                  defaultValue={componentSelectedImages[activeIndex]?.caption || ''}
                  numberOfLines={1}
                  multiline={true}
                  onChangeText={text => {
                     componentSelectedImages[activeIndex].caption = text;
                  }}
                  placeholderTextColor="#7f7f7f"
                  selectionColor={'#3276E2'}
                  placeholder="Add a caption..."
                  cursorColor={ApplicationColors.mainColor}
               />
               <IconButton
                  onPress={() => {
                     handleSendMedia();
                     setLocalNav('CHATCONVERSATION');
                  }}
                  style={[commonStyles.alignItemsFlexEnd, commonStyles.r_5, { bottom: -5 }]}>
                  <SendBlueIcon color="#fff" />
               </IconButton>
            </View>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
               <IconButton>{RightArrowIcon('#fff')}</IconButton>
               <NickName style={styles.nickNameColor} userId={getUserIdFromJid(fromUserJid)} />
            </View>
            <FlatList
               keyboardShouldPersistTaps={'always'}
               ref={scrollRef}
               data={componentSelectedImages}
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
                        style={[styles.tabImage, activeIndex === i && styles.selectedTabImage]}
                     />
                  </Pressable>
               )}
            />
         </Pressable>
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
   miniPreviewList: { flexGrow: 0 },
   nickNameColor: {
      color: '#7f7f7f',
   },
});
