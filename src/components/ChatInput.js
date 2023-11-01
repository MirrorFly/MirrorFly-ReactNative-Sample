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
  Animated,
  Easing,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { SendBtn } from '../common/Button';
import {
  AttachmentIcon,
  MicIcon,
  EmojiIcon,
  KeyboardIcon,
  DeleteRedBinIcon,
  SideArrowIcon,
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
} from 'react-native-audio-recorder-player';
import { getExtention, requestMicroPhonePermission } from '../common/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openSettings } from 'react-native-permissions';
import Sound from 'react-native-sound';
import { debounce, showToast } from '../Helper/index';
import { useNetworkStatus } from '../hooks';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SDK from '../SDK/SDK';
import config from './chat/common/config';

export const chatInputMessageRef = createRef();
chatInputMessageRef.current = '';

let typingStatusSent = false;

const updateTypingGoneStatus = jid => {
  if (typingStatusSent) {
    SDK.sendTypingGoneStatus(jid);
    typingStatusSent = false;
  }
};

const updateTypingGoneStatusWithDelay = debounce(jid => {
  updateTypingGoneStatus(jid);
}, config.typingStatusGoneWaitTime);

const updateTypingStatus = jid => {
  if (!typingStatusSent) {
    SDK.sendTypingStatus(jid);
    typingStatusSent = true;
  }
  updateTypingGoneStatusWithDelay(jid);
};

