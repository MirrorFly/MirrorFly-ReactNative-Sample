import React, { createRef } from 'react';
import { TextInput, Keyboard, StyleSheet, View, Text } from 'react-native';
import { SendBtn } from '../common/Button';
import {
  AttachmentIcon,
  MicIcon,
  EmojiIcon,
  KeyboardIcon,
} from '../common/Icons';
import EmojiOverlay from './EmojiPicker';
import { soundRef } from './Media/AudioPlayer';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import ApplicationColors from '../config/appColors';
import Modal, { ModalBottomContent } from '../common/Modal';
import IconButton from '../common/IconButton';
import commonStyles from '../common/commonStyles';

export const chatInputMessageRef = createRef();
chatInputMessageRef.current = '';

const ChatInput = props => {
  const { onSendMessage, attachmentMenuIcons, chatInputRef, fromUserJId } =
    props;

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

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleAttachmentIconPressed = item => () => {
    closeModal();
    item.formatter?.();
  };

  return (
    <>
      <View
        style={[
          styles.container,
          Boolean(message) && commonStyles.paddingRight_0,
        ]}>
        <View style={styles.textInputContainer}>
          <IconButton
            containerStyle={styles.emojiPickerIconWrapper}
            style={styles.emojiPickerIcon}
            onPress={toggleEmojiPicker}>
            {isEmojiPickerShowing ? <KeyboardIcon /> : <EmojiIcon />}
          </IconButton>

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
            style={styles.attachmentIcon}>
            <AttachmentIcon />
          </IconButton>
          <IconButton
            containerStyle={styles.audioRecordIconWrapper}
            style={styles.audioRecordIcon}>
            <MicIcon />
          </IconButton>
        </View>

        {Boolean(message) && (
          <SendBtn style={styles.sendButton} onPress={sendMessage} />
        )}
      </View>
      <EmojiOverlay
        state={message}
        setState={setMessage}
        visible={isEmojiPickerShowing}
        onClose={() => setIsEmojiPickerShowing(false)}
        onSelect={handleEmojiSelect}
      />
      <Modal visible={isOpen} onRequestClose={closeModal}>
        <ModalBottomContent onPressOutside={closeModal}>
          <View style={styles.modalContent}>
            {attachmentMenuIcons.map(item => {
              const { name, icon: MenuIcon } = item;
              return (
                <View key={name} style={styles.attachmentMenuIcon}>
                  <IconButton onPress={handleAttachmentIconPressed(item)}>
                    <MenuIcon />
                  </IconButton>
                  <Text style={styles.attachmentNameText}>{name}</Text>
                </View>
              );
            })}
          </View>
        </ModalBottomContent>
      </Modal>
    </>
  );
};

export default React.memo(ChatInput);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 0.25,
    borderColor: ApplicationColors.mainBorderColor, // "#959595"
    padding: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 40,
    borderColor: ApplicationColors.mainBorderColor, // "#959595"
  },
  emojiPickerIconWrapper: {
    marginLeft: 5,
    borderRadius: 50,
    overflow: 'hidden',
  },
  emojiPickerIcon: {
    padding: 10,
  },
  attachmentIcon: {
    padding: 10,
    paddingHorizontal: 12,
  },
  attachmentNameText: {
    color: '#fff',
  },
  audioRecordIconWrapper: {
    marginLeft: 4,
    marginRight: 10,
  },
  audioRecordIcon: {
    padding: 10,
    paddingHorizontal: 12,
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
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputTextbox: {
    flex: 1,
    minHeight: 20,
    maxHeight: 100,
  },
  modalContent: {
    width: '93%',
    marginBottom: 10,
    marginTop: 'auto',
    backgroundColor: '#181818',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  attachmentMenuIcon: {
    width: '32%',
    paddingVertical: 12,
    alignItems: 'center',
  },
});
