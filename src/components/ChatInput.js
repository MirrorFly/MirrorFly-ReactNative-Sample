import React, { createRef, useEffect, useRef, useState } from 'react';
import {
   Animated,
   AppState,
   Easing,
   Keyboard,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';
import { SendBtn } from '../common/Button';
import { AttachmentIcon, DeleteRedBinIcon, EmojiIcon, KeyboardIcon, MicIcon, SideArrowIcon } from '../common/Icons';

import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Sound from 'react-native-sound';
import { useSelector } from 'react-redux';
import { CHAT_INPUT, MIX_BARE_JID } from '../Helper/Chat/Constant';
import { showToast } from '../Helper/index';

import SDK from '../SDK/SDK';
import AttachmentMenu from '../common/AttachmentMenu';
import IconButton from '../common/IconButton';
import commonStyles from '../common/commonStyles';
import { getExtention } from '../common/utils';
import ApplicationColors from '../config/appColors';
import { useNetworkStatus } from '../hooks';
import EmojiOverlay from './EmojiPicker';
import { soundRef } from './Media/AudioPlayer';
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

const ChatInput = props => {
   const { onSendMessage, attachmentMenuIcons, chatInputRef, fromUserJId, handleSendMsg } = props;
   const typingTimeoutRef = useRef(null);
   const { data = {} } = useSelector(state => state.recoverMessage);
   const [message, setMessage] = useState(data[fromUserJId]?.textMessage || '');
   const [isOpen, setIsOpen] = useState(false);
   const [isEmojiPickerShowing, setIsEmojiPickerShowing] = useState(false);
   const recentChatList = useSelector(state => state.recentChatData.data);
   const userType = recentChatList.find(r => r.fromUserJid === fromUserJId)?.userType;
   const [showRecorderUi, setShowRecorderUi] = useState(false);
   const [isRecording, setIsRecording] = useState(false);
   const [recordingDuration, setRecordingDuration] = useState('00:00');

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

   const updateTypingStatus = jid => {
      if (!typingStatusSent) {
         SDK.sendTypingStatus(jid);
         typingStatusSent = true;
      }
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
            setRecordingDuration(audioRecorderPlayer.mmssss(e.currentPosition).slice(0, 5));
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

   /**
   const startRecording = async () => {
      if (!isRecording) {
         try {
            const isNotFirstTimeLocationPermissionCheck = await AsyncStorage.getItem('MicroPhone_permission');
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
            setTotalDuration(0);
            setRecordingDuration('00:00');
            audioRecorderPlayer.setVolume(0.8);
         } catch (error) {
            console.error('Failed to start recording', error);
         }
      }
   };
   */
   const stopRecording = async () => {
      if (isRecording) {
         try {
            const path = await audioRecorderPlayer.stopRecorder();
            setIsRecording(false);
            setShowRecorderUi(true);
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
   }, [message]);

   const sendMessage = () => {
      setMessage('');
      if (message) {
         updateTypingGoneStatus(fromUserJId);
         setTimeout(() => {
            onSendMessage(message.trim());
         }, 0);
      }
   };

   const onChangeMessage = text => {
      setMessage(text);
      if (text) {
         updateTypingStatus(fromUserJId);
      }
      if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to update typing status after 1000ms (adjust as needed)
      typingTimeoutRef.current = setTimeout(() => {
         updateTypingGoneStatus(fromUserJId);
      }, config.typingStatusGoneWaitTime);
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

   const handleEmojiSelect = (...emojis) => {
      setMessage(prev => prev + emojis);
   };

   const toggleEmojiPicker = () => {
      setIsEmojiPickerShowing(!isEmojiPickerShowing);
      if (isEmojiPickerShowing) {
         chatInputRef?.current?.focus();
      } else {
         Keyboard.dismiss();
      }
   };

   const handleAttachmentconPressed = () => {
      setIsEmojiPickerShowing(false);
      Keyboard.dismiss();
      soundRef?.current?.pause();
      soundRef?.current?.updateState?.();
      setTimeout(() => {
         setIsOpen(true);
      }, 50);
   };

   const closeModal = () => {
      setIsOpen(false);
   };

   const handleAttachmentIconPressed = item => () => {
      closeModal();
      item.formatter?.();
   };

   const handleCancel = () => {
      setShowRecorderUi(!showRecorderUi);
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

   const renderSendButton = () => {
      const isAllowSendMessage = MIX_BARE_JID.test(fromUserJId)
         ? Boolean(userType) && Boolean(message.trim())
         : Boolean(message.trim());

      return isAllowSendMessage ? <SendBtn style={styles.sendButton} onPress={sendMessage} /> : null;
   };

   const handleCLoseEmojiWindow = () => {
      setIsEmojiPickerShowing(false);
   };

   return (
      <>
         {!showRecorderUi ? (
            <View style={[styles.container, Boolean(message) && commonStyles.paddingRight_0]}>
               {MIX_BARE_JID.test(fromUserJId) && !userType ? (
                  <Text style={[commonStyles.px_4, styles.cantMessaegs]}>
                     You can't send messages to this group because you're no longer a participant
                  </Text>
               ) : (
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
                           cursorColor={ApplicationColors.mainColor}
                           onFocus={handleCLoseEmojiWindow}
                        />

                        <View style={commonStyles.marginHorizontal_10}>
                           {/* Remove this view tag while adding mic icon */}
                           <IconButton onPress={handleAttachmentconPressed} style={styles.attachmentIcon}>
                              <AttachmentIcon />
                           </IconButton>
                        </View>

                        {/* <IconButton
                           containerStyle={styles.audioRecordIconWrapper}
                           onPress={startRecording}
                           style={styles.audioRecordIcon}>
                           <MicIcon style={isRecording && micStyle} />
                        </IconButton> */}
                     </>
                  </View>
               )}
               {renderSendButton()}
            </View>
         ) : (
            <View style={[styles.container, Boolean(message) && commonStyles.paddingRight_0]}>
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
                           <Text style={styles.totalDurationText}>{recordingDuration}</Text>
                        )}
                     </View>
                  </View>
                  {isRecording ? (
                     <View style={styles.GestureHandlerContainer}>
                        <View style={styles.recorderUI}>
                           <GestureHandlerRootView style={commonStyles.flex1} onTouchStart={onTouchStart}>
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
                  {showRecorderUi && !totalDuration ? (
                     <View style={styles.PlusingSubcontainer}>
                        <TouchableOpacity style={[styles.micIcon, isRecording && micStyle]} onPress={stopRecording}>
                           <MicIcon color={'#fff'} />
                        </TouchableOpacity>
                     </View>
                  ) : (
                     <SendBtn style={styles.sendButton} onPress={sendAudioRecorderMessage} />
                  )}
               </View>
            </View>
         )}
         <AttachmentMenu
            visible={isOpen}
            onRequestClose={closeModal}
            attachmentMenuIcons={attachmentMenuIcons}
            handleAttachmentIconPressed={handleAttachmentIconPressed}
         />

         <EmojiOverlay
            place={CHAT_INPUT}
            state={message}
            setState={setMessage}
            visible={isEmojiPickerShowing}
            onClose={handleCLoseEmojiWindow}
            onSelect={handleEmojiSelect}
         />
      </>
   );
};

export default React.memo(ChatInput);

const styles = StyleSheet.create({
   cantMessaegs: { textAlign: 'center', fontSize: 15, color: ApplicationColors.groupNotificationTextColour },
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
