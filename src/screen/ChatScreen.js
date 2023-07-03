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
import { useDispatch } from 'react-redux'
import { navigate } from '../redux/navigationSlice'

function ChatScreen() {
  const dispatch = useDispatch()
  const [localNav, setLocalNav] = React.useState('CHATCONVERSATION')
  const [isMessageInfo, setIsMessageInfo] = React.useState({})
  const toast = useToast()
  const [sendSelected, setSendSelected] = React.useState(false)
  const [selectedImages, setSelectedImages] = React.useState([])

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
        const transformedArray = res.map((obj, index) => {
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

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    }
  }, [])

  return (
    <>
      {{
        'CHATCONVERSATION': <ChatConversation handleBackBtn={handleBackBtn} setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} attachmentMenuIcons={attachmentMenuIcons} sendSelected={sendSelected} selectedImages={selectedImages} />,
        'MESSAGEINFO': <MessageInfo setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} isMessageInfo={isMessageInfo} />,
        'GalleryPickView': <GalleryPickView setSelectedImages={setSelectedImages} selectedImages={selectedImages} setLocalNav={setLocalNav} setSendSelected={setSendSelected} />,
        'UserInfo': <UserInfo setLocalNav={setLocalNav} />,
        'UsersTapBarInfo': <UsersTapBarInfo setLocalNav={setLocalNav} />
      }[localNav]}
    </>
  )
}

export default ChatScreen