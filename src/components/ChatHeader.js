import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, Keyboard, StyleSheet, View } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';
import { initiateMirroflyCall, isRoomExist } from '../Helper/Calls/Utility';
import SDK, { RealmKeyValueStore } from '../SDK/SDK';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import {
   AudioCall,
   BackArrowIcon,
   CloseIcon,
   DeleteIcon,
   ForwardIcon,
   LeftArrowIcon,
   ReplyIcon,
   VideoCallIcon,
} from '../common/Icons';
import MenuContainer from '../common/MenuContainer';
import Modal, { ModalCenteredContent } from '../common/Modal';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import TextInput from '../common/TextInput';
import { useNetworkStatus } from '../common/hooks';
import {
   checkAudioCallpermission,
   checkVideoCallPermission,
   requestBluetoothConnectPermission,
   requestCameraMicPermission,
   requestMicroPhonePermission,
} from '../common/permissions';
import ApplicationColors from '../config/appColors';
import {
   copyToClipboard,
   getUserIdFromJid,
   getUserType,
   handelResetMessageSelection,
   handleConversationClear,
   handleMessageDelete,
   handleMessageDeleteForEveryOne,
   isAnyMessageWithinLast30Seconds,
   isLocalUser,
   showToast,
} from '../helpers/chatHelpers';
import { ALREADY_ON_CALL, CALL_TYPE_AUDIO, CALL_TYPE_VIDEO, MIX_BARE_JID } from '../helpers/constants';
import { getStringSet } from '../localization/stringSet';
import { resetMessageSelections, setChatSearchText } from '../redux/chatMessageDataSlice';
import { setReplyMessage } from '../redux/draftSlice';
import { closePermissionModal, showPermissionModal } from '../redux/permissionSlice';
import { getSelectedChatMessages, useChatMessages, useRecentChatData, useThemeColorPalatte } from '../redux/reduxHook';
import {
   FORWARD_MESSSAGE_SCREEN,
   GROUP_INFO,
   MESSAGE_INFO_SCREEN,
   RECENTCHATSCREEN,
   USER_INFO,
} from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import LastSeen from './LastSeen';
import UserAvathar from './UserAvathar';

