import React from 'react';
import ChatConversation from '../components/ChatConversation';
import MessageInfo from '../components/MessageInfo';
import {
  CameraIcon,
  ContactIcon,
  DocumentIcon,
  GalleryIcon,
  HeadSetIcon,
  LocationIcon,
} from '../common/Icons';
import GalleryPickView from '../components/GalleryPickView';
import { mediaObjContructor, requestStoragePermission } from '../common/utils';
import { Box, Text, useToast } from 'native-base';
import UserInfo from '../components/UserInfo';
import UsersTapBarInfo from '../components/UsersTapBarInfo';
import { Alert, BackHandler, Platform } from 'react-native';
import { RECENTCHATSCREEN } from '../constant';
import { batch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  getMessageObjSender,
  getRecentChatMsgObj,
  setDurationSecToMilli,
} from '../Helper/Chat/Utility';
import { updateRecentChat } from '../redux/Actions/RecentChatAction';
import store from '../redux/store';
import { isSingleChat } from '../Helper/Chat/ChatHelper';
import { addChatConversationHistory } from '../redux/Actions/ConversationAction';
import { SDK } from '../SDK';
import SavePicture from './Gallery';
import * as RootNav from '../Navigation/rootNavigation';
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import {
  getType,
  isValidFileType,
  validateFileSize,
} from '../components/chat/common/fileUploadValidation';
import PostPreViewPage from '../components/PostPreViewPage';
import DocumentPicker from 'react-native-document-picker';
import { showToast } from '../Helper';
import { DOCUMENT_FORMATS } from '../Helper/Chat/Constant';
import { PERMISSIONS } from 'react-native-permissions';

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

  console.log('rendering');

  const toastConfig = {
    duration: 2500,
    avoidKeyboard: true,
    onCloseComplete: () => {
      setIsToastShowing(false);
    },
  };
  const documentAttachmentTypes = React.useMemo(
    () => [
      DocumentPicker.types.pdf,
      DocumentPicker.types.ppt,
      DocumentPicker.types.pptx,
      DocumentPicker.types.doc,
      DocumentPicker.types.docx,
      DocumentPicker.types.xls,
      DocumentPicker.types.xlsx,
      DocumentPicker.types.plainText,
      DocumentPicker.types.zip,
      DocumentPicker.types.csv,
      // TODO: need to add rar file type
    ],
    []
  );

  const attachmentMenuIcons = React.useMemo(
    () => [
      {
        name: 'Document',
        icon: DocumentIcon,
        formatter: () => {
          // TODO: check for permission for external storage
          // if (PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE || WRITE_EXTERNAL_STORAGE)
          //   PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
          // PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

          // updating the SDK flag to keep the connection Alive when app goes background because of document picker
          SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
          DocumentPicker.pickSingle({
            type: documentAttachmentTypes,
            copyTo:
              Platform.OS === 'android'
                ? 'cachesDirectory'
                : 'documentDirectory',
          })
            .then(file => {
              // updating the SDK flag back to false to behave as usual
              SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
              console.log(file);

              // Validating the file type and size
              if (!isValidFileType(file.type)) {
                Alert.alert(
                  'Mirrorfly',
                  'You can upload only .pdf, .xls, .xlsx, .doc, .docx, .txt, .ppt, .zip, .rar, .pptx, .csv  files'
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
              console.log('updatedFile', updatedFile);
              const messageData = {
                type: 'media',
                content: [updatedFile],
              };
              handleSendMsg(messageData);
            })
            .catch(err => {
              // updating the SDK flag back to false to behave as usual
              SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
              console.log('Error from documen picker', err);
            });
        },
      },
      {
        name: 'Camera',
        icon: CameraIcon,
        formatter: () => {},
      },
      {
        name: 'Gallery',
        icon: GalleryIcon,
        formatter: async () => {
          let imageReadPermission = await requestStoragePermission();
          console.log('imageReadPermission', imageReadPermission);
          if (
            imageReadPermission === 'granted' ||
            imageReadPermission === 'limited'
          ) {
            setLocalNav('Gallery');
          }
        },
      },
      {
        name: 'Audio',
        icon: HeadSetIcon,
        formatter: () => {},
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
    ],
    []
  );

  const handleBackBtn = () => {
    localNav === 'CHATCONVERSATION' && RootNav.navigate(RECENTCHATSCREEN);
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn
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

  /** const fileDetails = {
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
  }; */
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
          fileDetails: { fileSize, filename, playableDuration, uri, type } = {},
        } = file;
        console.log(file, fileDetails, 'file fileDetails');
        const duration = setDurationSecToMilli(playableDuration);
        const isDocument = DOCUMENT_FORMATS.includes(type);
        const msgType = isDocument ? 'file' : type.split('/')[0];
        const thumbImage = msgType === 'image' ? await getThumbImage(uri) : '';
        let fileOptions = {
          fileName: filename,
          fileSize: fileSize,
          caption: caption,
          uri: uri,
          duration: duration,
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
    sendMediaMessage(messageType, content, chatType);
  };

  const handleMedia = item => {
    const transformedArray = {
      caption: '',
      fileDetails: mediaObjContructor('CAMERA_ROLL', item),
    };
    setIsToastShowing(true);
    const size = validateFileSize(item.image.fileSize, getType(item.type));
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

  /**   const validation = (file) => {
      const { image } = file
      const fileExtension = getExtension(image.filename);
      const allowedFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_ALL_FILE_FORMATS.join("|") + ")$", "i");
      let mediaType = getType(file.type);
      if (!allowedFilescheck.test(fileExtension) || mediaType === "video/mpeg") {
        let message = "Unsupported file format. Files allowed: ";
        if (mediaType === "image") message = message + `${ALLOWED_IMAGE_VIDEO_FORMATS.join(", ")}`; 
        if (!isToastShowing) {
          return toast.show({
            ...toastConfig,
            render: () => {
              return (
                <Box bg="black" px="2" py="1" rounded="sm">
                  <Text style={{ color: '#fff', padding: 5 }}>{message}</Text>
                </Box>
              );
            },
          });
        }
      }
    }
     */

  const handleSelectImage = item => {
    setIsToastShowing(true);
    const transformedArray = {
      caption: '',
      fileDetails: item,
    };
    setselectedSingle(false);
    const size = validateFileSize(item.image.fileSize, getType(item.type));
    const isImageSelected = selectedImages.some(
      selectedItem => selectedItem.fileDetails?.image?.uri === item?.image.uri
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
            selectedItem =>
              selectedItem.fileDetails?.image.uri !== item?.image?.uri
          )
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
      batch(() => {
        store.dispatch(addChatConversationHistory(dispatchData));
        store.dispatch(updateRecentChat(recentChatObj));
      });
      SDK.sendTextMessage(jid, message.content, msgId);
    }
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
          PostPreView: <PostPreViewPage setLocalNav={setLocalNav} />,
        }[localNav]
      }
    </>
  );
}

export default ChatScreen;
