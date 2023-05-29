import React from 'react'
import ChatConversation from '../components/ChatConversation'
import MessageInfo from '../components/MessageInfo'

function ChatScreen() {
  const [localNav, setLocalNav] = React.useState('CHATCONVERSATION')
  const [isMessageInfo, setIsMessageInfo] = React.useState({})
  return (
    <>
      {{
        'CHATCONVERSATION': <ChatConversation setLocalNav={setLocalNav}  setIsMessageInfo={setIsMessageInfo}/>,
        'MESSAGEINFO': <MessageInfo setLocalNav={setLocalNav} setIsMessageInfo={setIsMessageInfo} isMessageInfo={isMessageInfo}/>
      }[localNav]}  
    </>
  )
}

export default ChatScreen