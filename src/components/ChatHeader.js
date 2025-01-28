import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { BackArrowIcon, CloseIcon, DeleteIcon, ForwardIcon, LeftArrowIcon } from '../common/Icons';
import MenuContainer from '../common/MenuContainer';
import Modal, { ModalCenteredContent } from '../common/Modal';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import config from '../config/config';
import {
   copyToClipboard,
   getUserIdFromJid,
   getUserType,
   handelResetMessageSelection,
   handleConversationClear,
   handleMessageDelete,
   handleMessageDeleteForEveryOne,
   handleUpdateBlockUser,
   isAnyMessageWithinLast30Seconds,
   isLocalUser,
} from '../helpers/chatHelpers';
import { MIX_BARE_JID } from '../helpers/constants';
import { getStringSet } from '../localization/stringSet';
import { setChatSearchText, toggleEditMessage } from '../redux/chatMessageDataSlice';
import { setTextMessage } from '../redux/draftSlice';
import {
   getSelectedChatMessages,
   getUserNameFromStore,
   useBlockedStatus,
   useSelectedChatMessages,
   useThemeColorPalatte,
} from '../redux/reduxHook';
import {
   FORWARD_MESSSAGE_SCREEN,
   GROUP_INFO,
   MESSAGE_INFO_SCREEN,
   RECENTCHATSCREEN,
   USER_INFO,
} from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { RenderReplyIcon } from './ChatHeaderActions';
import { chatInputRef } from './ChatInput';
import LastSeen from './LastSeen';
import MakeCall from './MakeCall';
import UserAvathar from './UserAvathar';

