import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Checkbox } from 'native-base';
import React, { useRef } from 'react';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';
import { ALREADY_ON_CALL, CALL_TYPE_AUDIO, CALL_TYPE_VIDEO } from '../Helper/Calls/Constant';
import { isRoomExist, makeCalls } from '../Helper/Calls/Utility';
import { CHAT_TYPE_GROUP, CHAT_TYPE_SINGLE, MIX_BARE_JID } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { showToast } from '../Helper/index';
import SDK from '../SDK/SDK';
import Avathar from '../common/Avathar';
import IconButton from '../common/IconButton';
import {
   AudioCall,
   CloseIcon,
   DeleteIcon,
   DownArrowIcon,
   ForwardIcon,
   LeftArrowIcon,
   ReplyIcon,
   UpArrowIcon,
   VideoCallIcon,
} from '../common/Icons';
import MenuContainer from '../common/MenuContainer';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import {
   checkMicroPhonePermission,
   checkVideoPermission,
   requestBluetoothConnectPermission,
   requestCameraMicPermission,
   requestMicroPhonePermission,
} from '../common/utils';
import ApplicationColors from '../config/appColors';
import { FORWARD_MESSSAGE_SCREEN, GROUP_INFO, MESSAGE_INFO_SCREEN, USER_INFO } from '../constant';
import { useNetworkStatus } from '../hooks';
import {
   copyToClipboard,
   resetMessageSelection,
   selectedMediaIdRef,
   useSelectedChatMessage,
} from '../hooks/useChatMessage';
import useRosterData from '../hooks/useRosterData';
import { closePermissionModal, showPermissionModal } from '../redux/Actions/PermissionAction';
import {
   clearConversationSearchData,
   setConversationSearchText,
   updateConversationSearchMessageIndex,
} from '../redux/Actions/conversationSearchAction';
import { chatInputRef } from './ChatInput';
import ChatSearchInput from './ChatSearchInput';
import LastSeen from './LastSeen';
import NickName from './NickName';
import AlertModal from './AlertModal';
import { clearLastMessageinRecentChat } from '../redux/Actions/RecentChatAction';
import { ClearChatHistoryAction } from '../redux/Actions/ConversationAction';