const ChatInput = props => {
  const {
    onSendMessage,
    attachmentMenuIcons,
    chatInputRef,
    fromUserJId,
    handleSendMsg,
  } = props;

  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEmojiPickerShowing, setIsEmojiPickerShowing] = useState(false);
  const { data = {} } = useSelector(state => state.recoverMessage);
  const [showRecoderUi, setShowRecorderUi] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState('00:00');
  const [, setAudioPath] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);
  const [recordedData, setRecordedData] = React.useState({});
  const audioRecorderPlayer = React.useRef(new AudioRecorderPlayer()).current;
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);

  const filenameRef = useRef('');
  const isConnected = useNetworkStatus();

  const pulseAnimation = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const listener = AppState.addEventListener('change', _state => {
      if (_state === 'background' || _state === 'inactive') {
        updateTypingGoneStatus(fromUserJId);
      }
    });
    return () => {
      listener.remove();
    };
  }, []);

  const showMaximumLimitAudioToast = () => {
    showToast('You can record maximum 300 seconds for audio recording', {
      id: 'Recording-duration-toast',
    });
  };
  const showInternetconnectionToast = () => {
    showToast('Please check your internet connection', {
      id: 'internet-connection-toast',
    });
  };

  const showMinimumLimitAudioToast = () => {
    showToast('Recorded audio time is too short', {
      id: 'Recording-duration-short-toast',
    });
  };

  const rightSwipeActions = () => {
    return <View style={styles.rightSwipeActionsContainer} />;
  };

  const swipeFromRightOpen = () => {
    setIsRecording(false);
    setShowRecorderUi(false);
    setRecordingDuration('00:00');
    setShowDeleteIcon(false);
    try {
      audioRecorderPlayer.stopRecorder();
    } catch (err) {
      console.log('error when stop recording ', err);
    }
  };

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isRecording]);

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start(event => {
      if (event.finished && isRecording) {
        startPulseAnimation();
      }
    });
  };
  const micStyle = {
    transform: [{ scale: pulseAnimation }],
  };

  useEffect(() => {
    audioRecorderPlayer.addRecordBackListener(e => {
      if (e.currentPosition !== undefined) {
        setRecordingDuration(
          audioRecorderPlayer.mmssss(e.currentPosition).slice(0, 5),
        );
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
          console.log('Micro phone granted');
        } else if (isNotFirstTimeLocationPermissionCheck) {
          openSettings();
        } else {
          console.log('Micro phone Not granted');
        }
        filenameRef.current = 'sound_' + Date.now() + '.aac';
        const path = await audioRecorderPlayer.startRecorder(
          RNFS.DownloadDirectoryPath + '/' + filenameRef.current,
          {
            OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
            AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
          },
        );
        console.log('pathstart', path);
        setIsRecording(true);
        setShowRecorderUi(true);
        setAudioPath(path);
        setTotalDuration(0);
        setRecordingDuration('00:00');
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
        if (path) {
          const soundRes = new Sound(path, '', async error => {
            if (error) {
              console.log(error, 'Play Error');
            } else {
              const resDuration = soundRes.getDuration();
              const statResult = await RNFS.stat(path);
              const fileSize = statResult.size;

              const recordingData = {
                fileDetails: {
                  filename: filenameRef.current,
                  duration: resDuration * 1000 || 0,
                  extension: getExtention(path),
                  uri: path,
                  type: 'audio/aac',
                  fileSize: fileSize,
                },
              };
              setRecordedData(recordingData);
            }
          });
        }
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
    }
  };

  useEffect(() => {
    chatInputMessageRef.current = message;
    if (isConnected) {
      if (message) {
        updateTypingStatus(fromUserJId);
      } else {
        updateTypingGoneStatus(fromUserJId);
      }
    }
  }, [message]);

  const sendMessage = () => {
    if (message) {
      setMessage('');
      updateTypingGoneStatus(fromUserJId);
      setTimeout(() => {
        onSendMessage(message.trim());
      }, 0);
    }
  };

  const onChangeMessage = text => {
    setMessage(text);
  };

  const sendAudioRecorderMessage = () => {
    if (recordingDuration >= '05:00') {
      stopRecording();
      showMaximumLimitAudioToast();
    } else if (recordingDuration > '00:00') {
      let AudioRecordInfo = {
        type: 'media',
        content: [recordedData],
      };
      handleSendMsg(AudioRecordInfo);
      setShowRecorderUi(false);
      setRecordedData({});
    } else if (recordingDuration === '00:00') {
      showMinimumLimitAudioToast();
    } else if (!isConnected) {
      showInternetconnectionToast();
    }
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
    try {
      audioRecorderPlayer.stopRecorder();
    } catch (err) {
      console.log(' error when stop recording ', err);
    }
  };

  const onSwipeClose = () => {
    setShowDeleteIcon(false);
  };

  const onTouchStart = () => {
    setShowDeleteIcon(true);
  };

  const handleSwipeOpen = direction => {
    direction === 'right' && swipeFromRightOpen();
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
                // onPress={startRecording}
                style={styles.audioRecordIcon}>
                <MicIcon style={isRecording && micStyle} />
              </IconButton>
            </>
          </View>
          {Boolean(message) && (
            <SendBtn style={styles.sendButton} onPress={sendMessage} />
          )}
        </View>
      ) : (
        <View
          style={[
            styles.container,
            Boolean(message) && commonStyles.paddingRight_0,
          ]}>
          <View style={styles.RecordUIContainer}>
            <View style={styles.totalTimeMaincontainer}>
              <View style={styles.totalTimeContainer}>
                {!isRecording && recordingDuration && (
                  <View>
                    <MicIcon height={'17'} width={'17'} color={'#3276E2'} />
                  </View>
                )}
                {showDeleteIcon ? (
                  <View>
                    <DeleteRedBinIcon />
                  </View>
                ) : (
                  <Text style={styles.totalDurationText}>
                    {recordingDuration}
                  </Text>
                )}
              </View>
            </View>
            {isRecording ? (
              <View style={styles.GestureHandlerContainer}>
                <View style={styles.recorderUI}>
                  <GestureHandlerRootView
                    style={commonStyles.flex1}
                    onTouchStart={onTouchStart}>
                    <Swipeable
                      renderRightActions={rightSwipeActions}
                      onSwipeableOpen={handleSwipeOpen}
                      containerStyle={styles.SwipeContainer}
                      onSwipeableClose={onSwipeClose}>
                      <View style={styles.SlideContainer}>
                        <View style={commonStyles.marginRight_4}>
                          <SideArrowIcon />
                        </View>

                        <Text style={styles.cancelText}>Slide to Cancel</Text>
                      </View>
                    </Swipeable>
                  </GestureHandlerRootView>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelOptionText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.Plusingcontainer}>
            {showRecoderUi && !totalDuration ? (
              <View style={styles.PlusingSubcontainer}>
                <TouchableOpacity
                  style={[styles.micIcon, isRecording && micStyle]}
                  onPress={stopRecording}>
                  <MicIcon color={'#fff'} />
                </TouchableOpacity>
              </View>
            ) : (
              <SendBtn
                style={styles.sendButton}
                onPress={sendAudioRecorderMessage}
              />
            )}
          </View>
        </View>
      )}

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
    borderColor: ApplicationColors.mainBorderColor,
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
    borderColor: ApplicationColors.mainBorderColor,
  },
  RecordUIContainer: {
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 40,
    borderColor: ApplicationColors.mainBorderColor,
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
    padding: 10,
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
    padding: 10,
    borderRadius: 35,
  },
  durationText: {
    fontSize: 12,
    color: '#3276E2',
    marginLeft: 20,
  },
  totalTimeContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTimeMaincontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    justifyContent: 'space-between',
  },
  totalDurationText: { fontSize: 12, color: '#3276E2', marginLeft: 6 },
  cancelText: {
    color: '#363636',
    fontWeight: '400',
    fontSize: 12,
  },
  cancelOptionText: {
    color: '#ee2c2c',
    fontWeight: '400',
    fontSize: 12,
    right: 20,
  },
  Plusingcontainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  PlusingSubcontainer: {
    padding: 2,
    backgroundColor: '#9db8e2',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#9db8e2',
  },
  recorderUI: {
    flex: 1,
    flexDirection: 'row',
    right: 18,
  },
  rightSwipeActionsContainer: {
    width: '60%',
  },
  SwipeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  GestureHandlerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  arrowSlideIcon: {
    width: 10,
    height: 10,
    marginRight: 3,
    marginTop: 4,
  },
  SlideContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