function ChatHeader({ chatUser }) {
   const dispatch = useDispatch();
   const isNetworkConnected = useNetworkStatus();
   const navigation = useNavigation();
   const userId = getUserIdFromJid(chatUser);
   const messsageList = useChatMessages(userId) || [];
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();

   const [text, setText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);
   const [modalContent, setModalContent] = React.useState(null);
   const [remove, setRemove] = React.useState(false);
   const permissionData = useSelector(state => state.permissionData.permissionStatus);
   const [permissionText, setPermissionText] = React.useState('');
   const [showRoomExist, setShowRoomExist] = React.useState(false);
   const userType = useRecentChatData().find(r => r.userJid === chatUser)?.userType || '';

   const filtered = React.useMemo(() => {
      return messsageList.filter(item => item.isSelected === 1);
   }, [messsageList.map(item => item.isSelected).join(',')]);

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
         msg => (msg.msgBody?.media?.is_uploading !== 1 || true) && (msg.msgBody?.media?.is_downloaded !== 1 || true),
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

   const _handleReplyMessage = () => {
      Keyboard.dismiss();
      dispatch(setReplyMessage({ userId, message: filtered[0] }));
      dispatch(resetMessageSelections(userId));
   };

   const renderReplyIcon = () => {
      const isAllowReply = MIX_BARE_JID.test(chatUser)
         ? userType &&
           filtered[0]?.msgBody?.media?.is_uploading !== 1 &&
           !filtered[0]?.recallStatus &&
           filtered[0]?.msgBody?.media?.is_uploading !== 1 &&
           !filtered[0]?.recallStatus
         : filtered[0]?.msgBody?.media?.is_uploading !== 1 && !filtered[0]?.recallStatus;
      return isAllowReply && filtered?.length === 1 && filtered[0]?.msgStatus !== 3 ? (
         <IconButton style={[commonStyles.padding_10_15]} onPress={_handleReplyMessage}>
            <ReplyIcon color={themeColorPalatte.iconColor} />
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

   const makeOne2OneVideoCall = () => {
      if (!isRoomExist() && isNetworkConnected) {
         makeOne2OneCall(CALL_TYPE_VIDEO);
      } else if (!isNetworkConnected) {
         showToast('Please check your internet connection');
      } else {
         setShowRoomExist(true);
      }
   };

   const makeOne2OneAudioCall = () => {
      if (!isRoomExist() && isNetworkConnected) {
         makeOne2OneCall(CALL_TYPE_AUDIO);
      } else if (!isNetworkConnected) {
         showToast('Please check your internet connection');
      } else {
         setShowRoomExist(true);
      }
   };

   const makeOne2OneCall = async callType => {
      let isPermissionChecked = false;
      if (callType === CALL_TYPE_AUDIO) {
         isPermissionChecked = await RealmKeyValueStore.getItem('microPhone_Permission');
         RealmKeyValueStore.setItem('microPhone_Permission', 'true');
      } else {
         isPermissionChecked = await RealmKeyValueStore.getItem('camera_microPhone_Permission');
         RealmKeyValueStore.setItem('camera_microPhone_Permission', 'true');
      }
      // updating the SDK flag to keep the connection Alive when app goes background because of microphone permission popup
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
      try {
         const result =
            callType === CALL_TYPE_AUDIO ? await requestMicroPhonePermission() : await requestCameraMicPermission();
         const bluetoothPermission = await requestBluetoothConnectPermission();
         // updating the SDK flag back to false to behave as usual
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         if ((result === 'granted' || result === 'limited') && bluetoothPermission === 'granted') {
            // Checking If Room exist when user granted permission
            if (!isRoomExist()) {
               initiateMirroflyCall(callType, [userId]);
            } else {
               setShowRoomExist(true);
            }
         } else if (isPermissionChecked) {
            let cameraAndMic = await checkVideoCallPermission();
            let audioBluetoothPermission = await checkAudioCallpermission();
            let permissionStatus =
               callType === 'video'
                  ? `${cameraAndMic}${' are needed for calling. Please enable it in Settings'}`
                  : `${audioBluetoothPermission}${' are needed for calling. Please enable it in Settings'}`;
            setPermissionText(permissionStatus);
            dispatch(showPermissionModal());
         }
      } catch (error) {
         // updating the SDK flag back to false to behave as usual
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         console.log('makeOne2OneCall', error);
      }
   };

   const closeIsRoomExist = () => {
      setShowRoomExist(false);
   };
   const renderRoomExistModal = () => {
      return (
         <>
            {/* display modal already in the call */}
            <Modal visible={showRoomExist} onRequestClose={closeIsRoomExist}>
               <ModalCenteredContent onPressOutside={closeIsRoomExist}>
                  <View style={styles.callModalContentContainer}>
                     <Text style={styles.callModalContentText} numberOfLines={1}>
                        {ALREADY_ON_CALL}
                     </Text>
                     <View style={styles.callModalHorizontalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={styles.deleteModalHorizontalActionButton}
                           onPress={() => closeIsRoomExist()}>
                           <Text style={styles.deleteModalActionButtonText}>{stringSet.BUTTON_LABEL.OK_BUTTON}</Text>
                        </Pressable>
                     </View>
                  </View>
               </ModalCenteredContent>
            </Modal>
            {/* display permission Model */}
            {permissionData && (
               <Modal visible={permissionData}>
                  <ModalCenteredContent>
                     <View style={styles.callModalContentContainer}>
                        <Text style={styles.callModalContentText}>{permissionText}</Text>
                        <View style={styles.callModalHorizontalActionButtonsContainer}>
                           <Pressable
                              contentContainerStyle={styles.deleteModalHorizontalActionButton}
                              onPress={() => {
                                 openSettings();
                                 dispatch(closePermissionModal());
                              }}>
                              <Text style={styles.deleteModalActionButtonText}>{stringSet.BUTTON_LABEL.OK_BUTTON}</Text>
                           </Pressable>
                        </View>
                     </View>
                  </ModalCenteredContent>
               </Modal>
            )}
         </>
      );
   };

   const menuItems = [];

   if (filtered[0]?.msgBody?.message_type === 'text' || filtered[0]?.msgBody?.media?.caption) {
      menuItems.push({
         label: stringSet.CHAT_SCREEN.COPY_TEXT_MENU_LABEL,
         formatter: copyToClipboard(filtered, userId),
      });
   }
   if (filtered.length === 1 && isLocalUser(filtered[0]?.publisherJid)) {
      // Show Copy and Message Info options
      menuItems.push({
         label: stringSet.CHAT_SCREEN.MESSAGE_INFO_MENU_LABEL,
         formatter: handleGoMessageInfoScreen,
      });
   }
   if (!filtered.length) {
      // Show Clear Chat and Search options
      menuItems.push({
         label: 'Clear Chat',
         formatter: handleClear,
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
               {renderReplyIcon()}
               {renderDeleteIcon()}
               {renderForwardIcon()}
               {Boolean(menuItems.length) && filtered.length === 1 && <MenuContainer menuItems={menuItems} />}
               {modalContent && <AlertModal {...modalContent} />}
            </View>
            {renderRoomExistModal()}
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
               {!MIX_BARE_JID.test(chatUser) && (
                  <IconButton onPress={makeOne2OneVideoCall} containerStyle={{ marginRight: 6 }}>
                     <VideoCallIcon />
                  </IconButton>
               )}
               {!MIX_BARE_JID.test(chatUser) && (
                  <IconButton onPress={makeOne2OneAudioCall}>
                     <AudioCall />
                  </IconButton>
               )}
               {Boolean(menuItems.length) && <MenuContainer menuItems={menuItems} />}
            </View>
            {renderRoomExistModal()}
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
   deleteModalCheckboxLabel: {
      fontSize: 14,
      fontWeight: '400',
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
   callModalContentText: {
      fontSize: 16,
      fontWeight: '400',
      marginBottom: 10,
      color: ApplicationColors.black,
   },
   callModalContentContainer: {
      width: '88%',
      paddingHorizontal: 24,
      paddingTop: 18,
      fontWeight: '300',
      backgroundColor: ApplicationColors.mainbg,
   },
   callModalHorizontalActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingVertical: 14,
   },
   deleteModalHorizontalActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingVertical: 12,
   },
   deleteModalHorizontalActionButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
   },
});
