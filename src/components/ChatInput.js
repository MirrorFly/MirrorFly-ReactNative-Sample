import React, { createRef } from 'react';
import { TextInput, Keyboard, StyleSheet } from 'react-native';
import { SendBtn } from '../common/Button';
import {
  AttachmentIcon,
  MicIcon,
  EmojiIcon,
  KeyboardIcon,
} from '../common/Icons';
import {
  HStack,
  Icon,
  IconButton,
  Modal,
  Flex,
  Text,
  VStack,
} from 'native-base';
import EmojiOverlay from './EmojiPicker';
import { soundRef } from './Media/AudioPlayer';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

export const chatInputMessageRef = createRef();
chatInputMessageRef.current = '';

const ChatInput = props => {
  const {
    onSendMessage,
    attachmentMenuIcons,
    chatInputRef,
    IsSearching,
    fromUserJId,
  } = props;

  const [message, setMessage] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
  const { data = {} } = useSelector(state => state.recoverMessage);

  React.useEffect(() => {
    chatInputMessageRef.current = message;
  }, [message]);

  const sendMessage = () => {
    if (message) {
      setMessage('');
      setTimeout(() => {
        onSendMessage(message.trim());
      }, 0);
    }
  };

  const onChangeMessage = text => {
    setMessage(text);
  };

  useFocusEffect(
    React.useCallback(() => {
      setMessage(data[fromUserJId]?.textMessage || '');
    }, [fromUserJId]),
  );

  const handleEmojiSelect = (...emojis) => {
    setMessage(prev => prev + emojis);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerShowing(!isEmojiPickerShowing);
    if (isEmojiPickerShowing) {
      chatInputRef.current.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const handleAttachmentconPressed = () => {
    Keyboard.dismiss();
    soundRef?.current?.pause();
    soundRef?.current?.updateState?.();
    setIsOpen(true);
  };

  return (
    <>
      <HStack
        p="2"
        w="full"
        alignItems="center"
        borderTopWidth={0.25}
        borderColor="#959595">
        {!IsSearching && (
          <HStack
            p="0"
            position="relative"
            w={message ? '90%' : '100%'}
            justify={'center'}
            alignItems="center"
            borderWidth={1}
            borderRadius={40}
            borderColor="#959595">
            <IconButton
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              ml="2"
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
              style={styles.inputTextbox}
              onChangeText={onChangeMessage}
              placeholder="Start Typing..."
              placeholderTextColor="#767676"
              numberOfLines={1}
              multiline={true}
            />

            <IconButton
              onPress={handleAttachmentconPressed}
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              p="2"
              icon={<Icon p="0" as={AttachmentIcon} name="emoji-happy" />}
              borderRadius="full"
            />
            <IconButton
              onPress={() => {}}
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              p="2"
              ml="3"
              mr="2"
              icon={<Icon p="0" as={MicIcon} name="emoji-happy" />}
              borderRadius="full"
            />
          </HStack>
        )}
        {Boolean(message) && (
          <SendBtn style={styles.sendButton} onPress={sendMessage} />
        )}
      </HStack>
      <EmojiOverlay
        state={message}
        setState={setMessage}
        visible={isEmojiPickerShowing}
        onClose={() => setIsEmojiPickerShowing(false)}
        onSelect={handleEmojiSelect}
      />
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        safeAreaTop={true}>
        <Modal.Content width={'90%'} style={styles.modalContent}>
          <Modal.Body>
            <Flex direction="row" justify={'space-between'} wrap="wrap">
              {attachmentMenuIcons.map(item => (
                <VStack
                  py="3"
                  key={item.name}
                  alignItems={'center'}
                  style={styles.attachmentMenuIconsContainer}>
                  <IconButton
                    _pressed={{ bg: 'transperent' }}
                    onPress={() => {
                      setIsOpen(false);
                      item.formatter?.();
                    }}
                    icon={<Icon as={item.icon} name="emoji-happy" />}
                    borderRadius="full"
                  />
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

export default React.memo(ChatInput);

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
  sendButton: {
    height: 30,
    width: 30,
    paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputTextbox: {
    flex: 1,
    minHeight: 20,
    maxHeight: 100,
  },
  modalContent: {
    marginBottom: 30,
    marginTop: 'auto',
    backgroundColor: '#181818',
  },
  attachmentMenuIconsContainer: { width: '32%' },
});
