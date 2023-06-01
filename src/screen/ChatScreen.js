import React from 'react'
import ChatConversation from '../components/ChatConversation'
import MessageInfo from '../components/MessageInfo'
import { CameraIcon, ContactIcon, DocumentIcon, GalleryIcon, HeadSetIcon, LocationIcon } from '../common/Icons'
import GalleryPickView from '../components/GalleryPickView'
import { handleGalleryPickerMulti } from '../common/utils'
import { useToast } from 'native-base'

function ChatScreen() {
  const [localNav, setLocalNav] = React.useState('CHATCONVERSATION')
  const [isMessageInfo, setIsMessageInfo] = React.useState({})
  const toast = useToast()
  const [sendSelected, setSendSelected] = React.useState(false)
  const [selectedImages, setSelectedImages] = React.useState([{
    fileCopyUri: "file:///data/user/0/com.mirrorfly.qa/files/c4efeae0-87fd-4be8-892d-22ec0750361e/IMG_20230601_073118.jpg",
    name: "IMG_20230601_073114.jpg",
    size: 97979,
    type: "image/jpeg",
    uri: "content://com.android.providers.media.documents/document/image%3A1000000023"
  }])

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
  return (
    <>
      {{
        'CHATCONVERSATION': <ChatConversation setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} attachmentMenuIcons={attachmentMenuIcons} sendSelected={sendSelected} selectedImages={selectedImages}/>,
        'MESSAGEINFO': <MessageInfo setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} isMessageInfo={isMessageInfo} />,
        'GalleryPickView': <GalleryPickView setSelectedImages={setSelectedImages} selectedImages={selectedImages} setLocalNav={setLocalNav} setSendSelected={setSendSelected}/>
      }[localNav]}
    </>
  )
}

export default ChatScreen