function ChatHeader({ fromUserJId, handleBackBtn, handleReply, IsSearching, isSearchClose, chatUserProfile }) {
   const navigation = useNavigation();
   const { selectedMessagesArray, resetSelectedChatMessage } = useSelectedChatMessage();
   const chatType = MIX_BARE_JID.test(fromUserJId) ? CHAT_TYPE_GROUP : CHAT_TYPE_SINGLE;
   const recentChatList = useSelector(state => state.recentChatData.data || []);
   const userType = recentChatList.find(r => r.fromUserJid === fromUserJId)?.userType || '';
   const isNetworkConnected = useNetworkStatus();
   const [remove, setRemove] = React.useState(false);
   const [deleteEveryOne, setDeleteEveryOne] = React.useState(false);
   const profileDetails = useSelector(state => state.navigation.profileDetails);
   const vCardProfile = useSelector(state => state.profile.profileDetails);
   const permissionData = useSelector(state => state.permissionData.permissionStatus);
   const [isSelected, setSelection] = React.useState(false);
   const [showRoomExist, setShowRoomExist] = React.useState(false);
   const [permissionText, setPermissionText] = React.useState('');
   const {
      searchText: conversationSearchText,
      messageIndex: conversationSearchMessageIndex,
      totalSearchResults: conversationSearchTotalSearchResults,
   } = useSelector(state => state?.conversationSearchData) || {};
   const dispatch = useDispatch();
   const searchInputRef = useRef();
   const isMediaFileInSelectedMessageForDelete = useRef(false);
   const [modalContent, setModalContent] = React.useState(null);

   React.useEffect(() => {
      return () => {
         dispatch(clearConversationSearchData());
      };
   }, []);

   React.useEffect(() => {
      if (IsSearching) {
         // focusing the input with setTimeout to focus to avoid some strange issue in react native
         setTimeout(() => {
            searchInputRef.current?.focus();
         }, 200);
      }
   }, [IsSearching]);

   const fromUserId = React.useMemo(() => getUserIdFromJid(fromUserJId), [fromUserJId]);

   let { nickName, image: profileImage, colorCode } = useRosterData(fromUserId);
   // updating default values
   nickName = nickName || chatUserProfile?.nickName || fromUserId || '';
   profileImage = profileImage || '';
   colorCode = colorCode || profileDetails?.colorCode;

   const onClose = () => {
      setRemove(false);
   };

   const handleDelete = () => {
      Keyboard.dismiss();
      isMediaFileInSelectedMessageForDelete.current = selectedMessagesArray.some(msg => {
         const { recallStatus, msgBody: { media: { file = {}, local_path = '' } = {} } = {} } = msg;
         return Boolean((local_path || file?.fileDetails?.uri) && recallStatus === 0);
      });
      const now = new Date().getTime();
      const msgSentLessThan30SecondsAgo = selectedMessagesArray.every(
         msg => msg.recallStatus === 0 && parseInt(msg.timestamp / 1000, 10) + 30 * 1000 > now,
      );
      const isSender = selectedMessagesArray.every(
         msg => msg.publisherId === vCardProfile.userId && msg.deleteStatus === 0,
      );
      setDeleteEveryOne(msgSentLessThan30SecondsAgo && isSender);
      setRemove(!remove);
   };

   const handleDeleteForMe = async deleteType => {
      let msgIds = selectedMessagesArray
         .slice()
         .sort((a, b) => (b.timestamp > a.timestamp ? -1 : 1))
         .map(el => el.msgId);
      const jid = fromUserJId;
      if (deleteType === 1) {
         SDK.deleteMessagesForMe(jid, msgIds);
      } else {
         SDK.deleteMessagesForEveryone(jid, msgIds);
      }
      selectedMediaIdRef.current = {};
      resetMessageSelection();
      setRemove(false);
   };

   const handleFavourite = () => {
      Keyboard.dismiss();
      console.log('Fav item');
   };

   const clearChat = () => {
      SDK.clearChat(fromUserJId);
      dispatch(clearLastMessageinRecentChat(getUserIdFromJid(fromUserJId)));
      dispatch(ClearChatHistoryAction(getUserIdFromJid(fromUserJId)));
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const toggleConfirmUserRemoveModal = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: 'Are you sure you want to clear the chat?',
         noButton: 'No',
         yesButton: 'Yes',
         yesAction: clearChat,
      });
   };

   const handleReplyMessage = () => {
      handleReply(selectedMessagesArray[0]);
      resetSelectedChatMessage();
      chatInputRef?.current?.focus?.();
   };

   const handleUserInfo = () => {
      if (MIX_BARE_JID.test(fromUserJId)) {
         navigation.navigate(GROUP_INFO, { chatUser: fromUserJId });
      } else {
         navigation.navigate(USER_INFO, { chatUser: fromUserJId });
      }
   };

   const handleBackSearch = () => {
      isSearchClose();
      dispatch(clearConversationSearchData());
   };
   const handleForwardMessage = () => {
      Keyboard.dismiss();
      navigation.navigate(FORWARD_MESSSAGE_SCREEN, {
         forwardMessages: selectedMessagesArray,
         onMessageForwaded: resetSelectedChatMessage,
      });
   };
   const handleSearchTextChange = text => {
      dispatch(setConversationSearchText(text));
   };

   const renderForwardIcon = () => {
      const isMediaDownloadedOrUploaded = selectedMessagesArray.every(
         msg => (msg.msgBody?.media?.is_uploading !== 1 || true) && (msg.msgBody?.media?.is_downloaded !== 1 || true),
      );

      const isAllowForward = selectedMessagesArray.every(
         _message => _message?.msgStatus !== 3 && _message?.deleteStatus === 0 && _message?.recallStatus === 0,
      );

      return isMediaDownloadedOrUploaded && isAllowForward ? (
         <IconButton style={[commonStyles.padding_10_15]} onPress={handleForwardMessage}>
            <ForwardIcon />
         </IconButton>
      ) : null;
   };

   const renderReplyIcon = () => {
      const isAllowReply = MIX_BARE_JID.test(fromUserJId)
         ? userType && selectedMessagesArray[0]?.msgBody?.media?.is_uploading !== 1 && !selectedMessagesArray[0]?.recall
         : selectedMessagesArray[0]?.msgBody?.media?.is_uploading !== 1 && !selectedMessagesArray[0]?.recall;
      return isAllowReply ? (
         <IconButton style={[commonStyles.padding_10_15]} onPress={handleReplyMessage}>
            {selectedMessagesArray?.length === 1 && selectedMessagesArray[0]?.msgStatus !== 3 && <ReplyIcon />}
         </IconButton>
      ) : null;
   };

   const renderDeleteIcon = () => {
      const isMediaDownloadedOrUploaded = selectedMessagesArray.every(
         msg => (msg.msgBody?.media?.is_uploading !== 1 || true) && (msg.msgBody?.media?.is_downloaded !== 1 || true),
      );
      return isMediaDownloadedOrUploaded ? (
         <IconButton style={[commonStyles.padding_10_15]} onPress={handleDelete}>
            <DeleteIcon />
         </IconButton>
      ) : null;
   };

   const showNoMessageFoundToast = () => {
      const toastConfig = {
         id: 'conversation-search-no-message-found-toast',
      };
      showToast('No results found', toastConfig);
   };

   const handleMessageSearchIndexGoUp = () => {
      if (conversationSearchMessageIndex + 1 < conversationSearchTotalSearchResults) {
         dispatch(updateConversationSearchMessageIndex(conversationSearchMessageIndex + 1));
      } else {
         conversationSearchText.trim() && showNoMessageFoundToast();
      }
   };

   const handleMessageSearchIndexGoDown = () => {
      if (conversationSearchMessageIndex > 0) {
         dispatch(updateConversationSearchMessageIndex(conversationSearchMessageIndex - 1));
      } else {
         conversationSearchText.trim() && showNoMessageFoundToast();
      }
   };

   const makeOne2OneVideoCall = () => {
      if (!isRoomExist() && isNetworkConnected) {
         makeOne2OneCall(CALL_TYPE_VIDEO);
      } else if (!isNetworkConnected) {
         showToast('Please check your internet connection', {
            id: 'Network_error',
         });
      } else {
         setShowRoomExist(true);
      }
   };

   const makeOne2OneAudioCall = () => {
      if (!isRoomExist() && isNetworkConnected) {
         makeOne2OneCall(CALL_TYPE_AUDIO);
      } else if (!isNetworkConnected) {
         showToast('Please check your internet connection', {
            id: 'Network_error',
         });
      } else {
         setShowRoomExist(true);
      }
   };

   const makeOne2OneCall = async callType => {
      let isPermissionChecked = false;
      if (callType === CALL_TYPE_AUDIO) {
         isPermissionChecked = await AsyncStorage.getItem('microPhone_Permission');
         AsyncStorage.setItem('microPhone_Permission', 'true');
      } else {
         isPermissionChecked = await AsyncStorage.getItem('camera_microPhone_Permission');
         AsyncStorage.setItem('camera_microPhone_Permission', 'true');
      }
      // updating the SDK flag to keep the connection Alive when app goes background because of microphone permission popup
      SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
      try {
         const result =
            callType === CALL_TYPE_AUDIO ? await requestMicroPhonePermission() : await requestCameraMicPermission();
         // updating the SDK flag back to false to behave as usual
         await requestBluetoothConnectPermission();
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         if (result === 'granted' || result === 'limited') {
            // Checking If Room exist when user granted permission
            if (!isRoomExist()) {
               makeCalls(callType, [fromUserId]);
            } else {
               setShowRoomExist(true);
            }
         } else if (isPermissionChecked) {
            let cameraAndMic =
               (await checkVideoPermission()) !== 'granted' && (await checkMicroPhonePermission()) !== 'granted'
                  ? 'Audio and Video Permissions'
                  : (await checkVideoPermission()) !== 'granted'
                  ? 'Video Permission'
                  : (await checkMicroPhonePermission()) !== 'granted'
                  ? 'Audio Permission'
                  : '';
            let permissionStatus =
               callType === 'video'
                  ? `${cameraAndMic}${' are needed for calling. Please enable it in Settings'}`
                  : 'Audio Permissions are needed for calling. Please enable it in Settings';
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

   const handleGoMessageInfoScreen = () => {
      resetSelectedChatMessage();
      navigation.navigate(MESSAGE_INFO_SCREEN, { chatUser: fromUserJId, msgId: selectedMessagesArray[0].msgId });
   };

   let menuItems = [];

   if (
      selectedMessagesArray[0]?.msgBody?.message_type === 'text' ||
      selectedMessagesArray[0]?.msgBody?.media?.caption
   ) {
      menuItems.push({
         label: 'Copy',
         formatter: copyToClipboard(selectedMessagesArray),
      });
   }
   if (selectedMessagesArray.length === 1) {
      // Show Copy and Message Info options
      menuItems.push({
         label: 'Message Info',
         formatter: handleGoMessageInfoScreen,
      });
   }
   if (!selectedMessagesArray.length) {
      // Show Clear Chat and Search options
      menuItems.push({
         label: 'Clear Chat',
         formatter: toggleConfirmUserRemoveModal,
      });
   }

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
         </>
      );
   };

   if (IsSearching) {
      return (
         <View style={styles.RootContainer}>
            <IconButton onPress={handleBackSearch}>{LeftArrowIcon()}</IconButton>
            <View style={styles.TextInput}>
               <ChatSearchInput
                  inputRef={searchInputRef}
                  placeholder=" Search..."
                  value={conversationSearchText}
                  onChangeText={handleSearchTextChange}
                  cursorColor={ApplicationColors.mainColor}
                  style={styles.chatSearchInput}
               />
            </View>
            <TouchableOpacity onPress={handleMessageSearchIndexGoUp} style={styles.upAndDownArrow}>
               <UpArrowIcon />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMessageSearchIndexGoDown} style={styles.upAndDownArrow}>
               <DownArrowIcon width={15} height={7} />
            </TouchableOpacity>
         </View>
      );
   }

   return (
      <>
         {selectedMessagesArray.length === 0 ? (
            <View style={styles.headerContainer}>
               <IconButton onPress={handleBackBtn}>{LeftArrowIcon()}</IconButton>
               <Pressable
                  onPress={handleUserInfo}
                  style={commonStyles.flex1}
                  contentContainerStyle={styles.userAvatharAndInfoContainer}>
                  <Avathar
                     type={chatType}
                     width={36}
                     height={36}
                     backgroundColor={colorCode}
                     data={nickName}
                     profileImage={profileImage}
                  />
                  <View style={styles.userNameAndLastSeenContainer}>
                     <NickName
                        style={styles.userNameText}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        userId={getUserIdFromJid(fromUserJId)}
                     />
                     <LastSeen jid={fromUserJId} />
                  </View>
               </Pressable>
               {chatType !== CHAT_TYPE_GROUP && (
                  <View style={styles.audioCallButton}>
                     <IconButton onPress={makeOne2OneVideoCall} containerStyle={{ marginRight: 6 }}>
                        <VideoCallIcon />
                     </IconButton>
                     <IconButton onPress={makeOne2OneAudioCall}>
                        <AudioCall />
                     </IconButton>
                  </View>
               )}
               {menuItems.length > 0 && (
                  <View style={commonStyles.pr_10}>
                     <MenuContainer menuItems={menuItems} />
                  </View>
               )}
            </View>
         ) : (
            <View style={styles.subContainer}>
               <View style={styles.selectedMsgsTextContainer}>
                  <IconButton onPress={resetSelectedChatMessage}>
                     <CloseIcon />
                  </IconButton>
                  <Text style={styles.selectedMsgsText}>{selectedMessagesArray?.length}</Text>
               </View>
               <View style={styles.selectedMsgsActionsContainer}>
                  {renderReplyIcon()}
                  {renderDeleteIcon()}
                  {renderForwardIcon()}
                  {menuItems.length > 0 && (
                     <View style={commonStyles.pr_10}>
                        <MenuContainer menuItems={menuItems} />
                     </View>
                  )}
                  {/* {renderForwardIcon()}
                  {!selectedMsgs[0]?.recall && (
                     <IconButton style={[commonStyles.padding_10_15]} onPress={handleFavourite}>
                        <FavouriteIcon />
                     </IconButton>
                  )}
                  {renderDeleteIcon()}
                  {Object.keys(selectedChatMessages).length === 1 &&
                     menuItems.length > 0 &&
                     !selectedMsgs[0]?.recall && <MenuContainer menuItems={menuItems} />} */}
               </View>
            </View>
         )}
         {modalContent && <AlertModal {...modalContent} />}
         <Modal visible={remove} onRequestClose={onClose}>
            <ModalCenteredContent onPressOutside={onClose}>
               <View style={styles.deleteModalContentContainer}>
                  <Text style={styles.deleteModalContentText} numberOfLines={2}>
                     Are you sure you want to delete selected Message?
                  </Text>
                  {isMediaFileInSelectedMessageForDelete.current === true && (
                     <View style={[commonStyles.hstack, commonStyles.paddingVertical_12]}>
                        <Checkbox
                           value={isSelected}
                           onValueChange={setSelection}
                           style={styles.checkbox}
                           _checked={{
                              backgroundColor: '#3276E2',
                              borderColor: '#3276E2',
                           }}
                           _pressed={{
                              backgroundColor: '#3276E2',
                              borderColor: '#3276E2',
                           }}>
                           <Text style={styles.deleteModalCheckboxLabel}>Delete media from my phone</Text>
                        </Checkbox>
                     </View>
                  )}
                  {deleteEveryOne ? (
                     <View style={styles.deleteModalVerticalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => handleDeleteForMe(1)}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR ME</Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => setRemove(false)}>
                           <Text style={styles.deleteModalActionButtonText}>CANCEL</Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => handleDeleteForMe(2)}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR EVERYONE</Text>
                        </Pressable>
                     </View>
                  ) : (
                     <View style={styles.deleteModalHorizontalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={[
                              styles.deleteModalHorizontalActionButton,
                              commonStyles.marginRight_16,
                           ]}
                           onPress={() => setRemove(false)}>
                           <Text style={styles.deleteModalActionButtonText}>CANCEL</Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalHorizontalActionButton}
                           onPress={() => handleDeleteForMe(1)}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR ME</Text>
                        </Pressable>
                     </View>
                  )}
               </View>
            </ModalCenteredContent>
         </Modal>
         {/* {selectedMsgs?.length <= 0 ? (
            <View style={styles.headerContainer}>
               <IconButton onPress={handleBackBtn}>{LeftArrowIcon()}</IconButton>
               <Pressable
                  onPress={handleUserInfo}
                  style={commonStyles.flex1}
                  contentContainerStyle={styles.userAvatharAndInfoContainer}>
                  <Avathar
                     type={chatType}
                     width={36}
                     height={36}
                     backgroundColor={colorCode}
                     data={nickName}
                     profileImage={profileImage}
                  />
                  <View style={styles.userNameAndLastSeenContainer}>
                     <Text style={styles.userNameText} ellipsizeMode="tail" numberOfLines={1}>
                        {nickName}
                     </Text>
                     <LastSeen jid={fromUserJId} />
                  </View>
               </Pressable>
               {chatType !== CHAT_TYPE_GROUP && (
                  <View style={styles.audioCallButton}>
                     <IconButton onPress={makeOne2OneVideoCall} containerStyle={{ marginRight: 6 }}>
                        <VideoCallIcon />
                     </IconButton>
                     <IconButton onPress={makeOne2OneAudioCall}>
                        <AudioCall />
                     </IconButton>
                  </View>
               )}
               <View style={styles.menuIconContainer}>
                  {selectedMsgs?.length < 2 && menuItems.length > 0 && <MenuContainer menuItems={menuItems} />}
               </View>
            </View>
         ) : (
            <View style={styles.subContainer}>
               <View style={styles.selectedMsgsTextContainer}>
                  <IconButton onPress={handleRemove}>
                     <CloseIcon />
                  </IconButton>
                  <Text style={styles.selectedMsgsText}>{selectedMsgs?.length}</Text>
               </View>
               <View style={styles.selectedMsgsActionsContainer}>
                  {renderReplyIcon()}
                  {renderForwardIcon()}
                  {!selectedMsgs[0]?.recall && (
                     <IconButton style={[commonStyles.padding_10_15]} onPress={handleFavourite}>
                        <FavouriteIcon />
                     </IconButton>
                  )}
                  {renderDeleteIcon()}
                  {selectedMsgs?.length === 1 && menuItems.length > 0 && !selectedMsgs[0]?.recall && (
                     <MenuContainer menuItems={menuItems} />
                  )}
               </View>
            </View>
         )}
         {renderRoomExistModal()}
         <Modal visible={remove} onRequestClose={onClose}>
            <ModalCenteredContent onPressOutside={onClose}>
               <View style={styles.deleteModalContentContainer}>
                  <Text style={styles.deleteModalContentText} numberOfLines={2}>
                     Are you sure you want to delete selected Message?
                  </Text>
                  {isMediaFileInSelectedMessageForDelete.current === true && (
                     <View style={[commonStyles.hstack, commonStyles.paddingVertical_12]}>
                        <Checkbox
                           value={isSelected}
                           onValueChange={setSelection}
                           style={styles.checkbox}
                           _checked={{
                              backgroundColor: '#3276E2',
                              borderColor: '#3276E2',
                           }}
                           _pressed={{
                              backgroundColor: '#3276E2',
                              borderColor: '#3276E2',
                           }}>
                           <Text style={styles.deleteModalCheckboxLabel}>Delete media from my phone</Text>
                        </Checkbox>
                     </View>
                  )}
                  {deleteEveryOne ? (
                     <View style={styles.deleteModalVerticalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => handleDeleteForMe(1)}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR ME</Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => setRemove(false)}>
                           <Text style={styles.deleteModalActionButtonText}>CANCEL</Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalVerticalActionButton}
                           onPress={() => handleDeleteForMe(2)}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR EVERYONE</Text>
                        </Pressable>
                     </View>
                  ) : (
                     <View style={styles.deleteModalHorizontalActionButtonsContainer}>
                        <Pressable
                           contentContainerStyle={[
                              styles.deleteModalHorizontalActionButton,
                              commonStyles.marginRight_16,
                           ]}
                           onPress={() => setRemove(false)}>
                           <Text style={styles.deleteModalActionButtonText}>CANCEL</Text>
                        </Pressable>
                        <Pressable
                           contentContainerStyle={styles.deleteModalHorizontalActionButton}
                           onPress={() => handleDeleteForMe(1)}>
                           <Text style={styles.deleteModalActionButtonText}>DELETE FOR ME</Text>
                        </Pressable>
                     </View>
                  )}
               </View>
            </ModalCenteredContent>
         </Modal> */}
      </>
   );
}

