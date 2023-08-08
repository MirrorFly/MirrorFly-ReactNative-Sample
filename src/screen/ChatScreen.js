import {
  AlertDialog,
  Box,
  HStack,
  Pressable,
  Text,
  Toast,
  useToast,
} from 'native-base';
import React from 'react';
import { BackHandler } from 'react-native';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { isSingleChat } from '../Helper/Chat/ChatHelper';
import {
  getMessageObjSender,
  getRecentChatMsgObj,
  setDurationSecToMilli,
} from '../Helper/Chat/Utility';
import * as RootNav from '../Navigation/rootNavigation';
import { SDK } from '../SDK';
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
  requestAudioStoragePermission,
  mediaObjContructor,
  requestCameraPermission,
  requestStoragePermission,
} from '../common/utils';
import ChatConversation from '../components/ChatConversation';
import GalleryPickView from '../components/GalleryPickView';
import MessageInfo from '../components/MessageInfo';
import PostPreViewPage from '../components/PostPreViewPage';
import UserInfo from '../components/UserInfo';
import UsersTapBarInfo from '../components/UsersTapBarInfo';
import {
  getType,
  validateFileSize,
  validation,
} from '../components/chat/common/fileUploadValidation';
import { RECENTCHATSCREEN } from '../constant';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import { updateRecentChat } from '../redux/Actions/RecentChatAction';
import store from '../redux/store';
import SavePicture from './Gallery';
import Camera from '../components/RNCamera';
import Sound from 'react-native-sound';
import CameraPickView from '../components/CameraPickView';
import { openSettings } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ChatScreen() {
  const vCardData = useSelector(state => state.profile.profileDetails);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const [localNav, setLocalNav] = React.useState('CHATCONVERSATION');
  const [isMessageInfo, setIsMessageInfo] = React.useState({});
  const toast = useToast();
  const [isToastShowing, setIsToastShowing] = React.useState(false);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [selectedSingle, setselectedSingle] = React.useState(false);
  const [alert, setAlert] = React.useState(false);
  const [validate, setValidate] = React.useState('');

  const toastConfig = {
    duration: 1500,
    avoidKeyboard: true,
    onCloseComplete: () => {
      setIsToastShowing(false);
    },
  };

  const getAudioDuration = async path => {
    return new Promise((resolve, reject) => {
      const sound = new Sound(path, Sound.MAIN_BUNDLE, error => {
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
    let MediaPermission = await requestAudioStoragePermission();
    const size_toast = 'size_toast';
    if (MediaPermission === 'granted' || MediaPermission === 'limited') {
      let response = await handleAudioPickerSingle();
      let _validate = validation(response);
      let file = {
        fileSize: response.size,
      };
      const size = validateFileSize(file, getType(response.type));
      if (_validate && !size) {
        setAlert(true);
        setValidate(_validate);
      }
      const audioDuration = await getAudioDuration(response.fileCopyUri);
      response.duration = audioDuration;
      if (size && !Toast.isActive(size_toast)) {
        return Toast.show({
          id: size_toast,
          ...toastConfig,
          render: () => {
            return (
              <Box bg="black" px="2" py="1" rounded="sm">
                <Text style={{ color: '#fff', padding: 5 }}>{size}</Text>
              </Box>
            );
          },
        });
      }
      if (!validate && !size) {
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
    }
  };

  const attachmentMenuIcons = [
    {
      name: 'Document',
      icon: DocumentIcon,
      formatter: () => {},
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
        console.log(
          cameraPermission,
          imageReadPermission,
          'cameraPermission, imageReadPermission',
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
        console.log('imageReadPermission', imageReadPermission);
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
      formatter: () => {},
    },
    {
      name: 'Location',
      icon: LocationIcon,
      formatter: () => {},
    },
  ];

  const handleBackBtn = () => {
    localNav === 'CHATCONVERSATION' && RootNav.navigate(RECENTCHATSCREEN);
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

  const fileDetails = {
    duration: null,
    fileSize: 2265145,
    filename: 'blue_alpine_a521_2021_f1_car_2_4k_hd_cars.jpg',
    height: 2160,
    modificationTimestamp: 1691217115866,
    type: 'image/jpeg',
    uri: 'file:///storage/emulated/0/Download/blue_alpine_a521_2021_f1_car_2_4k_hd_cars.jpg',
    width: 3840,
  };
  const file = {
    caption: '',
    fileDetails: {
      duration: null,
      fileSize: 2265145,
      filename: 'blue_alpine_a521_2021_f1_car_2_4k_hd_cars.jpg',
      height: 2160,
      modificationTimestamp: 1691217115866,
      type: 'image/jpeg',
      uri: 'file:///storage/emulated/0/Download/blue_alpine_a521_2021_f1_car_2_4k_hd_cars.jpg',
      width: 3840,
    },
  };

  const sendMediaMessage = async (messageType, files, chatTypeSendMsg) => {
    let jidSendMediaMessage = fromUserJId;
    if (messageType === 'media') {
      let mediaData = {};
      for (let i = 0; i < files.length; i++) {
        const file = files[i],
          msgId = uuidv4();

        const {
          caption = '',
          fileDetails = {},
          fileDetails: { fileSize, filename, duration, uri, type } = {},
        } = file;

        const mediaDuration = setDurationSecToMilli(duration);
        const msgType = type.split('/')[0];
        const thumbImage = msgType === 'image' ? await getThumbImage(uri) : '';
        let fileOptions = {
          fileName: filename,
          fileSize: fileSize,
          caption: caption,
          uri: uri,
          duration: mediaDuration,
          msgId: msgId,
          thumbImage: thumbImage,
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
        };
        const conversationChatObj = await getMessageObjSender(dataObj, i);
        mediaData[msgId] = conversationChatObj;
        const recentChatObj = getRecentChatMsgObj(dataObj);

        const dispatchData = {
          data: [conversationChatObj],
          ...(isSingleChat(chatTypeSendMsg)
            ? { userJid: jidSendMediaMessage }
            : { groupJid: jidSendMediaMessage }),
        };
        store.dispatch(addChatConversationHistory(dispatchData));
        store.dispatch(updateRecentChat(recentChatObj));
      }
      setSelectedImages([]);
    }
  };

  const parseAndSendMessage = async (message, chatType, messageType) => {
    const { content } = message;
    sendMediaMessage(messageType, content, chatType);
  };

  const handleMedia = item => {
    const transformedArray = {
      caption: '',
      fileDetails: mediaObjContructor('CAMERA_ROLL', item),
    };
    setIsToastShowing(true);
    const size = validateFileSize(item.image, getType(item.type));
    if (size && !isToastShowing) {
      return toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={{ color: '#fff', padding: 5 }}>{size}</Text>
            </Box>
          );
        },
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
    const size = validateFileSize(item.image, getType(item.type));
    const isImageSelected = selectedImages.some(
      selectedItem => selectedItem.fileDetails?.uri === item?.image.uri,
    );
    if (!isToastShowing && selectedImages.length >= 10 && !isImageSelected) {
      return toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={{ color: '#fff', padding: 5 }}>
                Can't share more than 10 media items
              </Text>
            </Box>
          );
        },
      });
    }

    if (size && !isToastShowing) {
      return toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={{ color: '#fff', padding: 5 }}>{size}</Text>
            </Box>
          );
        },
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

  const handleSendMsg = async message => {
    let messageType = message.type;

    if (messageType === 'media') {
      parseAndSendMessage(message, 'chat', messageType);
      return;
    }

    if (message.content !== '') {
      let jid = fromUserJId;
      let msgId = uuidv4();
      const userProfile = vCardData;
      const dataObj = {
        jid: jid,
        msgType: 'text',
        message: message.content,
        userProfile,
        chatType: 'chat',
        msgId,
        fromUserJid: currentUserJID,
      };
      const conversationChatObj = await getMessageObjSender(dataObj);
      const recentChatObj = getRecentChatMsgObj(dataObj);
      const dispatchData = {
        data: [conversationChatObj],
        ...(isSingleChat('chat') ? { userJid: jid } : { groupJid: jid }), // check this when group works
      };
      store.dispatch(addChatConversationHistory(dispatchData));
      store.dispatch(updateRecentChat(recentChatObj));
      SDK.sendTextMessage(jid, message.content, msgId);
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
              handleBackBtn={handleBackBtn}
              setLocalNav={setLocalNav}
              setIsMessageInfo={setIsMessageInfo}
              attachmentMenuIcons={attachmentMenuIcons}
              selectedImages={selectedImages}
              handleSendMsg={handleSendMsg}
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
          UserInfo: <UserInfo setLocalNav={setLocalNav} />,
          UsersTapBarInfo: <UsersTapBarInfo setLocalNav={setLocalNav} />,
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
        }[localNav]
      }
      <AlertDialog isOpen={alert} onClose={alert}>
        <AlertDialog.Content
          w="85%"
          borderRadius={0}
          px="6"
          py="4"
          fontWeight={'600'}>
          <Text fontSize={16} color={'black'}>
            {validate}
          </Text>
          <HStack justifyContent={'flex-end'} mr={2} pb={'2'} pt={'6'}>
            <Pressable onPress={onClose}>
              <Text fontWeight={'500'} color={'#3276E2'}>
                OK
              </Text>
            </Pressable>
          </HStack>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
}

export default ChatScreen;
