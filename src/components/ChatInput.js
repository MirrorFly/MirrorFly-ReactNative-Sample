import { useFocusEffect } from '@react-navigation/native';
import React, { createRef, useRef } from 'react';
import { Animated, Keyboard, PanResponder, Platform, StyleSheet, View } from 'react-native';
import AudioRecorderPlayer, {
   AVEncoderAudioQualityIOSType,
   AVEncodingOption,
   AVModeIOSOption,
   AudioEncoderAndroidType,
   AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { useDispatch } from 'react-redux';
import { pauseAudio } from '../Media/AudioPlayer';
import { handleSendMsg, updateTypingGoneStatus, updateTypingStatus } from '../SDK/utils';
import AlertModal from '../common/AlertModal';
import AttachmentMenu from '../common/AttachmentMenu';
import { SendBtn } from '../common/Button';
import IconButton from '../common/IconButton';
import { AttachmentIcon, BackArrowIconR, DeleteBinIcon, EmojiIcon, KeyboardIcon, MicIcon } from '../common/Icons';
import NickName from '../common/NickName';
import RippleAnimation from '../common/RippleAnimation';
import Text from '../common/Text';
import TextInput from '../common/TextInput';
import { useAppState } from '../common/hooks';
import { audioRecordPermission } from '../common/permissions';
import { formatMillisecondsToTime } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import {
   attachmentMenuIcons,
   getUserIdFromJid,
   handleUpdateBlockUser,
   mediaObjContructor,
   showToast,
} from '../helpers/chatHelpers';
import { MIX_BARE_JID, audioRecord, uriPattern } from '../helpers/constants';
import { getStringSet } from '../localization/stringSet';
import { toggleEditMessage } from '../redux/chatMessageDataSlice';
import { setAudioRecordTime, setAudioRecording, setTextMessage } from '../redux/draftSlice';
import {
   getAudioRecordTime,
   getAudioRecording,
   getCurrentCallRoomId,
   getUserNameFromStore,
   useAudioRecordTime,
   useAudioRecording,
   useBlockedStatus,
   useChatMessage,
   useEditMessageId,
   useTextMessage,
   useThemeColorPalatte,
   useUserType,
} from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import EmojiOverlay from './EmojiPicker';

const audioRecorderPlayer = new AudioRecorderPlayer();
const audioRecordRef = createRef();
audioRecordRef.current = {};

let userId = '',
   fileInfo = {},
   fileName = {},
   audioRecordClick = 0,
   isAudioClicked = false;

export const chatInputRef = createRef();
chatInputRef.current = {};

export const stopAudioRecord = () => {
   if (getAudioRecording(userId)) {
      audioRecordRef.current.onStopRecord?.();
   }
};

export const cancelAudioRecord = () => {
   if (getAudioRecording(userId)) {
      audioRecordRef.current.onCancelRecord?.();
   }
};

function ChatInput({ chatUser }) {
   userId = getUserIdFromJid(chatUser);
   const stringSet = getStringSet();
   const recordTimeoutRef = useRef(null);
   const themeColorPalatte = useThemeColorPalatte();
   const dispatch = useDispatch();
   const appState = useAppState();
   const typingTimeoutRef = React.useRef(null);
   const message = useTextMessage(userId) || '';
   const [menuOpen, setMenuOpen] = React.useState(false);
   const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
   const userType = useUserType(chatUser); // have to check this to avoid the re-render if any update happen in recent chat this chat input also renders
   const editMessageId = useEditMessageId();
   const originalMessageObj = useChatMessage(userId, editMessageId);
   const originalMessage = originalMessageObj?.msgBody?.media?.caption || originalMessageObj?.msgBody?.message;
   const panRef = React.useRef(new Animated.ValueXY({ x: 0.1, y: 0 })).current;
   const isAudioRecording = useAudioRecording(userId);
   const recordSecs = useAudioRecordTime(userId) || 0;
   const [recordTime, setRecordTime] = React.useState(formatMillisecondsToTime(recordSecs) || '00:00');
   const [showDeleteIcon, setShowDeleteIcon] = React.useState(false);
   const blockedStaus = useBlockedStatus(userId);
   const [modalContent, setModalContent] = React.useState(null);

   useFocusEffect(
      React.useCallback(() => {
         return () => {
            updateTypingGoneStatus(chatUser);
            stopAudioRecord();
         };
      }, []),
   );

   React.useEffect(() => {
      return () => {
         stopAudioRecord();
      };
   }, []);

   React.useEffect(() => {
      if (!appState) {
         stopAudioRecord();
      }
   }, [appState]);

   React.useEffect(() => {
      audioRecordRef.current.onStopRecord = onStopRecord;
      audioRecordRef.current.onCancelRecord = onCancelRecord;
   }, [isAudioRecording]);

   const onRecordBackListener = e => {
      setRecordSecs(e.currentPosition);
      timeValidate(e.currentPosition);
      setRecordTime(formatMillisecondsToTime(e.currentPosition));
   };

   const setRecordSecs = time => {
      dispatch(setAudioRecordTime({ userId, time }));
   };

   const setMessage = text => {
      dispatch(setTextMessage({ userId, message: text }));
   };

   const closeModal = () => {
      setMenuOpen(false);
   };

   const toggleEmojiPicker = () => {
      setIsEmojiPickerShowing(!isEmojiPickerShowing);
      if (isEmojiPickerShowing) {
         chatInputRef?.current?.focus();
      } else {
         Keyboard.dismiss();
      }
   };

   const removeListener = () => {
      audioRecorderPlayer.removeRecordBackListener();
   };

   const handleAttachmentconPressed = () => {
      setIsEmojiPickerShowing(false);
      Keyboard.dismiss();
      setTimeout(() => {
         setMenuOpen(true);
      }, 50);
   };

   const handleAttachmentIconPressed = item => () => {
      closeModal();
      //Prevent pickers not opening when attachment is selected
      setTimeout(() => {
         item.formatter?.();
      }, 200);
   };

   const onChangeMessage = text => {
      setMessage(text);
      if (text) {
         updateTypingStatus(chatUser);
      }
      if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to update typing status after 1000ms (adjust as needed)
      typingTimeoutRef.current = setTimeout(() => {
         updateTypingGoneStatus(chatUser);
      }, config.typingStatusGoneWaitTime);
   };

   const sendMessage = () => {
      updateTypingGoneStatus(chatUser);
      switch (true) {
         case recordSecs && recordSecs < 1000:
            showToast('Recorded audio time is too short');
            onResetRecord();
            break;
         case recordSecs && recordSecs >= 1000:
            onResetRecord();
            const updatedFile = {
               fileDetails: fileInfo[userId],
            };
            const messageData = {
               messageType: 'media',
               content: [updatedFile],
               chatUser,
            };
            handleSendMsg(messageData);
            break;
         case Boolean(message.trim()) && Boolean(editMessageId):
            setMessage('');
            dispatch(toggleEditMessage(''));
            handleSendMsg({
               chatUser,
               message: message.trim(),
               messageType: 'messageEdit',
               editMessageId: editMessageId,
            });
            break;
         case Boolean(message.trim()):
            setMessage('');
            handleSendMsg({ chatUser, message: message.trim(), messageType: 'text' });
            break;
      }
   };

   const timeValidate = millsec => {
      const secs = millsec / 1000;
      if (secs > config.audioRecordDuaration) {
         showToast('You can record maximum 300 seconds for audio recording');
         onStopRecord();
      }
   };

   const onResetRecord = () => {
      isAudioClicked = false;
      setAudioRecording('');
      setRecordTime('');
      setRecordSecs(0);
      setShowDeleteIcon(false);
      dispatch(setAudioRecording({ userId, message: '' }));
   };

   const onStartRecord = async () => {
      try {
         clearTimeout(recordTimeoutRef.current); // Clear previous timeout if exists

         recordTimeoutRef.current = setTimeout(async () => {
            if (getCurrentCallRoomId()) {
               return showToast(stringSet.TOAST_MESSAGES.AUDIO_CANNOT_BE_RECORDED_WHILE_IN_CALL);
            }
            if (isAudioClicked) {
               return;
            }

            isAudioClicked = true;
            pauseAudio();
            audioRecordClick += 1;

            if ((await audioRecordPermission()) !== 'granted') {
               return;
            }

            const filePath = Platform.select({
               ios: `file://${RNFS.DocumentDirectoryPath}/MFRN_${Date.now() + audioRecordClick}.m4a`,
               android: `${RNFS.CachesDirectoryPath}/MFRN_${Date.now() + audioRecordClick}.m4a`,
            });

            await audioRecorderPlayer.startRecorder(filePath, {
               AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
               AudioSourceAndroid: AudioSourceAndroidType.MIC,
               AVModeIOS: AVModeIOSOption.measurement,
               AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
               AVNumberOfChannelsKeyIOS: 2,
               AVFormatIDKeyIOS: AVEncodingOption.aac,
            });

            dispatch(setAudioRecording({ userId, message: audioRecord.RECORDING }));
            audioRecorderPlayer.addRecordBackListener(onRecordBackListener);
         }, 500);
      } catch (error) {
         console.error('Failed to start recording:', error);
      }
   };

   const onStopRecord = async () => {
      try {
         clearTimeout(recordTimeoutRef.current); // Clear previous timeout if exists

         recordTimeoutRef.current = setTimeout(async () => {
            if (!getAudioRecording(userId)) {
               return;
            }

            const result = await audioRecorderPlayer.stopRecorder();
            isAudioClicked = false;
            panRef.setValue({ x: 0.1, y: 0 });
            removeListener();
            dispatch(setAudioRecording({ userId, message: audioRecord.STOPPED }));

            if (uriPattern.test(result)) {
               const fileStats = await RNFS.stat(result);
               fileInfo[userId] = {
                  ...mediaObjContructor('AUDIO_RECORD', {
                     ...fileStats,
                     fileCopyUri: result,
                     duration: getAudioRecordTime(userId),
                     name: fileName[userId],
                     audioType: 'recording',
                     type: 'audio/m4a',
                  }),
               };
               console.log('fileInfo[userId] ==>', JSON.stringify(fileInfo[userId], null, 2));
            }
         }, 500); // 500ms debounce
      } catch (error) {
         console.log('Failed to stop audio recording:', error);
      }
   };

   const onCancelRecord = async () => {
      await onStopRecord();
      if (fileInfo[userId]?.fileCopyUri) {
         RNFS.unlink(fileInfo[userId].fileCopyUri);
      }
      onResetRecord();
   };

   const handleCloseEmojiWindow = () => {
      setIsEmojiPickerShowing(false);
   };

   const handleEmojiSelect = (...emojis) => {
      setMessage(message + emojis);
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const hadleBlockUser = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: `Unblock ${getUserNameFromStore(userId)}`,
         noButton: 'CANCEL',
         yesButton: 'UNBLOCK',
         yesAction: handleUpdateBlockUser(userId, 0, chatUser),
      });
   };

   const panResponder = React.useRef(
      PanResponder.create({
         onMoveShouldSetPanResponder: () => true,
         onPanResponderMove: (e, gestureState) => {
            // Calculate the new position considering the initial offset
            let value = Math.max(-110, Math.min(gestureState.dx, 0));
            // Limit the movement to between 10% from the left and 90% from the left (10% from the right)
            panRef.setValue({ x: value, y: 0 });
            if (value < -90) {
               setShowDeleteIcon(true);
            }
            if (value === -110) {
               onCancelRecord();
               Animated.spring(panRef, {
                  toValue: { x: 0.1, y: 0 },
                  useNativeDriver: true,
               }).start();
            }
         },
         onPanResponderRelease: () => {
            setShowDeleteIcon(false);
            Animated.spring(panRef, {
               toValue: { x: 0.1, y: 0 },
               useNativeDriver: true,
            }).start();
         },
      }),
   ).current;

   const textInputRender = React.useMemo(() => {
      return (
         <>
            <IconButton
               containerStyle={styles.emojiPickerIconWrapper}
               style={styles.emojiPickerIcon}
               onPress={toggleEmojiPicker}>
               {isEmojiPickerShowing ? (
                  <KeyboardIcon color={themeColorPalatte.iconColor} />
               ) : (
                  <EmojiIcon color={themeColorPalatte.iconColor} />
               )}
            </IconButton>
            <TextInput
               inputRef={chatInputRef}
               value={message}
               style={[styles.inputTextbox, { color: themeColorPalatte.primaryTextColor }]}
               onChangeText={onChangeMessage}
               placeholder={stringSet.PLACEHOLDERS.CHAT_INPUT_PLACEHOLDER}
               placeholderTextColor={themeColorPalatte.placeholderTextColor}
               numberOfLines={1}
               multiline={true}
               cursorColor={themeColorPalatte.primaryColor}
               selectionColor={themeColorPalatte.primaryColor}
               onFocus={handleCloseEmojiWindow}
            />
            {!editMessageId && (
               <IconButton onPress={handleAttachmentconPressed} style={styles.attachmentIcon}>
                  <AttachmentIcon color={themeColorPalatte.iconColor} />
               </IconButton>
            )}
            {!editMessageId && (
               <IconButton
                  containerStyle={styles.audioRecordIconWrapper}
                  style={styles.audioRecordIcon}
                  onPress={onStartRecord}>
                  <MicIcon />
               </IconButton>
            )}
         </>
      );
   }, [message, isEmojiPickerShowing, themeColorPalatte]);

   const renderRecording = () => {
      if (isAudioRecording === audioRecord.RECORDING) {
         return (
            <Animated.View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  {
                     transform: [{ translateX: panRef.x }],
                  },
               ]}
               {...panResponder.panHandlers}>
               <BackArrowIconR fill="#767676" />
               <Text>Slide to cancel</Text>
            </Animated.View>
         );
      }
      if (isAudioRecording === audioRecord.STOPPED) {
         return (
            <IconButton onPress={onCancelRecord}>
               <Text style={{ color: 'red' }}>Cancel</Text>
            </IconButton>
         );
      }
      return null;
   };

   const renderSendButton = React.useMemo(() => {
      const isMessage = message.trim() && originalMessage !== message.trim();
      const isAllowSendMessage = isMessage || Boolean(recordSecs) || isAudioRecording === audioRecord.STOPPED;

      if (isAudioRecording === audioRecord.RECORDING) {
         return (
            <View style={[commonStyles.positionRelative]}>
               <RippleAnimation animateToValue={1.5} baseStyle={styles.avatharPulseAnimatedView} />
               <IconButton
                  onPress={onStopRecord}
                  containerStyle={{
                     backgroundColor: ApplicationColors.mainColor,
                     marginLeft: 10,
                     padding: 2.5,
                     paddingHorizontal: 5.5,
                     borderRadius: 100,
                  }}>
                  <MicIcon color={ApplicationColors.white} />
               </IconButton>
            </View>
         );
      }

      return isAllowSendMessage ? <SendBtn style={styles.sendButton} onPress={sendMessage} /> : null;
   }, [message, recordSecs, isAudioRecording]);

   if (blockedStaus) {
      return (
         <View style={styles.container}>
            <Text
               style={[
                  commonStyles.px_4,
                  styles.cantMessaegs,
                  { color: themeColorPalatte.groupNotificationTextColour },
               ]}>
               You have blocked <NickName userId={userId} />.{' '}
               <Text
                  style={[commonStyles.mainTextColor, commonStyles.textDecorationLine, commonStyles.fontSize_15]}
                  onPress={hadleBlockUser}>
                  {stringSet.CHAT_SCREEN.UNBLOCK_LABEL}
               </Text>
            </Text>
            {modalContent && <AlertModal {...modalContent} />}
         </View>
      );
   }

   if (MIX_BARE_JID.test(chatUser) && !userType) {
      return (
         <View
            style={[
               styles.container,
               { backgroundColor: themeColorPalatte.screenBgColor, borderColor: themeColorPalatte.mainBorderColor },
            ]}>
            <Text
               style={[
                  commonStyles.px_4,
                  styles.cantMessaegs,
                  { color: themeColorPalatte.groupNotificationTextColour },
               ]}>
               {stringSet.CHAT_SCREEN.NO_LONGER_PARTICIPANT_SEND_MESSAGE}
            </Text>
         </View>
      );
   }

   return (
      <>
         <View
            style={[
               styles.container,
               { backgroundColor: themeColorPalatte.screenBgColor, borderColor: themeColorPalatte.mainBorderColor },
            ]}>
            <View style={[styles.textInputContainer, { borderColor: themeColorPalatte.mainBorderColor }]}>
               {Boolean(isAudioRecording) ? (
                  <View style={styles.hstack}>
                     <View style={{ height: 48, justifyContent: 'center' }}>
                        {showDeleteIcon ? (
                           <DeleteBinIcon color={'red'} />
                        ) : (
                           <View
                              style={[
                                 commonStyles.hstack,
                                 commonStyles.justifyContentCenter,
                                 commonStyles.alignItemsCenter,
                              ]}>
                              {isAudioRecording === audioRecord.STOPPED && (
                                 <MicIcon color={ApplicationColors.mainColor} />
                              )}
                              <Text style={styles.recordTime}>{recordTime || '00:00'}</Text>
                           </View>
                        )}
                     </View>
                     <View style={styles.animateContainer}>{renderRecording()}</View>
                  </View>
               ) : (
                  textInputRender
               )}
            </View>
            {renderSendButton}
         </View>
         <AttachmentMenu
            visible={menuOpen}
            onRequestClose={closeModal}
            attachmentMenuIcons={attachmentMenuIcons}
            handleAttachmentIconPressed={handleAttachmentIconPressed}
         />
         <EmojiOverlay
            place={'CHAT_INPUT'}
            state={message}
            setState={setMessage}
            visible={isEmojiPickerShowing}
            onClose={handleCloseEmojiWindow}
            onSelect={handleEmojiSelect}
         />
      </>
   );
}

export default React.memo(ChatInput);

const styles = StyleSheet.create({
   cantMessaegs: { textAlign: 'center', fontSize: 15 },
   container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: 0.25,
      borderColor: ApplicationColors.mainBorderColor,
      padding: 8,
   },
   hstack: {
      marginHorizontal: 12.5,
      flexDirection: 'row',
      alignItems: 'center',
   },
   recordTime: {
      fontSize: 14,
      marginLeft: 10,
      // Fixed height to match animated view
      lineHeight: 48, // Center text vertically
      color: ApplicationColors.mainColor,
   },
   animateContainer: {
      flex: 1,
      alignItems: 'flex-end',
   },
   avatharPulseAnimatedView: {
      position: 'absolute',
      width: 45,
      height: 45,
      borderRadius: 70,
      zIndex: 0,
      right: 0,
      bottom: 0,
      backgroundColor: ApplicationColors.mainColor,
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
      position: 'relative',
      overflow: 'hidden',
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
