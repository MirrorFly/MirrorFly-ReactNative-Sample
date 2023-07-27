import React from 'react'
import ChatConversation from '../components/ChatConversation'
import MessageInfo from '../components/MessageInfo'
import { CameraIcon, ContactIcon, DocumentIcon, GalleryIcon, HeadSetIcon, LocationIcon } from '../common/Icons'
import GalleryPickView from '../components/GalleryPickView'
import { handleGalleryPickerMulti } from '../common/utils'
import { useToast } from 'native-base'
import UserInfo from '../components/UserInfo'
import UsersTapBarInfo from '../components/UsersTapBarInfo'
import { BackHandler } from 'react-native'
import { RECENTCHATSCREEN } from '../constant'
import { useDispatch, useSelector } from 'react-redux'
import { navigate } from '../redux/navigationSlice'
import { v4 as uuidv4 } from 'uuid';
import { getMessageObjSender, getRecentChatMsgObj, getUserIdFromJid } from '../Helper/Chat/Utility'
import { updateRecentChat } from '../redux/recentChatDataSlice'
import store from '../redux/store'
import { isSingleChat } from '../Helper/Chat/ChatHelper'
import { addChatConversationHistory } from '../redux/conversationSlice'
import { SDK } from '../SDK'
import PostPreViewPage from '../components/PostPreViewPage';

function ChatScreen() {
  const dispatch = useDispatch()
  const vCardData = useSelector((state) => state.profile.profileDetails);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid)
  const [localNav, setLocalNav] = React.useState('CHATCONVERSATION')
  const [isMessageInfo, setIsMessageInfo] = React.useState({})
  const toast = useToast()
  const [sendSelected, setSendSelected] = React.useState(false);
  const [selectedImages, setSelectedImages] = React.useState([]);

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
        }
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
    dispatch(navigate(x))
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
        const { caption = "", image: { uri, fileCopyUri = "", type = "" } = {} } = file;
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
          fileDetails: file.images
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
      }
    }
  };

  const parseAndSendMessage = async (message, chatType, messageType) => {
    const { content } = message;
    sendMediaMessage(messageType, content, chatType);
  };

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
    return () => {
      backHandler.remove();
    }
  }, [])

  return (
    <>
      {{
        'CHATCONVERSATION': <ChatConversation handleBackBtn={handleBackBtn} setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} attachmentMenuIcons={attachmentMenuIcons} sendSelected={sendSelected} selectedImages={selectedImages} handleSendMsg={handleSendMsg} />,
        'MESSAGEINFO': <MessageInfo setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} isMessageInfo={isMessageInfo} />,
        'GalleryPickView': <GalleryPickView setSelectedImages={setSelectedImages} selectedImages={selectedImages} setLocalNav={setLocalNav} handleSendMsg={handleSendMsg} />,
        'UserInfo': <UserInfo setLocalNav={setLocalNav} />,
        'UsersTapBarInfo': <UsersTapBarInfo setLocalNav={setLocalNav} />,
        'PostPreView':<PostPreViewPage setLocalNav={setLocalNav} />
        
      }[localNav]}
    </>
  )
}

export default ChatScreen;