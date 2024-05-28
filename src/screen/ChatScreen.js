import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { createRef } from 'react';
import { Alert, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { RESULTS, openSettings } from 'react-native-permissions';
import Sound from 'react-native-sound';
import { batch, useDispatch, useSelector } from 'react-redux';
import { getVideoThumbImage, showCheckYourInternetToast, showToast } from '../Helper';
import { isSingleChat } from '../Helper/Chat/ChatHelper';
import { CHAT_TYPE_GROUP, DOCUMENT_FORMATS, MIX_BARE_JID } from '../Helper/Chat/Constant';
import { fetchGroupParticipants } from '../Helper/Chat/Groups';
import { getMessageObjSender, getRecentChatMsgObj } from '../Helper/Chat/Utility';
import * as RootNav from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import { CameraIcon, ContactIcon, DocumentIcon, GalleryIcon, HeadSetIcon, LocationIcon } from '../common/Icons';
import Modal, { ModalCenteredContent } from '../common/Modal';
import {
   handleAudioPickerSingle,
   handleDocumentPickSingle,
   mediaObjContructor,
   requestAudioStoragePermission,
   requestCameraMicPermission,
   requestContactPermission,
   requestFileStoragePermission,
   requestLocationPermission,
   requestStoragePermission,
} from '../common/utils';
import ChatConversation from '../components/ChatConversation';
import { chatInputMessageRef } from '../components/ChatInput';
import { getType, isValidFileType, validateFileSize, validation } from '../components/chat/common/fileUploadValidation';
import { LOCATION_SCREEN, MOBILE_CONTACT_LIST_SCREEN, RECENTCHATSCREEN } from '../constant';
import { useNetworkStatus } from '../hooks';
import { updateChatConversationLocalNav } from '../redux/Actions/ChatConversationLocalNavAction';
import { addChatConversationHistory, addChatMessage } from '../redux/Actions/ConversationAction';
import { navigate } from '../redux/Actions/NavigationAction';
import { updateRecentChat } from '../redux/Actions/RecentChatAction';
import { deleteRecoverMessage, recoverMessage } from '../redux/Actions/RecoverMessageAction';
import { clearConversationSearchData } from '../redux/Actions/conversationSearchAction';
import store from '../redux/store';
import { mflog } from '../uikitHelpers/uikitMethods';

export const selectedMediaIdRef = createRef();
selectedMediaIdRef.current = {};

function ChatScreen() {
   const navigation = useNavigation();
   const [replyMsg, setReplyMsg] = React.useState('');
   const chatInputRef = React.useRef(null);
   const { data = {} } = useSelector(state => state.recoverMessage);
   const vCardData = useSelector(state => state.profile.profileDetails);
   const toUserJid = useSelector(state => state.navigation.fromUserJid);
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const localNav = useSelector(state => state.chatConversationLocalNav.chatConversationLocalNav);
   const dispatch = useDispatch();
   const [selectedImages, setSelectedImages] = React.useState([]);
   const [selectedSingle, setselectedSingle] = React.useState(false);
   const [alert, setAlert] = React.useState(false);
   const [validate, setValidate] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, []);

   const isNetworkAvailable = useNetworkStatus();

   const setLocalNav = localname => {
      dispatch(updateChatConversationLocalNav(localname));
   };

   useFocusEffect(
      React.useCallback(() => {
         setReplyMsg(data[toUserJid]?.replyMessage || '');

         if (MIX_BARE_JID.test(toUserJid)) {
            fetchGroupParticipants(toUserJid);
         }
      }, [toUserJid]),
   );

   const handleIsSearching = () => {
      setIsSearching(true);
   };

   const handleIsSearchingClose = () => {
      setIsSearching(false);
   };

   const getReplyMessage = message => {
      setReplyMsg(message);
   };

   const getAudioDuration = async path => {
      return new Promise((resolve, reject) => {
         const sound = new Sound(path, Platform.OS === 'ios' ? '' : Sound.MAIN_BUNDLE, error => {
            if (error) {
               return reject(error);
            } else {
               const duration = sound.getDuration();
               return resolve(duration);
            }
         });
      });
   };

   const handleAudioSelect = async () => {
      const audio_permission = await AsyncStorage.getItem('audio_permission');
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
      const audioPermission = await requestAudioStoragePermission();
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      if (audioPermission === 'granted' || audioPermission === 'limited') {
         SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
         let response = await handleAudioPickerSingle();
         mflog(response);
         let _validate = validation(response.type);
         const sizeError = validateFileSize(response.size, getType(response.type));
         if (_validate && !sizeError) {
            setAlert(true);
            setValidate(_validate);
         }
         const audioDuration = await getAudioDuration(response.fileCopyUri);
         response.duration = audioDuration;
         if (sizeError) {
            return showToast(sizeError, {
               id: 'media-size-error-toast',
            });
         }
         if (!_validate && !sizeError) {
            const transformedArray = {
               caption: '',
               fileDetails: mediaObjContructor('DOCUMENT_PICKER', response),
            };
            let message = {
               type: 'media',
               content: [transformedArray],
            };
            handleSendMsg(message);
         }
      } else if (audio_permission) {
         openSettings();
      } else if (audioPermission === RESULTS.BLOCKED) {
         AsyncStorage.setItem('audio_permission', 'true');
      }
   };

   const openDocumentPicker = async () => {
      const storage_permission = await AsyncStorage.getItem('storage_permission');
      const permissionResult = await requestFileStoragePermission();
      if (permissionResult === 'granted' || permissionResult === 'limited') {
         // updating the SDK flag to keep the connection Alive when app goes background because of document picker
         SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
         setTimeout(async () => {
            const file = await handleDocumentPickSingle();
            // updating the SDK flag back to false to behave as usual
            SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
            // Validating the file type and size
            if (!isValidFileType(file.type)) {
               Alert.alert(
                  'Mirrorfly',
                  'You can upload only .pdf, .xls, .xlsx, .doc, .docx, .txt, .ppt, .zip, .rar, .pptx, .csv  files',
               );
               return;
            }
            const error = validateFileSize(file.size, 'file');
            if (error) {
               const toastOptions = {
                  id: 'document-too-large-toast',
                  duration: 2500,
                  avoidKeyboard: true,
               };
               showToast(error, toastOptions);
               return;
            }

            // preparing the object and passing it to the sendMessage function
            const updatedFile = {
               fileDetails: mediaObjContructor('DOCUMENT_PICKER', file),
            };
            const messageData = {
               type: 'media',
               content: [updatedFile],
            };
            handleSendMsg(messageData);
         }, 200);
      } else if (storage_permission) {
         openSettings();
      } else if (permissionResult === RESULTS.BLOCKED) {
         AsyncStorage.setItem('storage_permission', 'true');
      }
   };

   const handleContactSelect = async () => {
      try {
         const isNotFirstTimeContactPermissionCheck = await AsyncStorage.getItem('contact_permission');
         const result = await requestContactPermission();
         if (result === 'granted') {
            navigation.navigate(MOBILE_CONTACT_LIST_SCREEN);
         } else if (isNotFirstTimeContactPermissionCheck) {
            openSettings();
         } else if (result === RESULTS.BLOCKED) {
            AsyncStorage.setItem('contact_permission', 'true');
         }
      } catch (error) {
         console.error('Error requesting contacts permission:', error);
      }
   };
   const handleLocationSelect = async () => {
      try {
         const isNotFirstTimeLocationPermissionCheck = await AsyncStorage.getItem('location_permission');
         const result = await requestLocationPermission();
         if (result === 'granted' || result === 'limited') {
            if (isNetworkAvailable) {
               navigation.navigate(LOCATION_SCREEN);
            } else {
               showCheckYourInternetToast();
            }
         } else if (isNotFirstTimeLocationPermissionCheck) {
            openSettings();
         } else if (result === RESULTS.BLOCKED) {
            AsyncStorage.setItem('location_permission', 'true');
         }
      } catch (error) {
         console.error('Failed to request location permission:', error);
      }
   };

   const attachmentMenuIcons = [
      {
         name: 'Document',
         icon: DocumentIcon,
         formatter: openDocumentPicker,
      },
      {
         name: 'Camera',
         icon: CameraIcon,
         formatter: async () => {
            let cameraPermission = await requestCameraMicPermission();
            let imageReadPermission = await requestStoragePermission();
            const camera_permission = await AsyncStorage.getItem('camera_permission');
            if (cameraPermission === 'granted' && imageReadPermission === 'granted') {
               setLocalNav('CAMERAVIEW');
            } else if (camera_permission) {
               openSettings();
            } else if (cameraPermission === RESULTS.BLOCKED) {
               AsyncStorage.setItem('camera_permission', 'true');
            } else if (imageReadPermission === RESULTS.BLOCKED) {
               AsyncStorage.setItem('storage_permission', 'true');
            }
         },
      },
      {
         name: 'Gallery',
         icon: GalleryIcon,
         formatter: async () => {
            const storage_permission = await AsyncStorage.getItem('storage_permission');
            let imageReadPermission = await requestStoragePermission();
            if (imageReadPermission === 'granted' || imageReadPermission === 'limited') {
               setLocalNav('Gallery');
            } else if (storage_permission) {
               openSettings();
            } else if (imageReadPermission === RESULTS.BLOCKED) {
               AsyncStorage.setItem('storage_permission', 'true');
            }
         },
      },
      {
         name: 'Audio',
         icon: HeadSetIcon,
         formatter: async () => {
            handleAudioSelect();
         },
      },
      {
         name: 'Contact',
         icon: ContactIcon,
         formatter: async () => {
            handleContactSelect();
         },
      },
      {
         name: 'Location',
         icon: LocationIcon,
         formatter: handleLocationSelect,
      },
   ];

   const handleRecoverMessage = () => {
      let textMessage = chatInputMessageRef.current;
      if (textMessage || replyMsg) {
         const recoverMessageData = {
            textMessage: textMessage || '',
            replyMessage: replyMsg || '',
            toUserJid: toUserJid || '',
         };
         dispatch(recoverMessage(recoverMessageData));
      } else if (toUserJid in data) {
         dispatch(deleteRecoverMessage(toUserJid));
      }
   };

   const handleBackBtn = () => {
      handleRecoverMessage();
      if (isSearching) {
         setIsSearching(false);
         dispatch(clearConversationSearchData());
      } else if (localNav === 'CHATCONVERSATION') {
         let x = {
            screen: RECENTCHATSCREEN,
            fromUserJID: '',
            profileDetails: {},
         };
         dispatch(navigate(x));
         if (RootNav.navigationRef.canGoBack()) {
            RootNav.goBack();
         } else {
            RootNav.reset(RECENTCHATSCREEN);
         }
      }
      return true;
   };

   const getThumbImage = async uri => {
      const result = await ImageCompressor.compress(uri, {
         maxWidth: 200,
         maxHeight: 200,
         quality: 0.8,
      });
      const response = await RNFS.readFile(result, 'base64');
      return response;
   };

   /**
  // const getVideoThumbImage = async uri => {
  //   let response;
  //   if (Platform.OS === 'ios') {
  //     if (uri.includes('ph://')) {
  //       let result = await ImageCompressor.compress(uri, {
  //         maxWidth: 600,
  //         maxHeight: 600,
  //         quality: 0.8,
  //       });
  //       response = await RNFS.readFile(result, 'base64');
  //     } else {
  //       const frame = await createThumbnail({
  //         url: uri,
  //         timeStamp: 10000,
  //       });
  //       response = await RNFS.readFile(frame.path, 'base64');
  //     }
  //   } else {
  //     const frame = await createThumbnail({
  //       url: uri,
  //       timeStamp: 10000,
  //     });
  //     response = await RNFS.readFile(frame.path, 'base64');
  //   }
  //   return response;
  // };
   */

   const sendMediaMessage = async (messageType, files, chatTypeSendMsg) => {
      let jidSendMediaMessage = toUserJid;
      if (messageType === 'media') {
         let mediaData = {};
         for (let i = 0; i < files.length; i++) {
            const file = files[i],
               msgId = SDK.randomString(8, 'BA');

            const {
               caption = '',
               fileDetails = {},
               fileDetails: { fileSize, filename, duration, uri, type, replyTo = '' } = {},
            } = file;

            const isDocument = DOCUMENT_FORMATS.includes(type);
            const msgType = isDocument ? 'file' : type.split('/')[0];
            const thumbImage = msgType === 'image' ? await getThumbImage(uri) : '';
            const thumbVideoImage = msgType === 'video' ? await getVideoThumbImage(uri) : '';
            let fileOptions = {
               fileName: filename,
               fileSize: fileSize,
               caption: caption,
               uri: uri,
               duration: duration,
               msgId: msgId,
               thumbImage: thumbImage || thumbVideoImage,
            };
            const userProfile = vCardData;

            const dataObj = {
               jid: jidSendMediaMessage,
               msgType,
               userProfile,
               chatType: chatTypeSendMsg,
               msgId,
               file,
               fileOptions,
               fileDetails: fileDetails,
               fromUserJid: currentUserJID,
               replyTo,
            };
            const conversationChatObj = getMessageObjSender(dataObj, i);
            mediaData[msgId] = conversationChatObj;
            const recentChatObj = getRecentChatMsgObj(dataObj);

            const dispatchData = {
               data: [conversationChatObj],
               ...(isSingleChat(chatTypeSendMsg)
                  ? { userJid: jidSendMediaMessage }
                  : { groupJid: jidSendMediaMessage }),
            };
            batch(() => {
               store.dispatch(addChatConversationHistory(dispatchData));
               store.dispatch(updateRecentChat(recentChatObj));
            });
         }
         setSelectedImages([]);
         selectedMediaIdRef.current = {};
      }
   };

   const parseAndSendMessage = async (message, chatType, messageType) => {
      const { content } = message;
      const replyTo = replyMsg?.msgId || '';
      content[0].fileDetails.replyTo = replyTo;
      setReplyMsg('');
      sendMediaMessage(messageType, content, chatType);
   };

   const handleMedia = item => {
      const sizeError = validateFileSize(item.image.fileSize, getType(item.type));
      if (sizeError) {
         return showToast(sizeError, {
            id: 'media-size-error-toast',
         });
      }
      selectedMediaIdRef.current[item?.image?.uri] = true;
      const transformedArray = {
         caption: '',
         fileDetails: mediaObjContructor('CAMERA_ROLL', item),
      };
      setselectedSingle(true);
      setSelectedImages([transformedArray]);
      setLocalNav('GalleryPickView');
   };

   const handleSelectImage = React.useCallback(
      item => {
         setselectedSingle(false);
         const sizeError = validateFileSize(item.image.fileSize, getType(item.type));
         const isImageSelected = selectedMediaIdRef.current[item?.image?.uri];

         if (selectedImages.length >= 10 && !isImageSelected) {
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
         if (isImageSelected) {
            delete selectedMediaIdRef.current[item?.image?.uri];
            setSelectedImages(prevArray =>
               prevArray.filter(selectedItem => selectedItem.fileDetails?.uri !== item?.image?.uri),
            );
         } else {
            selectedMediaIdRef.current[item?.image?.uri] = true;
            setSelectedImages(prevArray => [...prevArray, transformedArray]);
         }
      },
      [selectedImages],
   );

   const constructAndDispatchConversationAndRecentChatData = dataObj => {
      const conversationChatObj = getMessageObjSender(dataObj);
      const recentChatObj = getRecentChatMsgObj(dataObj);
      const dispatchData = {
         data: [conversationChatObj],
         ...(isSingleChat(dataObj.chatType) ? { userJid: dataObj.jid } : { groupJid: dataObj.jid }), // check this when group works
      };
      batch(() => {
         store.dispatch(addChatConversationHistory(dispatchData));
         store.dispatch(addChatMessage(dispatchData.data));
         store.dispatch(updateRecentChat(recentChatObj));
      });
   };

   const handleSendMsg = async message => {
      const messageType = message.type;

      if (toUserJid in data) {
         dispatch(deleteRecoverMessage(toUserJid));
      }

      const msgId = SDK.randomString(8, 'BA');
      if (messageType === 'media') {
         parseAndSendMessage(message, MIX_BARE_JID.test(toUserJid) ? CHAT_TYPE_GROUP : 'chat', messageType);
      } else {
         if (message.content !== '') {
            const dataObj = {
               jid: toUserJid,
               msgType: 'text',
               message: message.content,
               userProfile: vCardData,
               chatType: MIX_BARE_JID.test(toUserJid) ? CHAT_TYPE_GROUP : 'chat',
               msgId,
               fromUserJid: currentUserJID,
               publisherJid: currentUserJID,
               replyTo: message.replyTo,
            };
            constructAndDispatchConversationAndRecentChatData(dataObj);
            SDK.sendTextMessage(toUserJid, message.content, msgId, message.replyTo);
         }
      }
      setReplyMsg('');
   };

   const onClose = () => {
      setAlert(false);
      setValidate('');
   };

   return (
      <>
         <ChatConversation
            handleRecoverMessage={handleRecoverMessage}
            replyMsg={replyMsg}
            chatInputRef={chatInputRef}
            onReplyMessage={getReplyMessage}
            handleBackBtn={handleBackBtn}
            setLocalNav={setLocalNav}
            attachmentMenuIcons={attachmentMenuIcons}
            selectedImages={selectedImages}
            handleSendMsg={handleSendMsg}
            handleIsSearching={handleIsSearching}
            handleIsSearchingClose={handleIsSearchingClose}
            IsSearching={isSearching}
         />
         {/* {
            {
               CHATCONVERSATION: (
                  <ChatConversation
                     handleRecoverMessage={handleRecoverMessage}
                     replyMsg={replyMsg}
                     chatInputRef={chatInputRef}
                     onReplyMessage={getReplyMessage}
                     handleBackBtn={handleBackBtn}
                     setLocalNav={setLocalNav}
                     attachmentMenuIcons={attachmentMenuIcons}
                     selectedImages={selectedImages}
                     handleSendMsg={handleSendMsg}
                     handleIsSearching={handleIsSearching}
                     handleIsSearchingClose={handleIsSearchingClose}
                     IsSearching={isSearching}
                  />
               ),
               GalleryPickView: (
                  <GalleryPickView
                     setSelectedImages={setSelectedImages}
                     selectedSingle={selectedSingle}
                     selectedImages={selectedImages}
                     setLocalNav={setLocalNav}
                     handleSendMsg={handleSendMsg}
                  />
               ),
               Gallery: (
                  <SavePicture
                     setLocalNav={setLocalNav}
                     selectedImages={selectedImages}
                     handleSelectImage={handleSelectImage}
                     handleMedia={handleMedia}
                     setSelectedImages={setSelectedImages}
                  />
               ),
               CAMERAVIEW: (
                  <Camera
                     setLocalNav={setLocalNav}
                     selectedImages={selectedImages}
                     setSelectedImages={setSelectedImages}
                  />
               ),
               CameraPickView: (
                  <CameraPickView
                     chatUser={toUserJid}
                     setSelectedImages={setSelectedImages}
                     selectedSingle={selectedSingle}
                     selectedImages={selectedImages}
                     setLocalNav={setLocalNav}
                     handleSendMsg={handleSendMsg}
                  />
               ),
            }[localNav]
         } */}
         <Modal visible={alert}>
            <ModalCenteredContent>
               <View style={styles.modalContentContainer}>
                  <Text style={styles.modalMessageText}>{validate}</Text>
                  <View style={styles.modalActionButtonContainer}>
                     <Pressable onPress={onClose}>
                        <Text style={styles.modalOkButton}>OK</Text>
                     </Pressable>
                  </View>
               </View>
            </ModalCenteredContent>
         </Modal>
      </>
   );
}

export default ChatScreen;

const styles = StyleSheet.create({
   modalContentContainer: {
      width: '85%',
      borderRadius: 0,
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: '#fff',
   },
   modalMessageText: {
      fontSize: 16,
      color: 'black',
   },
   modalOkButton: {
      fontWeight: '500',
      color: '#3276E2',
   },
   modalActionButtonContainer: {
      flexDirection: 'row',
      flexGrow: 1,
      justifyContent: 'flex-end',
      marginRight: 8,
      paddingBottom: 8,
      paddingTop: 24,
   },
});
