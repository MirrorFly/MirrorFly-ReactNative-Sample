import React from 'react'
import ChatConversation from '../components/ChatConversation'
import MessageInfo from '../components/MessageInfo'
import { CameraIcon, ContactIcon, DocumentIcon, GalleryIcon, HeadSetIcon, LocationIcon } from '../common/Icons'
import GalleryPickView from '../components/GalleryPickView'
import { requestStoragePermission } from '../common/utils'
import { Box, Text, useToast } from 'native-base'
import UserInfo from '../components/UserInfo'
import UsersTapBarInfo from '../components/UsersTapBarInfo'
import { BackHandler } from 'react-native'
import { RECENTCHATSCREEN } from '../constant'
import { useDispatch, useSelector } from 'react-redux'
import { navigate } from '../redux/navigationSlice'
import { v4 as uuidv4 } from 'uuid';
import { getMessageObjSender, getRecentChatMsgObj } from '../Helper/Chat/Utility'
import { updateRecentChat } from '../redux/recentChatDataSlice'
import store from '../redux/store'
import { isSingleChat } from '../Helper/Chat/ChatHelper'
import { addChatConversationHistory } from '../redux/conversationSlice'
import { SDK } from '../SDK'
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import SavePicture from './Gallery'
import * as RootNav from '../Navigation/rootNavigation'
import { Image as ImageCompressor } from 'react-native-compressor';
import RNFetchBlob from 'rn-fetch-blob';