export default ChatHeader;

const styles = StyleSheet.create({
   checkbox: {
      alignSelf: 'center',
      borderColor: '#3276E2',
   },
   headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
   },
   RootContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: 60,
      backgroundColor: '#F2F2F2',
      borderBottomColor: ApplicationColors.mainBorderColor,
      borderBottomWidth: 1,
      elevation: 2,
      shadowColor: '#181818',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
   },
   subContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 13,
      backgroundColor: ApplicationColors.headerBg,
      elevation: 2,
      shadowColor: '#181818',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
   },
   TextInput: { flex: 1, marginLeft: 12 },
   upAndDownArrow: {
      marginHorizontal: 5,
      paddingVertical: 15,
      paddingHorizontal: 14,
      borderRadius: 50,
   },
   chatSearchInput: {
      fontSize: 17,
      fontWeight: '400',
      borderBottomWidth: 1,
      borderBottomColor: ApplicationColors.mainBorderColor,
   },
   userAvatharAndInfoContainer: {
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
   },
   userNameAndLastSeenContainer: {
      justifyItems: 'center',
      paddingRight: 16,
      paddingLeft: 8,
      paddingVertical: 12,
   },
   userNameText: {
      color: '#181818',
      fontWeight: '700',
      fontSize: 14,
      maxWidth: 170,
   },
   menuIconContainer: {
      paddingRight: 12,
   },
   selectedMsgsTextContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   selectedMsgsText: {
      marginLeft: 30,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '400',
   },
   selectedMsgsActionsContainer: {
      // backgroundColor: 'salmon',
      flex: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
   deleteModalHorizontalActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingVertical: 12,
   },
   deleteModalHorizontalActionButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
   },
   audioCallButton: {
      padding: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
});
