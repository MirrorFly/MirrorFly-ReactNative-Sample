import React from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { handleSendMsg } from '../SDK/utils';
import AttachmentMenu from '../common/AttachmentMenu';
import { SendBtn } from '../common/Button';
import IconButton from '../common/IconButton';
import { AttachmentIcon, EmojiIcon, KeyboardIcon } from '../common/Icons';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import { attachmentMenuIcons, getUserIdFromJid } from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { setTextMessage } from '../redux/draftSlice';
import { useTextMessage, useUserType } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function ChatInput({ chatUser }) {
   const userId = getUserIdFromJid(chatUser);
   const dispatch = useDispatch();
   const typingTimeoutRef = React.useRef(null);
   const message = useTextMessage(userId) || '';
   const [menuOpen, setMenuOpen] = React.useState(false);
   const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
   const userType = useUserType(chatUser); // have to check this to avoid the re-render if any update happen in recent chat this chat input also renders

   const setMessage = text => {
      dispatch(setTextMessage({ userId, message: text }));
   };

   const closeModal = () => {
      setMenuOpen(false);
   };

   const toggleEmojiPicker = () => {
      setIsEmojiPickerShowing(!isEmojiPickerShowing);
      if (isEmojiPickerShowing) {
         // Need to check here
      } else {
         Keyboard.dismiss();
      }
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
      item.formatter?.();
   };

   const onChangeMessage = text => {
      setMessage(text);
      if (text) {
         // Need to check here
      }
      if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to update typing status after 1000ms (adjust as needed)
      typingTimeoutRef.current = setTimeout(() => {}, config.typingStatusGoneWaitTime);
   };

   const sendMessage = () => {
      setMessage('');
      handleSendMsg({ chatUser, message: message.trim(), messageType: 'text' });
   };

   const textInputRender = React.useMemo(() => {
      return (
         <>
            <IconButton
               containerStyle={styles.emojiPickerIconWrapper}
               style={styles.emojiPickerIcon}
               onPress={toggleEmojiPicker}>
               {isEmojiPickerShowing ? <KeyboardIcon /> : <EmojiIcon />}
            </IconButton>
            <TextInput
               //   ref={chatInputRef}
               value={message}
               style={styles.inputTextbox}
               onChangeText={onChangeMessage}
               placeholder="Start Typing..."
               placeholderTextColor="#767676"
               numberOfLines={1}
               multiline={true}
               cursorColor={ApplicationColors.mainColor}
               //   onFocus={handleCLoseEmojiWindow}
            />

            <View style={commonStyles.marginHorizontal_10}>
               {/* Remove this view tag while adding mic icon */}
               <IconButton onPress={handleAttachmentconPressed} style={styles.attachmentIcon}>
                  <AttachmentIcon />
               </IconButton>
            </View>

            {/* <IconButton
                    containerStyle={styles.audioRecordIconWrapper}
                    //   onPress={startRecording}
                    style={styles.audioRecordIcon}>
                    <MicIcon style={isRecording && micStyle} />
                </IconButton> */}
         </>
      );
   }, [message]);

   const renderSendButton = React.useMemo(() => {
      const isAllowSendMessage = Boolean(message.trim());

      return isAllowSendMessage ? <SendBtn style={styles.sendButton} onPress={sendMessage} /> : null;
   }, [message]);

   if (MIX_BARE_JID.test(chatUser) && !userType) {
      return (
         <View style={styles.container}>
            <Text style={[commonStyles.px_4, styles.cantMessaegs]}>
               You can't send messages to this group because you're no longer a participant
            </Text>
         </View>
      );
   }

   return (
      <>
         <View style={styles.container}>
            <View style={styles.textInputContainer}>{textInputRender}</View>
            {renderSendButton}
         </View>
         <AttachmentMenu
            visible={menuOpen}
            onRequestClose={closeModal}
            attachmentMenuIcons={attachmentMenuIcons}
            handleAttachmentIconPressed={handleAttachmentIconPressed}
         />
      </>
   );
}

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
