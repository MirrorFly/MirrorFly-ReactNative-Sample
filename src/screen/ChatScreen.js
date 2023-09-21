import AsyncStorage from '@react-native-async-storage/async-storage';
import SDK from '../SDK/SDK';
import React from 'react';
import {
  Alert,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { openSettings } from 'react-native-permissions';
import Sound from 'react-native-sound';
import { batch, useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { showToast } from '../Helper';
import { isSingleChat } from '../Helper/Chat/ChatHelper';
import { DOCUMENT_FORMATS } from '../Helper/Chat/Constant';
import {
  getMessageObjSender,
  getRecentChatMsgObj,
  getUserIdFromJid,
} from '../Helper/Chat/Utility';
import * as RootNav from '../Navigation/rootNavigation';
import {
  CameraIcon,
  ContactIcon,
  DocumentIcon,
  GalleryIcon,
  HeadSetIcon,
  LocationIcon,
} from '../common/Icons';
import {
  handleAudioPickerSingle,
  handleDocumentPickSingle,
  mediaObjContructor,
  requestAudioStoragePermission,
  requestCameraPermission,
  requestFileStoragePermission,
  requestStoragePermission,
} from '../common/utils';
import CameraPickView from '../components/CameraPickView';
import ChatConversation from '../components/ChatConversation';
import GalleryPickView from '../components/GalleryPickView';
import MessageInfo from '../components/MessageInfo';
import PostPreViewPage from '../components/PostPreViewPage';
import Camera from '../components/RNCamera';
import UserInfo from '../components/UserInfo';
import UsersTapBarInfo from '../components/UsersTapBarInfo';
import {
  getType,
  isValidFileType,
  validateFileSize,
  validation,
} from '../components/chat/common/fileUploadValidation';
import { RECENTCHATSCREEN } from '../constant';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import { updateRecentChat } from '../redux/Actions/RecentChatAction';
import store from '../redux/store';
import SavePicture from './Gallery';
import { createThumbnail } from 'react-native-create-thumbnail';
import ContactList from '../components/Media/ContactList';
import { navigate } from '../redux/Actions/NavigationAction';
import { clearConversationSearchData } from '../redux/Actions/conversationSearchAction';
import {
  deleteRecoverMessage,
  recoverMessage,
} from '../redux/Actions/RecoverMessageAction';
import { useFocusEffect } from '@react-navigation/native';
import { chatInputMessageRef } from '../components/ChatInput';
import Location from '../components/Media/Location';
import Modal, { ModalCenteredContent } from '../common/Modal';

function ChatScreen() {
  const [replyMsg, setReplyMsg] = React.useState('');
  const chatInputRef = React.useRef(null);
  const { data = {} } = useSelector(state => state.recoverMessage);
  const vCardData = useSelector(state => state.profile.profileDetails);
  const toUserJid = useSelector(state => state.navigation.fromUserJid);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const [localNav, setLocalNav] = React.useState('CHATCONVERSATION');
  const [isMessageInfo, setIsMessageInfo] = React.useState({});
  const dispatch = useDispatch();
  const [isToastShowing, setIsToastShowing] = React.useState(false);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [selectedSingle, setselectedSingle] = React.useState(false);
  const [alert, setAlert] = React.useState(false);
  const [validate, setValidate] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setReplyMsg(data[toUserJid]?.replyMessage || '');
    }, [toUserJid]),
  );

  const handleIsSearching = () => {
    setIsSearching(true);
  };

  const handleIsSearchingClose = () => {
    setIsSearching(false);
  };

  const toUserId = React.useMemo(
    () => getUserIdFromJid(toUserJid),
    [toUserJid],
  );

  const getReplyMessage = message => {
    setReplyMsg(message);
  };

  const getAudioDuration = async path => {
    return new Promise((resolve, reject) => {
      const sound = new Sound(
        path,
        Platform.OS === 'ios' ? '' : Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            return reject(error);
          } else {
            const duration = sound.getDuration();
            return resolve(duration);
          }
        },
      );
    });
  };

  const handleAudioSelect = async () => {
    const storage_permission = await AsyncStorage.getItem('storage_permission');
    AsyncStorage.setItem('storage_permission', 'true');
    let MediaPermission = await requestAudioStoragePermission();
    if (MediaPermission === 'granted' || MediaPermission === 'limited') {
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
      let response = await handleAudioPickerSingle();
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
    } else if (storage_permission) {
      openSettings();
    }
  };

  const openDocumentPicker = async () => {
    const storage_permission = await AsyncStorage.getItem('storage_permission');
    AsyncStorage.setItem('storage_permission', 'true');
    const permissionResult = await requestFileStoragePermission();
    if (permissionResult === 'granted' || permissionResult === 'limited') {
      // updating the SDK flag to keep the connection Alive when app goes background because of document picker
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
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
    } else if (storage_permission) {
      openSettings();
    }
  };

  const handleContactSelect = () => {
    setLocalNav('ContactList');
  };
  const handleLocationSelect = async () => {
    setLocalNav('LocationInfo');
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
        let cameraPermission = await requestCameraPermission();
        let imageReadPermission = await requestStoragePermission();
        const camera_permission = await AsyncStorage.getItem(
          'camera_permission',
        );
        AsyncStorage.setItem('camera_permission', 'true');
        if (
          (cameraPermission === 'granted' || cameraPermission === 'limited') &&
          (imageReadPermission === 'granted' ||
            imageReadPermission === 'limited')
        ) {
          setLocalNav('CAMERAVIEW');
        } else if (camera_permission) {
          openSettings();
        }
      },
    },
    {
      name: 'Gallery',
      icon: GalleryIcon,
      formatter: async () => {
        const storage_permission = await AsyncStorage.getItem(
          'storage_permission',
        );
        AsyncStorage.setItem('storage_permission', 'true');
        let imageReadPermission = await requestStoragePermission();
        if (
          imageReadPermission === 'granted' ||
          imageReadPermission === 'limited'
        ) {
          setLocalNav('Gallery');
        } else if (storage_permission) {
          openSettings();
        }
        /** SavePicture()
        RNimageGalleryLaunch()
          const res = await handleGalleryPickerMulti(toast)
          const transformedArray = res?.map((obj, index) => {
            return {
              caption: '',
              image: obj
            };
          });
          setSelectedImages(transformedArray)
          if (res?.length) {
            setLocalNav('GalleryPickView')
          } */
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
      RootNav.navigate(RECENTCHATSCREEN);
    }
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  const getThumbImage = async uri => {
    const result = await ImageCompressor.compress(uri, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.8,
    });
    const response = await RNFS.readFile(result, 'base64');
    return response;
  };

  const getVideoThumbImage = async uri => {
    let response;
    if (Platform.OS === 'ios') {
      if (uri.includes('ph://')) {
        let result = await ImageCompressor.compress(uri, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.8,
        });
        response = await RNFS.readFile(result, 'base64');
      } else {
        const frame = await createThumbnail({
          url: uri,
          timeStamp: 10000,
        });
        response = await RNFS.readFile(frame.path, 'base64');
      }
    } else {
      const frame = await createThumbnail({
        url: uri,
        timeStamp: 10000,
      });
      response = await RNFS.readFile(frame.path, 'base64');
    }
    return response;
  };

  const sendMediaMessage = async (messageType, files, chatTypeSendMsg) => {
    let jidSendMediaMessage = toUserJid;
    if (messageType === 'media') {
      let mediaData = {};
      for (let i = 0; i < files.length; i++) {
        const file = files[i],
          msgId = uuidv4();

        const {
          caption = '',
          fileDetails = {},
          fileDetails: {
            fileSize,
            filename,
            duration,
            uri,
            type,
            replyTo = '',
          } = {},
        } = file;

        const isDocument = DOCUMENT_FORMATS.includes(type);
        const msgType = isDocument ? 'file' : type.split('/')[0];
        const thumbImage = msgType === 'image' ? await getThumbImage(uri) : '';
        const thumbVideoImage =
          msgType === 'video' ? await getVideoThumbImage(uri) : '';
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
    const transformedArray = {
      caption: '',
      fileDetails: mediaObjContructor('CAMERA_ROLL', item),
    };
    setIsToastShowing(true);
    const sizeError = validateFileSize(item.image.fileSize, getType(item.type));
    if (sizeError && !isToastShowing) {
      return showToast(sizeError, {
        id: 'media-size-error-toast',
      });
    }
    if (!isToastShowing) {
      setIsToastShowing(false);
      setselectedSingle(true);
      setSelectedImages([transformedArray]);
      setLocalNav('GalleryPickView');
    }
  };

  const handleSelectImage = item => {
    const transformedArray = {
      caption: '',
      fileDetails: mediaObjContructor('CAMERA_ROLL', item),
    };
    setIsToastShowing(true);
    setselectedSingle(false);
    const sizeError = validateFileSize(item.image.fileSize, getType(item.type));
    const isImageSelected = selectedImages.some(
      selectedItem => selectedItem.fileDetails?.uri === item?.image.uri,
    );
    if (!isToastShowing && selectedImages.length >= 10 && !isImageSelected) {
      return showToast("Can't share more than 10 media items", {
        id: 'media-error-toast',
      });
    }

    if (sizeError && !isToastShowing) {
      return showToast(sizeError, {
        id: 'media-size-error-toast',
      });
    }

    if (!isToastShowing) {
      setIsToastShowing(false);
      if (isImageSelected) {
        setSelectedImages(prevArray =>
          prevArray.filter(
            selectedItem => selectedItem.fileDetails?.uri !== item?.image?.uri,
          ),
        );
      } else {
        setSelectedImages(prevArray => [...prevArray, transformedArray]);
      }
    }
  };

  const constructAndDispatchConversationAndRecentChatData = dataObj => {
    const conversationChatObj = getMessageObjSender(dataObj);
    const recentChatObj = getRecentChatMsgObj(dataObj);
    const dispatchData = {
      data: [conversationChatObj],
      ...(isSingleChat('chat')
        ? { userJid: dataObj.jid }
        : { groupJid: dataObj.jid }), // check this when group works
    };
    batch(() => {
      store.dispatch(addChatConversationHistory(dispatchData));
      store.dispatch(updateRecentChat(recentChatObj));
    });
  };

  const handleSendMsg = async message => {
    const messageType = message.type;

    if (toUserJid in data) {
      dispatch(deleteRecoverMessage(toUserJid));
    }

    const msgId = uuidv4();
    switch (messageType) {
      case 'media':
        parseAndSendMessage(message, 'chat', messageType);
        break;
      case 'location':
        const replyTo = replyMsg?.msgId || '';
        const { latitude, longitude } = message.location || {};
        if (latitude && longitude) {
          const dataObj = {
            jid: toUserJid,
            msgType: messageType,
            userProfile: vCardData,
            chatType: 'chat',
            msgId,
            location: { latitude, longitude },
            fromUserJid: currentUserJID,
            replyTo: replyTo,
          };
          constructAndDispatchConversationAndRecentChatData(dataObj);
          SDK.sendLocationMessage(
            toUserJid,
            latitude,
            longitude,
            msgId,
            replyTo,
          );
        }
        break;
      default: // default to text message
        if (message.content !== '') {
          const dataObj = {
            jid: toUserJid,
            msgType: 'text',
            message: message.content,
            userProfile: vCardData,
            chatType: 'chat',
            msgId,
            fromUserJid: currentUserJID,
            replyTo: message.replyTo,
          };
          constructAndDispatchConversationAndRecentChatData(dataObj);
          SDK.sendTextMessage(
            toUserJid,
            message.content,
            msgId,
            message.replyTo,
          );
        }
        break;
    }
  };

  const onClose = () => {
    setAlert(false);
    setValidate('');
  };

  React.useEffect(() => {
    // handleImageConvert()
    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <>
      {
        {
          CHATCONVERSATION: (
            <ChatConversation
              replyMsg={replyMsg}
              chatInputRef={chatInputRef}
              onReplyMessage={getReplyMessage}
              handleBackBtn={handleBackBtn}
              setLocalNav={setLocalNav}
              setIsMessageInfo={setIsMessageInfo}
              attachmentMenuIcons={attachmentMenuIcons}
              selectedImages={selectedImages}
              handleSendMsg={handleSendMsg}
              handleIsSearching={handleIsSearching}
              handleIsSearchingClose={handleIsSearchingClose}
              IsSearching={isSearching}
            />
          ),
          MESSAGEINFO: (
            <MessageInfo
              setLocalNav={setLocalNav}
              setIsMessageInfo={setIsMessageInfo}
              isMessageInfo={isMessageInfo}
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
          UserInfo: <UserInfo setLocalNav={setLocalNav} toUserId={toUserId} />,
          UsersTapBarInfo: <UsersTapBarInfo setLocalNav={setLocalNav} />,
          ContactList: <ContactList setLocalNav={setLocalNav} />,
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
              setSelectedImages={setSelectedImages}
              selectedSingle={selectedSingle}
              selectedImages={selectedImages}
              setLocalNav={setLocalNav}
              handleSendMsg={handleSendMsg}
            />
          ),
          PostPreView: (
            <PostPreViewPage
              setLocalNav={setLocalNav}
              setSelectedImages={setSelectedImages}
            />
          ),

          LocationInfo: (
            <Location setLocalNav={setLocalNav} handleSendMsg={handleSendMsg} />
          ),
        }[localNav]
      }
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
