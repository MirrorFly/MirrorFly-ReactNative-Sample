import React, {
  createRef,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  TextInput,
  Keyboard,
  StyleSheet,
  View,
  Text,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';
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
import RNFS from 'react-native-fs';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  OutputFormatAndroidType,
  AVModeIOSType,
} from 'react-native-audio-recorder-player';
import { requestMicroPhonePermission } from '../common/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openSettings } from 'react-native-permissions';
import { enableFreeze } from 'react-native-screens';
import { duration } from 'moment';

export const chatInputMessageRef = createRef();
chatInputMessageRef.current = '';

const ChatInput = props => {
  const { onSendMessage, attachmentMenuIcons, chatInputRef, fromUserJId } =
    props;

  // console.log('onSendMessage', onSendMessage);

  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEmojiPickerShowing, setIsEmojiPickerShowing] = useState(false);
  const { data = {} } = useSelector(state => state.recoverMessage);
  const [showRecoderUi, setShowRecorderUi] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPath, setAudioPath] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);

  // const audioRecorderPlayer = React.useRef(new AudioRecorderPlayer()).current;
  const audioRecorderPlayer = React.useRef(new AudioRecorderPlayer()).current;

  useEffect(() => {
    audioRecorderPlayer.addRecordBackListener(e => {
      if (e.currentPosition !== undefined) {
        setRecordingDuration(Math.floor(e.currentPosition));
      }
    });

    return () => {
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, [audioRecorderPlayer]);

  useEffect(() => {
    if (!isRecording && recordingDuration > 0) {
      setTotalDuration(recordingDuration);
    }
  }, [isRecording, recordingDuration]);

  const startRecording = async () => {
    if (!isRecording) {
      try {
        const isNotFirstTimeLocationPermissionCheck =
          await AsyncStorage.getItem('MicroPhone_permission');
        AsyncStorage.setItem('location_permission', 'true');
        const result = await requestMicroPhonePermission();
        if (result === 'granted' || result === 'limited') {
          console.log('Micro phone granded');
        } else if (isNotFirstTimeLocationPermissionCheck) {
          openSettings();
        } else {
          console.log('Micro phone Not granded');
        }

        const path = await audioRecorderPlayer.startRecorder(
          RNFS.DownloadDirectoryPath + '/sound_' + Date.now() + '.aac',
          {
            OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
            AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
          },
        );
        setIsRecording(true);
        setShowRecorderUi(true);
        setAudioPath(path);
        setTotalDuration(0);
        setRecordingDuration(0);
        audioRecorderPlayer.setVolume(0.8);
      } catch (error) {
        console.error('Failed to start recording', error);
      }
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      try {
        const path = await audioRecorderPlayer.stopRecorder();
        setIsRecording(false);
        setShowRecorderUi(true);
        setAudioPath(path);
        setTotalDuration(recordingDuration);
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
    }
  };

  useEffect(() => {
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
    useCallback(() => {
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

  const handleCancel = () => {
    setShowRecorderUi(!showRecoderUi);
  };

  return (
    <>
      {!showRecoderUi ? (
        <View
          style={[
            styles.container,
            Boolean(message) && commonStyles.paddingRight_0,
          ]}>
          <View style={styles.textInputContainer}>
            <>
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
                onPress={startRecording}
                style={styles.audioRecordIcon}>
                <MicIcon />
              </IconButton>
            </>
          </View>
          {Boolean(message) && (
            <SendBtn style={styles.sendButton} onPress={sendMessage} />
          )}
        </View>
      ) : null}
      {showRecoderUi ? (
        <View
          style={[
            styles.container,
            Boolean(message) && commonStyles.paddingRight_0,
          ]}>
          <View style={styles.textInputContainer}>
            {recordingDuration > 0 && !totalDuration && (
              <View>
                <Text style={styles.durationText}>
                  {recordingDuration?.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.totalTimeMaincontainer}>
              <View style={styles.totalTimeContainer}>
                {totalDuration > 0 && (
                  <View>
                    <MicIcon height={'17'} width={'17'} color={'#3276E2'} />
                  </View>
                )}
                {totalDuration > 0 && (
                  <Text style={styles.totalDurationText}>
                    {totalDuration?.toFixed(2)}
                  </Text>
                )}
              </View>
              <View>
                {totalDuration > 0 && (
                  <TouchableOpacity onPress={handleCancel}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View>
            {showRecoderUi && !totalDuration ? (
              <TouchableOpacity style={styles.micIcon} onPress={stopRecording}>
                <MicIcon color={'#fff'} />
              </TouchableOpacity>
            ) : (
              <SendBtn style={styles.sendButton} onPress={sendMessage} />
            )}
          </View>
        </View>
      ) : null}

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
  micIcon: {
    backgroundColor: '#3276E2',
    padding: 8,
    borderRadius: 15,
  },
  durationText: {
    fontSize: 12,
    color: '#3276E2',
    marginLeft: 20,
  },
  totalTimeContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  totalTimeMaincontainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  totalDurationText: { fontSize: 12, color: '#3276E2', marginLeft: 6 },
  cancelText: {
    fontSize: 12,
    color: 'rgb(255, 0, 0)',
    fontWeight: '300',
  },
});
