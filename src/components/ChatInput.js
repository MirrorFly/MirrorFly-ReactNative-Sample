import React, { useState } from 'react';
import { TextInput, Keyboard, StyleSheet } from 'react-native';
import { SendBtn } from '../common/Button';
import { AttachmentIcon, MicIcon, EmojiIcon, KeyboardIcon } from '../common/Icons';
import { HStack, Icon, IconButton, Modal, Flex, Text, VStack } from 'native-base';
import EmojiOverlay from './EmojiPicker';

const ChatInput = ({ onSendMessage, attachmentMenuIcons, chatInputRef }) => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false)
  const sendMessage = () => {
    if (message) {
      onSendMessage(message);
      setMessage('');
    }
  };
  const handleEmojiSelect = (...emojis) => {
    setMessage(prev => prev + emojis)
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerShowing(!isEmojiPickerShowing)
    if (isEmojiPickerShowing) {
      chatInputRef.current.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  return (
    <>
      <HStack p="2" w="full" alignItems="center" borderTopWidth={0.25} borderColor="#959595">
        <HStack
          p='0'
          position="relative"
          w={message ? '90%' : '100%'}
          justify={'center'}
          alignItems="center"
          borderWidth={1}
          borderRadius={40}
          borderColor="#959595"
        >
          <IconButton
            _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
            ml='2'
            p="1"
            icon={isEmojiPickerShowing ? <KeyboardIcon /> : <EmojiIcon />}
            onPress={() => {
              toggleEmojiPicker();
            }}
            borderRadius="full"
          />
          <TextInput
            ref={chatInputRef}
            value={message}
            style={{
              flex: 1,
              minHeight: 20,
              maxHeight: 100,
            }}
            onChangeText={(text) => {
              setMessage(text)
            }}
            placeholder="Start Typing..."
            placeholderTextColor="#767676"
            autoFocus={true}
            numberOfLines={1}
            multiline={true}
          />
          <IconButton
            onPress={() => {
              Keyboard.dismiss();
              setIsOpen(true);
            }}
            _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
            p="2"
            icon={<Icon p="0" as={AttachmentIcon} name="emoji-happy" />}
            borderRadius="full"
          />
          <IconButton
            onPress={() => { }}
            _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
            p="2"
            ml="3"
            mr='2'
            icon={<Icon p="0" as={MicIcon} name="emoji-happy" />}
            borderRadius="full"
          />
        </HStack>
        {message && (
          <SendBtn style={{ height: 30, width: 30, paddingLeft: 10, alignItems: 'center', justifyContent: 'center' }} onPress={sendMessage} />
        )}
      </HStack>
      <EmojiOverlay
        message={message}
        setMessage={setMessage}
        visible={isEmojiPickerShowing}
        onClose={()=>setIsEmojiPickerShowing(false)}
        handleEmojiSelect={handleEmojiSelect}
      />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} safeAreaTop={true}>
        <Modal.Content width={'90%'} style={{ marginBottom: 30, marginTop: 'auto', backgroundColor: '#181818' }}>
          <Modal.Body>
            <Flex direction="row" justify={'space-between'} wrap="wrap">
              {attachmentMenuIcons.map((item) => (
                <VStack py='3' key={item.name} alignItems={'center'} style={{ width: '32%' }} >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emojiPickerContainer: {
    flex: 1,
    backgroundColor: 'white',
    maxHeight: 250,
  },
  emojiPicker: {
    flex: 1,
    width: '100%',
    maxHeight: 250,
  },
});
