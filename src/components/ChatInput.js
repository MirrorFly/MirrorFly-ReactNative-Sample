import React, { useState } from 'react';
import { View, TextInput, Button, TouchableOpacity } from 'react-native';
import { SendBtn } from '../common/Button';
import { AttachmentIcon, EmojiIcon, MicIcon } from '../common/Icons';
import { Center, HStack, Icon, Text, Image, IconButton, VStack, Pressable, Stack } from 'native-base';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = React.useState('');
  const [onClicked, setOnClicked] = useState('')
  const [chatInputWidth, setChatInputWidth] = useState(10)
  
  const sendMessage = () => {
    if (message) {
      onSendMessage(message);
      
      setMessage('');
    }
  };

  React.useEffect(() => {
    if (chatInputWidth > 90 && message) {
      setTimeout(() => {
        setChatInputWidth(chatInputWidth - 0.5);
      }, 0.1);
    }
    if (chatInputWidth < 101 && !message) {
      setTimeout(() => {
        setChatInputWidth(chatInputWidth + 0.5);
      }, 0.1);
    }
  }, [message, chatInputWidth])


  return (
    <>
      <HStack p='2' w='full' alignItems={'center'} borderTopWidth={0.25} borderColor='#959595' >
        <HStack position={'relative'} w={`${chatInputWidth}%`} px='3' h='55' alignItems='center' borderWidth={1} borderRadius={40} flex="1" borderColor='#959595'>
          <IconButton _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} p='2' px='0.5' icon={<Icon p='0' as={EmojiIcon} name="emoji-happy" />} borderRadius="full" />
          <TextInput
            keyboardType={'default'}
            value={message}
            style={{ marginStart: 5, flex: 1 }}
            onChangeText={(text) => setMessage(text)}
            placeholder="Start Typing..."
            placeholderTextColor={"#767676"}
            autoFocus={true}
          />
          <AttachmentIcon />
          <Stack ml="6" mr="3"> 
          <MicIcon/>
          </Stack>
        

        </HStack>
        {message && <SendBtn style={{ height: 30, width: 30, paddingLeft:7, alignItems: 'center', justifyContent: 'center' }} onPress={sendMessage} />}
      </HStack>
    </>
  );
};

export default ChatInput;