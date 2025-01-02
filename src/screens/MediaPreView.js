import { useNavigation, useRoute } from '@react-navigation/native';
import { DOMParser } from '@xmldom/xmldom';
import React from 'react';
import {
   BackHandler,
   FlatList,
   Image,
   Keyboard,
   KeyboardAvoidingView,
   NativeModules,
   Platform,
   Pressable,
   StyleSheet,
   TextInput,
   View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import IconButton from '../common/IconButton';
import { DeleteBinIcon, LeftArrowIcon, PreViewAddIcon, RightArrowIcon, SendBlueIcon } from '../common/Icons';
import NickName from '../common/NickName';
import VideoInfo from '../common/VideoInfo';
import UserAvathar from '../components/UserAvathar';
import ApplicationColors from '../config/appColors';
import { getCurrentChatUser, getType, getUserIdFromJid } from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP, MIX_BARE_JID } from '../helpers/constants';
import commonStyles from '../styles/commonStyles';
import { CAMERA_SCREEN, GALLERY_PHOTOS_SCREEN } from './constants';

const messagObj = {
   message: '',
   message_type: 'video',
   media: {
      thumb_image: '',
      caption: '',
      file_size: 0,
      fileName: '',
      file_url: '',
      file_key: '',
      duration: 0,
      is_uploading: 2,
      originalWidth: 1080,
      originalHeight: 2400,
      androidHeight: 320,
      androidWidth: 210,
      webHeight: 338,
      webWidth: 240,
      isLargeFile: true,
   },
   nickName: 'Player mf 5',
};

const { MediaService } = NativeModules;
console.log('MediaService ==>', MediaService);
let subscription = null,
   commitUrl,
   fileUploadDetails = {};

const init = () => {
   try {
      MediaService?.baseUrlInit?.(config.API_URL + '/');
   } catch (error) {
      mflog('init error', error);
   }
};

// // // init();

// // // 9170942293751735303909071tlEI000Ot4arFeB89Xne.mp4 iTF5bkx1Iu02y45rU8J9IiakFrz5Vsii
// // // 91709422937517353003085353SG532RaATaivtT3Wm62.mp4

// const generateUniqueFilePath = async (filePath, counter = 0) => {
//    // Modify the file path if the counter is greater than 0
//    const extension = filePath.substring(filePath.lastIndexOf('.') + 1);
//    const baseName = filePath.substring(0, filePath.lastIndexOf('.'));
//    const modifiedFilePath = counter > 0 ? `${baseName}(${counter}).${extension}` : filePath;

//    // Check if the file exists
//    const exists = await RNFS.exists(modifiedFilePath);
//    // Return the modified file path if it does not exist, otherwise recurse
//    return exists ? generateUniqueFilePath(filePath, counter + 1) : modifiedFilePath;
// };

// const handleNativeLargeFile = async (obj, file) => {
//    try {
//       messagObj.media.thumb_image = await getVideoThumbImage(file.uri, file.duration);
//       const eventEmitter = new NativeEventEmitter(MediaService);

//       // Listen for progress updates
//       subscription = eventEmitter.addListener('UploadProgress', progress => {
//          console.log('Upload Progress:', progress);
//          if (progress.progress == 100) {
//             subscription.remove();
//          }
//       });
//       // Step 1: Initialize values for encryption
//       const initRes = await MediaService.defineValues(obj);
//       if (!initRes?.success) {
//          mflog('Upload File defineValues failed:', JSON.stringify(initRes, null, 2));
//          return;
//       }
//       console.log('Upload File encryptionKey ==>', initRes?.encryptionKey);
//       fileUploadDetails.encryptkey = initRes?.encryptionKey;

//       messagObj.media.file_key = initRes?.encryptionKey;
//       // Step 2: Encrypt the file after successful initialization
//       const encryptFileRes = await MediaService.encryptFile();
//       if (!encryptFileRes?.success) {
//          mflog('Upload File encryption failed:', JSON.stringify(encryptFileRes, null, 2));
//          return;
//       }
//       fileUploadDetails.encryptedFilePath = encryptFileRes.encryptedFilePath;
//       console.log('Upload File encryption successful:', JSON.stringify(encryptFileRes, null, 2));
//       const msgId = SDK.randomString();
//       const _file = await RNFS.stat(encryptFileRes.encryptedFilePath);
//       console.log('file ==>', file);
//       console.log('_file ==>', _file);
//       // return
//       const largeFileUploadRes = await SDK.largeFileUpload({
//          file: { ...file, ..._file },
//          chatType: 'chat',
//          toUser: currentChatUser,
//          msgId,
//       });
//       const { status, data: { fileToken, commitUrl: _commitUrl, uploadId, storage, uploadUrls } = {} } =
//          largeFileUploadRes;
//       if (status !== 200) return;
//       messagObj.media.file_url = fileToken;
//       messagObj.media = {
//          ...messagObj.media,
//          ...file,
//       };
//       messagObj.media.file_size = _file.size;
//       fileUploadDetails.fileToken = fileToken;
//       commitUrl = _commitUrl;
//       console.log('messagObj ==>', messagObj);
//       const result = await MediaService.uploadFileInChunks(uploadUrls, encryptFileRes.encryptedFilePath);

//       console.log('Upload File Result:', result);
//       await SDK.uploadCommitURL(_commitUrl);
//       console.log('Upload message object ==>', messagObj);
//       // return;
//       const cipher = SDK.encryptMsg(JSON.stringify(messagObj), msgId);