function ChatHeader({ chatUser }) {
   const dispatch = useDispatch();
   const navigation = useNavigation();
   const userId = getUserIdFromJid(chatUser);
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();

   const filtered = useSelectedChatMessages(userId) || [];
   const [text, setText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);
   const [modalContent, setModalContent] = React.useState(null);
   const [remove, setRemove] = React.useState(false);
   const blockedStaus = useBlockedStatus(userId);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, [isSearching]);

   React.useEffect(() => {
      dispatch(setChatSearchText(text));
   }, [text]);

   const handleBackBtn = () => {
      switch (true) {
         case isSearching:
            toggleSearch();
            break;
         case navigation.canGoBack():
            navigation.goBack();
            break;
         default:
            navigation.reset({
               index: 0,
               routes: [{ name: RECENTCHATSCREEN }],
            });
            break;
      }
      return true;
   };

   const toggleSearch = () => {
      setIsSearching(!isSearching);
   };

   const clearText = () => {
      setText('');
   };

   const onClose = () => {
      setRemove(false);
   };

   const _handleMessageDelete = () => {
      Keyboard.dismiss();
      const selectedMessages = getSelectedChatMessages(userId);
      const deleteForEveryOne = isAnyMessageWithinLast30Seconds(selectedMessages);
      if (!deleteForEveryOne) {
         setModalContent({
            visible: true,
            onRequestClose: toggleModalContent,
            title:
               filtered.length < 2
                  ? stringSet.CHAT_SCREEN.DELETE_SINGLE_MESSAGE
                  : stringSet.CHAT_SCREEN.DELETE_MULTIPLE_MESSAGE,
            noButton: stringSet.BUTTON_LABEL.CANCEL_BUTTON,
            yesButton: stringSet.CHAT_SCREEN.DELETE_FOR_ME,
            yesAction: handleMessageDelete(chatUser),
         });
      } else {
         setRemove(true);
      }
   };

   const renderDeleteIcon = () => {
      return (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={_handleMessageDelete}>
               <DeleteIcon color={themeColorPalatte.iconColor} />
            </IconButton>
         </View>
      );
   };

   const _handleForwardMessage = () => {
      Keyboard.dismiss();
      navigation.navigate(FORWARD_MESSSAGE_SCREEN, { forwardMessages: filtered });
   };

   const renderForwardIcon = () => {
      const isMediaDownloadedOrUploaded = filtered.every(
         msg =>
            !msg.msgBody?.media || (msg.msgBody?.media?.is_uploading === 2 && msg.msgBody?.media?.is_downloaded === 2),
      );

      const isAllowForward = filtered.every(
         _message => _message?.msgStatus !== 3 && _message?.deleteStatus === 0 && _message?.recallStatus === 0,
      );

      return isMediaDownloadedOrUploaded && isAllowForward ? (
         <IconButton style={[commonStyles.padding_10_15]} onPress={_handleForwardMessage}>
            <ForwardIcon color={themeColorPalatte.iconColor} />
         </IconButton>
      ) : null;
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const handleClearAction = () => {
      handleConversationClear(chatUser);
      setModalContent(null);
   };

   const handleClear = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: 'Are you sure you want to clear the chat?',
         noButton: 'No',
         yesButton: 'Yes',
         yesAction: handleClearAction,
      });
   };

   const handleGoMessageInfoScreen = () => {
      navigation.navigate(MESSAGE_INFO_SCREEN, { chatUser, msgId: filtered[0].msgId });
      handelResetMessageSelection(userId)();
   };

   const handleEditMessage = () => {
      handelResetMessageSelection(userId)();
      dispatch(toggleEditMessage(filtered[0].msgId));
      dispatch(
         setTextMessage({ userId, message: filtered[0]?.msgBody?.media?.caption || filtered[0]?.msgBody?.message }),
      );
      setTimeout(() => {
         chatInputRef?.current?.focus();
      }, 100);
   };

   const hadleBlockUser = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: `${blockedStaus ? 'Unblock' : 'Block'} ${getUserNameFromStore(userId)}`,
         noButton: 'CANCEL',
         yesButton: blockedStaus ? 'UNBLOCK' : 'BLOCK',
         yesAction: handleUpdateBlockUser(userId, blockedStaus ? 0 : 1, chatUser),
      });
   };

   const menuItems = [];

   if (filtered[0]?.msgBody?.message_type === 'text' || filtered[0]?.msgBody?.media?.caption) {
      menuItems.push({
         label: stringSet.CHAT_SCREEN.COPY_TEXT_MENU_LABEL,
         formatter: copyToClipboard(filtered, userId),
      });
   }

   if (filtered.length === 1 && isLocalUser(filtered[0]?.publisherJid) && filtered[0]?.msgStatus !== 3) {
      menuItems.push({
         label: stringSet.CHAT_SCREEN.MESSAGE_INFO_MENU_LABEL,
         formatter: handleGoMessageInfoScreen,
      });
      const now = Date.now();
      if (
         now - filtered[0]?.timestamp <= config.editMessageTime &&
         (filtered[0]?.msgBody.message_type === 'text' || filtered[0]?.msgBody?.media?.caption)
      ) {
         menuItems.push({
            label: 'Edit Message',
            formatter: handleEditMessage,
         });
      }
   }

   if (!filtered.length) {
      menuItems.push({
         label: 'Clear Chat',
         formatter: handleClear,
      });
   }

   if (!filtered.length && !MIX_BARE_JID.test(chatUser)) {
      menuItems.push({
         label: blockedStaus ? 'Unblock' : 'Block',
         formatter: hadleBlockUser,
      });
   }

   const handleRoute = () => {
      if (MIX_BARE_JID.test(chatUser)) {
         navigation.navigate(GROUP_INFO, { chatUser });
      } else {
         navigation.navigate(USER_INFO, { chatUser });
      }
   };

   if (isSearching) {
      return (
         <View
            style={[
               styles.headerContainer,
               { backgroundColor: themeColorPalatte.appBarColor, borderBottomColor: themeColorPalatte.mainBorderColor },
            ]}>
            <IconButton onPress={toggleSearch}>
               <LeftArrowIcon color={themeColorPalatte.iconColor} />
            </IconButton>
            <TextInput
               placeholderTextColor={themeColorPalatte.placeholderTextColor}
               value={text}
               style={[
                  styles.textInput,
                  { color: themeColorPalatte.primaryTextColor, borderBottomColor: themeColorPalatte.primaryColor },
               ]}
               onChangeText={setText}
               placeholder={stringSet.PLACEHOLDERS.SEARCH_PLACEHOLDER}
               cursorColor={themeColorPalatte.primaryColor}
               selectionColor={themeColorPalatte.primaryColor}
               returnKeyType="done"
               autoFocus={true}
            />
            <IconButton onPress={clearText}>
               <CloseIcon />
            </IconButton>
         </View>
      );
   }

   if (filtered.length) {
      return (
         <View
            style={[
               styles.headerContainer,
               { backgroundColor: themeColorPalatte.appBarColor, borderBottomColor: themeColorPalatte.mainBorderColor },
            ]}>
            <IconButton onPress={handelResetMessageSelection(userId)}>
               <CloseIcon color={themeColorPalatte.iconColor} />
            </IconButton>
            <View style={commonStyles.flex1}>
               <Text
                  style={[
                     commonStyles.fontSize_18,
                     commonStyles.pl_10,
                     commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor),
                  ]}>
                  {filtered.length}
               </Text>
            </View>
            <View style={styles.iconsContainer}>
               <RenderReplyIcon userId={userId} />
               {renderDeleteIcon()}
               {renderForwardIcon()}
               {Boolean(menuItems.length) && filtered.length === 1 && <MenuContainer menuItems={menuItems} />}
               {modalContent && <AlertModal {...modalContent} />}
            </View>
            <Modal visible={remove} onRequestClose={onClose}>
               <ModalCenteredContent onPressOutside={onClose}>
                  <View style={styles.deleteModalContentContainer}>
                     <Text
                        style={[
                           styles.deleteModalContentText,
                           commonStyles.textColor(themeColorPalatte.modalTextColor),
                        ]}
                        numberOfLines={2}>
                        {filtered.length < 2
                           ? stringSet.CHAT_SCREEN.DELETE_SINGLE_MESSAGE
                           : stringSet.CHAT_SCREEN.DELETE_MULTIPLE_MESSAGE}
                     </Text>
                     <View style={styles.deleteModalVerticalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={handleMessageDelete(chatUser)}>
                           <Text
                              style={[
                                 styles.deleteModalActionButtonText,
                                 commonStyles.textColor(themeColorPalatte.primaryColor),
                              ]}>
                              {stringSet.CHAT_SCREEN.DELETE_FOR_ME}
                           </Text>
                        </Pressable>
                        <Pressable contentContainerStyle={styles.deleteModalVerticalActionButton} onPress={onClose}>
                           <Text
                              style={[
                                 styles.deleteModalActionButtonText,
                                 commonStyles.textColor(themeColorPalatte.primaryColor),
                              ]}>
                              {stringSet.BUTTON_LABEL.CANCEL_BUTTON}
                           </Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => {
                              onClose();
                              handleMessageDeleteForEveryOne(chatUser)();
                           }}>
                           <Text
                              style={[
                                 styles.deleteModalActionButtonText,
                                 commonStyles.textColor(themeColorPalatte.primaryColor),
                              ]}>
                              {stringSet.CHAT_SCREEN.DELETE_FOR_EVERYONE}
                           </Text>
                        </Pressable>
                     </View>
                  </View>
               </ModalCenteredContent>
            </Modal>
         </View>
      );
   }

   if (!filtered.length) {
      return (
         <View
            style={[
               styles.headerContainer,
               { backgroundColor: themeColorPalatte.appBarColor, borderBottomColor: themeColorPalatte.mainBorderColor },
            ]}>
            <IconButton onPress={navigation.goBack}>
               <BackArrowIcon color={themeColorPalatte.iconColor} />
            </IconButton>
            <Pressable
               onPress={handleRoute}
               style={commonStyles.flex1}
               contentContainerStyle={styles.userAvatarAndInfoContainer}>
               <UserAvathar width={36} height={36} userId={userId} type={getUserType(chatUser)} />
               <View style={styles.userNameAndLastSeenContainer}>
                  <NickName
                     userId={userId}
                     style={[styles.userNameText, { color: themeColorPalatte.headerPrimaryTextColor }]}
                  />
                  <LastSeen userJid={chatUser} style={styles.lastSeenText} />
               </View>
            </Pressable>
            <View style={styles.iconsContainer}>
               <MakeCall chatUser={chatUser} userId={userId} />
               {Boolean(menuItems.length) && <MenuContainer menuItems={menuItems} />}
            </View>
            {modalContent && <AlertModal {...modalContent} />}
         </View>
      );
   }
}

