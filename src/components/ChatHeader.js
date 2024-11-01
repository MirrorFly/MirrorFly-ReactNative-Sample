import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';
import { isRoomExist, makeCalls } from '../Helper/Calls/Utility';
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
   showToast
} from '../helpers/chatHelpers';
import { ALREADY_ON_CALL, CALL_TYPE_AUDIO, CALL_TYPE_VIDEO, MIX_BARE_JID } from '../helpers/constants';
import { resetMessageSelections, setChatSearchText } from '../redux/chatMessageDataSlice';
import { setReplyMessage } from '../redux/draftSlice';
import { closePermissionModal, showPermissionModal } from '../redux/permissionSlice';
import {
   getSelectedChatMessages,
   useBlockedStatus,
   useChatMessages,
   useRecentChatData
} from '../redux/reduxHook';
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
   const [text, setText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);
   const [modalContent, setModalContent] = React.useState(null);
   const [remove, setRemove] = React.useState(false);
   const permissionData = useSelector(state => state.permissionData.permissionStatus);
   const [permissionText, setPermissionText] = React.useState('');
   const [showRoomExist, setShowRoomExist] = React.useState(false);
   const userType = useRecentChatData().find(r => r.userJid === chatUser)?.userType || '';
   const blockedStaus = useBlockedStatus(userId);

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
            title: 'Are you sure you want to delete selected Message?',
            noButton: 'CANCEL',
            yesButton: 'DELETE FOR ME',
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
               <DeleteIcon />
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
            <ForwardIcon />
         </IconButton>
      ) : null;
   };

   const _handleReplyMessage = () => {
      Keyboard.dismiss();
      dispatch(resetMessageSelections(userId));
      if (!blockedStaus) dispatch(setReplyMessage({ userId, message: filtered[0] }));
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
            <ReplyIcon />
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
               makeCalls(callType, [userId]);
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
                           <Text style={styles.deleteModalActionButtonText}>OK</Text>
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
                              <Text style={styles.deleteModalActionButtonText}>OK</Text>
                           </Pressable>
                        </View>
                     </View>
                  </ModalCenteredContent>
               </Modal>
            )}
         </>
      );
   };

   /**
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
    */

   const menuItems = [];

   if (filtered[0]?.msgBody?.message_type === 'text' || filtered[0]?.msgBody?.media?.caption) {
      menuItems.push({
         label: 'Copy',
         formatter: copyToClipboard(filtered, userId),
      });
   }

   if (filtered.length === 1 && isLocalUser(filtered[0]?.publisherJid)) {
      menuItems.push({
         label: 'Message Info',
         formatter: handleGoMessageInfoScreen,
      });
   }

   if (!filtered.length) {
      menuItems.push({
         label: 'Clear Chat',
         formatter: handleClear,
      });
   }

   /**
   if (!filtered.length && !MIX_BARE_JID.test(chatUser)) {
      menuItems.push({
         label: blockedStaus ? 'Unblock' : 'Block',
         formatter: hadleBlockUser,
      });
   } */

   const handleRoute = () => {
      if (MIX_BARE_JID.test(chatUser)) {
         navigation.navigate(GROUP_INFO, { chatUser });
      } else {
         navigation.navigate(USER_INFO, { chatUser });
      }
   };

   if (isSearching) {
      return (
         <View style={[styles.headerContainer]}>
            <IconButton onPress={toggleSearch}>
               <LeftArrowIcon />
            </IconButton>
            <TextInput
               placeholderTextColor="#d3d3d3"
               value={text}
               style={styles.textInput}
               onChangeText={setText}
               placeholder=" Search..."
               cursorColor={ApplicationColors.mainColor}
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
         <View style={styles.headerContainer}>
            <IconButton onPress={handelResetMessageSelection(userId)}>
               <CloseIcon />
            </IconButton>
            <View style={commonStyles.flex1}>
               <Text style={[commonStyles.fontSize_18, commonStyles.colorBlack, commonStyles.pl_10]}>
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
                     <Text style={styles.deleteModalContentText} numberOfLines={2}>
                        Are you sure you want to delete selected Message?
                     </Text>
                     <View style={styles.deleteModalVerticalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={handleMessageDelete(chatUser)}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR ME</Text>
                        </Pressable>
                        <Pressable contentContainerStyle={styles.deleteModalVerticalActionButton} onPress={onClose}>
                           <Text style={styles.deleteModalActionButtonText}>CANCEL</Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => {
                              onClose();
                              handleMessageDeleteForEveryOne(chatUser)();
                           }}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR EVERYONE</Text>
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
         <View style={styles.headerContainer}>
            <IconButton onPress={navigation.goBack}>
               <BackArrowIcon />
            </IconButton>
            <Pressable
               onPress={handleRoute}
               style={commonStyles.flex1}
               contentContainerStyle={styles.userAvatarAndInfoContainer}>
               <UserAvathar width={36} height={36} userId={userId} type={getUserType(chatUser)} />
               <View style={styles.userNameAndLastSeenContainer}>
                  <NickName userId={userId} style={styles.userNameText} />
                  <LastSeen userJid={chatUser} style={styles.lastSeenText} />
               </View>
            </Pressable>
            <View style={styles.iconsContainer}>
               {!MIX_BARE_JID.test(chatUser) && (
                  <IconButton
                     disabled={Boolean(blockedStaus)}
                     onPress={makeOne2OneVideoCall}
                     containerStyle={{ marginRight: 6 }}>
                     <VideoCallIcon fill={blockedStaus ? '#959595' : '#181818'} />
                  </IconButton>
               )}
               {!MIX_BARE_JID.test(chatUser) && (
                  <IconButton disabled={Boolean(blockedStaus)} onPress={makeOne2OneAudioCall}>
                     <AudioCall fill={blockedStaus ? '#959595' : '#181818'} />
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
      backgroundColor: ApplicationColors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: ApplicationColors.mainBorderColor,
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
      color: '#181818',
      fontWeight: '700',
      fontSize: 14,
      maxWidth: 170,
   },
   lastSeenText: {
      fontSize: 12,
      width: '98%',
      color: '#888888',
   },
   iconsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
   textInput: {
      flex: 1,
      color: 'black',
      fontSize: 16,
   },
   deleteModalContentContainer: {
      width: '88%',
      paddingHorizontal: 24,
      paddingVertical: 16,
      fontWeight: '300',
      backgroundColor: ApplicationColors.mainbg,
   },
   deleteModalContentText: {
      fontSize: 16,
      fontWeight: '400',
      color: ApplicationColors.modalTextColor,
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
      color: ApplicationColors.mainColor,
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