//       const messageIQ = $msg({
//          to: currentChatUser,
//          type: 'chat',
//          id: msgId,
//       })
//          .c('chatcontent', {
//             xmlns: 'jabber:client',
//             message_type: 'video',
//             broadcast_id: '',
//          })
//          .up()
//          .c('body', {
//             message_type: 'video',
//          })
//          .t(cipher);

//       const stanza = `<message
//          id=${msgId}
//          to=${currentChatUser}
//          type="chat"
//          xmlns="jabber:client">
//          <chatcontent
//             broadcast_id=""
//             message_type="video"
//             xmlns="urn:xmpp:content"
//          />
//          <body message_type="video">${cipher}</body>
//       </message>`;

// const xmlDoc = new DOMParser().parseFromString(stanza, 'text/xml').firstChild;

//       SDK.getConnection?.().sendIQ(xmlDoc);
//    } catch (error) {
//       mflog('Upload Error:', error);
//    }
// };

const fileEncryption = async selectedItems => {
   try {
      const file = selectedItems[0].fileDetails;
      file.size = file.fileSize;
      // Step 1: Initialize values for encryption
      // const initRes = await MediaService.defineValues(obj);
      // if (!initRes?.success) {
      //    mflog('Upload File defineValues failed:', JSON.stringify(initRes, null, 2));
      //    return;
      // }
      // console.log('Upload File encryptionKey ==>', initRes?.encryptionKey);
      // fileUploadDetails.encryptkey = initRes?.encryptionKey;
      // messagObj.media.file_key = initRes?.encryptionKey;
      // Step 2: Encrypt the file after successful initialization
      // const encryptFileRes = await MediaService.encryptFile();
      // if (!encryptFileRes?.success) {
      //    mflog('Upload File encryption failed:', JSON.stringify(encryptFileRes, null, 2));
      //    return;
      // }
      // fileUploadDetails.encryptedFilePath = encryptFileRes.encryptedFilePath;
      // console.log('Upload File encryption successful:', JSON.stringify(encryptFileRes, null, 2));
      // return;
      const msgId = SDK.randomString();
      const largeFileUploadRes = await SDK.largeFileUpload({
         file,
         chatType: 'chat',
         toUser: currentChatUser,
         msgId,
      });
      const { status, data: { fileToken, commitUrl: _commitUrl, uploadId, storage, uploadUrls } = {} } =
         largeFileUploadRes;
      if (status !== 200) return;
      commitUrl = _commitUrl;
      const result = await MediaService.uploadFileInChunks(uploadUrls, file.uri);
      console.log('Upload File Result:', result);
      _commitUrl && (await SDK.uploadCommitURL(_commitUrl));

      messagObj.media.file_url = fileToken;
      messagObj.media.thumb_image = file.thumbImage;
      messagObj.media.file_size = file.fileSize;
      messagObj.media.duration = file.duration;
      delete file.thumbImage;

      console.log('messagObj ==>', JSON.stringify(messagObj, null, 2));

      const cipher = SDK.encryptMsg(JSON.stringify(messagObj), msgId);

      const stanza = `<message
         id=${msgId}
         to=${currentChatUser}
         type="chat"
         xmlns="jabber:client">
         <chatcontent
            broadcast_id=""
            message_type="video"
            xmlns="urn:xmpp:content"
         />
         <body message_type="video">${cipher}</body>
      </message>`;

      const xmlDoc = new DOMParser().parseFromString(stanza, 'text/xml').firstChild;

      SDK.getConnection?.().sendIQ(xmlDoc);
   } catch (error) {
      console.log('fileEncryption ==>', error);
   }
};

function MediaPreView() {
   const chatUser = getCurrentChatUser();
   const { params: { grpView, preScreen = '', selectedImages } = {} } = useRoute();
   const userId = getUserIdFromJid(chatUser);
   const navigation = useNavigation();
   const pagerRef = React.useRef(null);
   const scrollRef = React.useRef();
   const [activeIndex, setActiveIndex] = React.useState(0);
   const chatType = MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : '';
   const [componentSelectedImages, setComponentSelectedImages] = React.useState(selectedImages);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, []);

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
      navigation.navigate(GALLERY_PHOTOS_SCREEN, {
         grpView,
         selectedImages: componentSelectedImages,
      });
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
               <View style={[commonStyles.hstack]}>
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
                  <IconButton onPress={handleAddButton}>{PreViewAddIcon()}</IconButton>
               )}
               {preScreen !== CAMERA_SCREEN && componentSelectedImages.length < 10 && (
                  <View
                     style={[commonStyles.verticalDividerLine, commonStyles.height_25, commonStyles.marginHorizontal_4]}
                  />
               )}
               {preScreen === CAMERA_SCREEN && <IconButton>{RightArrowIcon('#fff')}</IconButton>}
               <TextInput
                  style={styles.textInput}
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
                  onPress={() => fileEncryption(componentSelectedImages)}
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
               style={[styles.miniPreViewScroll(componentSelectedImages)]}
               horizontal
               removeClippedSubviews={true}
               showsVerticalScrollIndicator={false}
               keyExtractor={item => item?.fileDetails?.uri}
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
         </View>
         {/* <EmojiOverlay
            place={CHAT_INPUT}
            state={message}
            setState={setMessage}
            visible={isEmojiPickerShowing}
            onClose={toggleEmojiPicker}
            onSelect={handleEmojiSelect}
         /> */}
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
      borderColor: '#3276E2',
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