export default React.memo(ChatHeader);

const styles = StyleSheet.create({
   headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 60,
      borderBottomWidth: 1,
      elevation: 2,
      shadowColor: '#181818',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      paddingHorizontal: 10,
   },
   userAvatarAndInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 60,
   },
   userNameAndLastSeenContainer: {
      justifyContent: 'center',
      padding: 10,
   },
   userNameText: {
      fontWeight: '700',
      fontSize: 14,
      maxWidth: 160,
   },
   lastSeenText: {
      fontSize: 12,
      color: '#888888',
   },
   iconsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
   textInput: {
      flex: 1,
      fontSize: 17,
      fontWeight: '400',
      borderBottomWidth: 1,
   },
   deleteModalContentContainer: {
      width: '88%',
      paddingHorizontal: 24,
      paddingVertical: 16,
      fontWeight: '400',
      backgroundColor: 'white',
   },
   deleteModalContentText: {
      fontSize: 16,
      fontWeight: '400',
      marginTop: 10,
   },
   deleteModalVerticalActionButtonsContainer: {
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      paddingTop: 20,
   },
   deleteModalVerticalActionButton: {
      marginBottom: 16,
      paddingVertical: 4,
      paddingHorizontal: 8,
   },
   deleteModalActionButtonText: {
      fontWeight: '600',
   },
});