function ChatScreen() {
  const dispatch = useDispatch()
  const vCardData = useSelector((state) => state.profile.profileDetails);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid)
  const currentUserJID = useSelector(state => state.auth.currentUserJID)
  const [localNav, setLocalNav] = React.useState('CHATCONVERSATION')
  const [isMessageInfo, setIsMessageInfo] = React.useState({})
  const toast = useToast()
  const [isToastShowing, setIsToastShowing] = React.useState(false)
  const [selectedImages, setSelectedImages] = React.useState([])
  const [selectedSingle, setselectedSingle] = React.useState(false)

  const toastConfig = {
    duration: 2500,
    avoidKeyboard: true,
    onCloseComplete: () => {
      setIsToastShowing(false)
    }
  }

  const attachmentMenuIcons = [
    {
      name: "Document",
      icon: DocumentIcon,
      formatter: () => { }
    },
    {
      name: "Camera",
      icon: CameraIcon,
      formatter: () => {

      }
    },
    {
      name: "Gallery",
      icon: GalleryIcon,
      formatter: async () => {
        let imageReadPermission = await requestStoragePermission()
        console.log('imageReadPermission', imageReadPermission)
        if (imageReadPermission == 'granted' || 'limited') {
          setLocalNav('Gallery')
        }
        // SavePicture()
        // RNimageGalleryLaunch()
        //   const res = await handleGalleryPickerMulti(toast)
        //   const transformedArray = res?.map((obj, index) => {
        //     return {
        //       caption: '',
        //       image: obj
        //     };
        //   });
        //   setSelectedImages(transformedArray)
        //   if (res?.length) {
        //     setLocalNav('GalleryPickView')
        //   }
      }
    },
    {
      name: "Audio",
      icon: HeadSetIcon,
      formatter: () => { }
    },
    {
      name: "Contact",
      icon: ContactIcon,
      formatter: () => { }
    },
    {
      name: "Location",
      icon: LocationIcon,
      formatter: () => { }
    },
  ]

  const handleBackBtn = () => {
    let x = { screen: RECENTCHATSCREEN }
    // dispatch(navigate(x))
    localNav === "CHATCONVERSATION" && RootNav.navigate(RECENTCHATSCREEN)
    return true;
  }

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn
  );

  const sendMediaMessage = async (messageType, files, chatTypeSendMsg) => {
    let jidSendMediaMessage = fromUserJId;
    if (messageType === "media") {
      let mediaData = {};
      for (let i = 0; i < files.length; i++) {
        const file = files[i],
          msgId = uuidv4();
        console.log(file, "fileeee");
        const { caption = "" } = file;
        let fileOptions = {
          fileName: file.name,
          fileSize: file.size,
          caption: caption,
          msgId: msgId,
        };

        const msgType = file.image.type.split('/')[0];
        const userProfile = vCardData;

        const dataObj = {
          jid: jidSendMediaMessage,
          msgType,
          userProfile,
          chatType: chatTypeSendMsg,
          msgId,
          file,
          fileOptions,
          fileDetails: file.images,
          fromUserJid: currentUserJID
        };
        const conversationChatObj = await getMessageObjSender(dataObj, i);
        mediaData[msgId] = conversationChatObj;
        const recentChatObj = getRecentChatMsgObj(dataObj);

        const dispatchData = {
          data: [conversationChatObj],
          ...(isSingleChat(chatTypeSendMsg) ? { userJid: jidSendMediaMessage } : { groupJid: jidSendMediaMessage })
        };
        store.dispatch(addChatConversationHistory(dispatchData));
        store.dispatch(updateRecentChat(recentChatObj));
        let response = {};
        if (msgType === "file") {
          response = await SDK.sendDocumentMessage(jidSendMediaMessage, file, fileOptions);
        } else if (msgType === "image") {
          response = await SDK.sendImageMessage(jidSendMediaMessage, file.image, fileOptions);
        } else if (msgType === "video") {
          response = await SDK.sendVideoMessage(jidSendMediaMessage, file.image, fileOptions);
        } else if (msgType === "audio") {
          response = await SDK.sendAudioMessage(jidSendMediaMessage, file, fileOptions);
        }
        console.log(response, "\n response");
      }
    }
  };

  const parseAndSendMessage = async (message, chatType, messageType) => {
    const { content } = message;
    sendMediaMessage(messageType, content, chatType);
  };

  const handleMedia = (item) => {
    const transformedArray = {
      caption: '',
      image: item.image
    };
    setselectedSingle(true)
    setSelectedImages([transformedArray]);
    setLocalNav("GalleryPickView")
  }

  const handleSelectImage = (item) => {
    const transformedArray = {
      caption: '',
      image: item.image
    };
    setselectedSingle(false)
    const isImageSelected = selectedImages.some((selectedItem) => selectedItem.image.uri === item.image.uri);
    setIsToastShowing(true)
    if (!isToastShowing && selectedImages.length >= 10 && !isImageSelected) {
      return toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={{ color: '#fff', padding: 5 }}>Can't share more than 10 media items</Text>
            </Box>
          );
        },
      });
    }
    if (!isToastShowing) {
      setIsToastShowing(false)
      if (isImageSelected) {
        setSelectedImages(prevArray => prevArray.filter(selectedItem => selectedItem.image.uri !== item.image.uri));
      } else {
        setSelectedImages(prevArray => [...prevArray, transformedArray]);
      }
    }
  };

  const handleImageConvert = async () => {
    // try {
    // const result = await ImageCompressor.compress('file:///storage/emulated/0/Abstruct/OPTV - 1.jpg', {
    //   maxWidth: 600,
    //   maxHeight: 200,
    //   quality: 0.3,
    // });
    // const response = await RNFetchBlob.fs.readFile(result, 'base64');
    // console.log(response)
    //   createThumbnail({
    //     url: 'file:///storage/emulated/0/Videos/munbe vaa bgm react NS200 ( 720 X 1280 ).mp4',
    //     timeStamp: 10000,
    //   })
    //     .then(response => console.log({ response }))
    //     .catch(err => console.log({ err }));

    // } catch (error) {
    //   console.log('handleImageConvert', error)
    // }
  }

  const handleSendMsg = async (message) => {
    let messageType = message.type;

    if (messageType === "media") {
      parseAndSendMessage(message, "chat", messageType);
      return;
    }

    if (message.content !== "") {
      let jid = fromUserJId;
      let msgId = uuidv4();
      const userProfile = vCardData;
      const dataObj = {
        jid: jid,
        msgType: "text",
        message: message.content,
        userProfile,
        chatType: 'chat',
        msgId,
        fromUserJid: currentUserJID
      };
      const conversationChatObj = await getMessageObjSender(dataObj);
      const recentChatObj = getRecentChatMsgObj(dataObj);
      SDK.sendTextMessage(
        jid,
        message.content,
        msgId
      )
      const dispatchData = {
        data: [conversationChatObj],
        ...(isSingleChat('chat') ? { userJid: jid } : { groupJid: jidSendMsg }),
      };
      store.dispatch(addChatConversationHistory(dispatchData));
      store.dispatch(updateRecentChat(recentChatObj));
    }
  }

  React.useEffect(() => {
    // handleImageConvert()
    return () => {
      backHandler.remove();
    }
  }, [])

  return (
    <>
      {{
        'CHATCONVERSATION': <ChatConversation handleBackBtn={handleBackBtn} setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} attachmentMenuIcons={attachmentMenuIcons} selectedImages={selectedImages} handleSendMsg={handleSendMsg} />,
        'MESSAGEINFO': <MessageInfo setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} isMessageInfo={isMessageInfo} />,
        'GalleryPickView': <GalleryPickView setSelectedImages={setSelectedImages} selectedSingle={selectedSingle} selectedImages={selectedImages} setLocalNav={setLocalNav} handleSendMsg={handleSendMsg} />,
        'UserInfo': <UserInfo setLocalNav={setLocalNav} />,
        'UsersTapBarInfo': <UsersTapBarInfo setLocalNav={setLocalNav} />,
        'Gallery': <SavePicture setLocalNav={setLocalNav} selectedImages={selectedImages} handleSelectImage={handleSelectImage}
                    handleMedia={handleMedia}
                    setSelectedImages={setSelectedImages} />
      }[localNav]}
    </>
  )
}

export default ChatScreen