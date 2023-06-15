import React from 'react';
import { Keyboard, TextInput, } from 'react-native';
import { SendBtn } from '../common/Button';
import { AttachmentIcon, EmojiIcon, MicIcon } from '../common/Icons';
import { HStack, Icon, IconButton, Box, Modal, Pressable, Flex, Text, VStack, Stack, ScrollView } from 'native-base';

const ChatInput = ({ onSendMessage, attachmentMenuIcons }) => {
  const [message, setMessage] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false)
  const sendMessage = () => {
    if (message) {
      onSendMessage(message);
      setMessage('');
     
    }
  };

  return (
    <>
      <HStack p="2" w="full" alignItems="center" borderTopWidth={0.25} borderColor="#959595">
        <HStack position="relative" w={message ? '90%' : '100%'} px="3" justify={'center'} alignItems="center" borderWidth={1} borderRadius={40} borderColor="#959595">
          <IconButton _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} p="2" px="0.5" icon={<Icon p="0" as={EmojiIcon} name="emoji-happy" />} borderRadius="full" />
            <TextInput
              keyboardType={'default'}
              value={message}
              
              style={{
                paddingHorizontal:5,
                padding: 10,
                marginStart: 5,
                flex: 1,
                minHeight: 20,
                maxHeight: 100,
              }}
              onChangeText={(text) => setMessage(text)}
              placeholder="Start Typing..."
              placeholderTextColor="#767676"
              autoFocus={true}
              numberOfLines={1}
              multiline={true}
            />
          <IconButton onPress={()=>{
             Keyboard.dismiss();
             setIsOpen(true);
          }} _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} p="2" icon={<Icon p="0" as={AttachmentIcon} name="emoji-happy" />} borderRadius="full" />
         <IconButton onPress={()=>{
          }} _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} p="2" ml='3' icon={<Icon p="0" as={MicIcon} name="emoji-happy" />} borderRadius="full" />
        </HStack>
        {message && (
          <SendBtn style={{ height: 30, width: 30,paddingLeft: 10 ,alignItems: 'center', justifyContent: 'center' }} onPress={sendMessage} />
        )}
      </HStack>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} safeAreaTop={true}>
        <Modal.Content width={'90%'} style={{ marginBottom: 30, marginTop: 'auto', backgroundColor: '#181818' }}>
          <Modal.Body>
            <Flex direction="row" justify={'space-between'} wrap="wrap">
              {attachmentMenuIcons.map((item, index) => (
                <VStack py='3' key={index} alignItems={'center'} style={{ width: '32%' }} >
                  <IconButton _pressed={{ bg: 'transperent' }} onPress={() => { setIsOpen(false); item.formatter && item.formatter() }} icon={<Icon as={item.icon} name="emoji-happy" />} borderRadius="full" />
                  <Text color={'#fff'}>{item.name}</Text>
                </VStack>
              ))}
            </Flex>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default ChatInput;