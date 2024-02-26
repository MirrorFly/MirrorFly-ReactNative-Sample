import React from 'react';
import { BackHandler, FlatList, Image, Keyboard, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { Divider, HStack, Icon, IconButton, KeyboardAvoidingView, Spacer, Text, View } from 'native-base';
import { useSelector } from 'react-redux';
import { DeleteBinIcon, LeftArrowIcon, PreViewAddIcon, RightArrowIcon, SendBlueIcon } from '../common/Icons';
import Avathar from '../common/Avathar';
import { SceneMap, TabView } from 'react-native-tab-view';
import { getType } from './chat/common/fileUploadValidation';
import VideoPlayer from './Media/VideoPlayer';
import useRosterData from '../hooks/useRosterData';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { selectedMediaIdRef } from '../screen/ChatScreen';

function GalleryPickView(props) {
   const { handleSendMsg, setLocalNav, selectedSingle, setSelectedImages, selectedImages } = props;
   const scrollRef = React.useRef();
   const fromUserJid = useSelector(state => state.navigation.fromUserJid);
   const [index, setIndex] = React.useState(0);
   const [componentSelectedImages, setComponentSelectedImages] = React.useState(selectedImages);
   let { nickName, image: imageToken, colorCode } = useRosterData(getUserIdFromJid(fromUserJid));
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
   }, [selectedSingle]);

   const handleIndexChange = ind => {
      setIndex(ind);
      scrollRef?.current.scrollToIndex({
         index: ind,
         animated: true,
         viewPosition: 0.5,
      });
   };

   const renderTabBar = () => {
      return <></>;
   };

   const handleSendMedia = () => {
      let message = {
         type: 'media',
         content: componentSelectedImages,
      };
      handleSendMsg(message);
   };

   const renderScene = React.useMemo(
      () =>
         SceneMap(
            componentSelectedImages?.reduce((scenes, item, itemIndex) => {
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
      [componentSelectedImages],
   );

   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <Pressable onPress={Keyboard.dismiss} style={styles.container}>
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
               {componentSelectedImages.length > 1 && (
                  <IconButton
                     mr={'2'}
                     onPress={() => {
                        let filtered = componentSelectedImages?.filter((item, i) => {
                           if (i === index) {
                              delete selectedMediaIdRef.current[item?.fileDetails?.uri];
                           }
                           return i !== index;
                        });
                        setComponentSelectedImages(filtered);
                     }}
                     _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                     icon={<Icon as={<DeleteBinIcon color="#fff" />} name="emoji-happy" />}
                     borderRadius="full"
                  />
               )}
            </HStack>
            <TabView
               navigationState={{
                  index,
                  routes: componentSelectedImages?.map((_, i) => ({
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
               {componentSelectedImages.length < 10 && (
                  <IconButton
                     _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                     onPress={async () => {
                        setSelectedImages(componentSelectedImages);
                        setLocalNav('Gallery');
                     }}
                     icon={<Icon as={PreViewAddIcon} name="emoji-happy" />}
                     borderRadius="full"
                  />
               )}
               {componentSelectedImages.length < 10 && (
                  <Divider h="7" bg="#7f7f7f" thickness="1" mx="2" orientation="vertical" />
               )}
               <TextInput
                  style={{
                     flex: 1,
                     color: '#fff',
                     fontSize: 14,
                     minHeight: 20,
                     maxHeight: 100,
                  }}
                  defaultValue={componentSelectedImages[index]?.caption || ''}
                  numberOfLines={1}
                  multiline={true}
                  onChangeText={text => {
                     componentSelectedImages[index].caption = text;
                  }}
                  placeholderTextColor="#7f7f7f"
                  selectionColor={'#3276E2'}
                  placeholder="Add a caption..."
               />
            </HStack>

            <HStack alignItems={'center'} ml={3} mb={5}>
               <IconButton icon={<Icon as={() => RightArrowIcon('#fff')} name="emoji-happy" />} />
               <Text color="#7f7f7f">{nickName}</Text>
            </HStack>
            <FlatList
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
                        style={[styles.tabImage, index === i && styles.selectedTabImage]}
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
});
