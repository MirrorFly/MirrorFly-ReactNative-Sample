import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Keyboard, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import { useSelector } from 'react-redux';
import { isKeyboardVisibleRef } from '../ChatApp';
import { openLocationExternally, showCheckYourInternetToast, showToast } from '../Helper';
import { isActiveChatScreenRef, uploadFileToSDK } from '../Helper/Chat/ChatHelper';
import { MIX_BARE_JID } from '../Helper/Chat/Constant';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import SDK from '../SDK/SDK';
import { SandTimer } from '../common/Icons';
import MessagePressable from '../common/MessagePressable';
import { getConversationHistoryTime } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import { INVITE_APP_URL, INVITE_SMS_CONTENT, MEDIA_POST_PRE_VIEW_SCREEN, NOTIFICATION } from '../constant';
import { useNetworkStatus } from '../hooks';
import { isSelectingMessages, useChatMessage, useSelectedChatMessage } from '../hooks/useChatMessage';
import AudioCard from './AudioCard';
import ContactCard from './ContactCard';
import DeletedMessage from './DeletedMessage';
import DocumentMessageCard from './DocumentMessageCard';
import ImageCard from './ImageCard';
import MapCard from './MapCard';
import NickName from './NickName';
import NotificationMessage from './NotificationMessage';
import TextCard from './TextCard';
import VideoCard from './VideoCard';
import AlertModal from './AlertModal';
import Clipboard from '@react-native-clipboard/clipboard';

const ChatMessage = props => {
   const xmppConnection = useSelector(state => state.connection.xmppStatus);
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const fromUserJId = useSelector(state => state.navigation.fromUserJid);
   const [modalContent, setModalContent] = React.useState(null);
   const inviteContactMessageRef = React.useRef();
   const { item, showNickName } = props;
   let statusVisible = 'notSend';
   const { msgId } = item;

   const message = useChatMessage(msgId);
   const {
      shouldHighlight = 0,
      createdAt = '',
      msgStatus,
      msgBody = {},
      publisherJid,
      deleteStatus,
      recallStatus,
      msgBody: {
         media: { file = {}, is_uploading, is_downloaded, thumb_image = '', local_path = '', androidWidth = 0 } = {},
         message_type,
         replyToMsg = 0,
      } = {},
      isSelected = 0,
   } = message;

   const isSender = currentUserJID === publisherJid;

   const messageWidth = androidWidth || '80%';
   const { updateSelectedMessage } = useSelectedChatMessage();
   const navigation = useNavigation();
   const imageUrl = local_path || file?.fileDetails?.uri;
   const thumbURL = thumb_image ? getThumbBase64URL(thumb_image) : '';

   const [imgSrc, saveImage] = React.useState(thumbURL);
   const imageSize = msgBody?.media?.file_size || '';
   const fileSize = imageSize;
   const [isSubscribed, setIsSubscribed] = React.useState(true);

   const isInternetReachable = useNetworkStatus();

   useFocusEffect(
      React.useCallback(() => {
         isActiveChatScreenRef.current = true;
         if (
            !isSender &&
            msgStatus === 1 &&
            deleteStatus === 0 &&
            recallStatus === 0 &&
            isActiveChatScreenRef.current
         ) {
            const groupJid = MIX_BARE_JID.test(fromUserJId) ? fromUserJId : '';
            SDK.sendSeenStatus(publisherJid, msgId, groupJid);
         }
      }, [xmppConnection]),
   );

   React.useEffect(() => {
      if (is_uploading === 0 || is_uploading === 1 || is_uploading === 3 || is_uploading === 7) {
         if (isImageMessage()) {
            saveImage(getThumbBase64URL(thumb_image));
         }
      } else if (is_uploading !== 0 && is_uploading !== 8) {
         if (isImageMessage()) {
            imgFileDownload();
         }
      }
      return () => setIsSubscribed(false);
   }, []);

   React.useEffect(() => {
      if (is_uploading === 1) {
         uploadFileToSDK(file, fromUserJId, msgId, msgBody?.media);
      }
   }, [is_uploading]);

   const imgFileDownload = () => {
      try {
         if (imageUrl) {
            saveImage(imageUrl);
         }
      } catch (error) {
         if (isSubscribed) {
            saveImage(getThumbBase64URL(thumb_image));
         }
      }
   };

   const isImageMessage = () => message_type === 'image';

   switch (msgStatus) {
      case 3:
         statusVisible = styles.bgClr;
         break;
      case 0:
         statusVisible = styles.notDelivered;
         break;
      case 1:
         statusVisible = styles.delivered;
         break;
      case 2:
         statusVisible = styles.seen;
         break;
   }

   const getMessageStatus = currentStatus => {
      if (isSender && currentStatus === 3) {
         return <SandTimer />;
      }
      return <View style={[styles?.currentStatus, isSender ? statusVisible : '']} />;
   };

   const handleMessageObj = () => {
      if (
         is_uploading === 2 &&
         is_downloaded === 2 &&
         (msgBody?.message_type === 'image' ||
            (msgBody?.message_type === 'video' &&
               (msgBody?.media?.local_path || msgBody?.media?.file?.fileDetails?.uri)))
      ) {
         if (isKeyboardVisibleRef.current) {
            let hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
               navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid: fromUserJId, msgId: msgId });
               hideSubscription.remove();
            });
            Keyboard.dismiss();
         } else {
            navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid: fromUserJId, msgId: msgId });
         }
      } else if (
         msgBody?.message_type === 'file' &&
         (msgBody?.media?.local_path || msgBody?.media?.file?.fileDetails?.uri)
      ) {
         FileViewer.open(msgBody?.media?.local_path || msgBody?.media?.file?.fileDetails?.uri, {
            showOpenWithDialog: true,
         })
            .then(res => {
               console.log('Document opened externally', res);
            })
            .catch(err => {
               console.log('Error while opening Document', err);
               showToast('No apps available to open this file', {
                  id: 'no-supported-app-to-open-file',
               });
            });
      } else if (msgBody?.message_type === 'location') {
         if (!isInternetReachable) {
            showCheckYourInternetToast();
            return;
         }
         const { latitude = '', longitude = '' } = msgBody?.location || {};
         openLocationExternally(latitude, longitude);
      }
   };

   const dismissKeyBoard = () => {
      Keyboard.dismiss();
   };

   const handleMessageSelect = () => {
      dismissKeyBoard();
      if (isSelectingMessages.current) {
         updateSelectedMessage(msgId);
         // handleMsgSelect(message);
      }
   };

   const handleMessageLongPress = () => {
      dismissKeyBoard();
      updateSelectedMessage(msgId);
      // handleMsgSelect(message);
   };

   const handleContentPress = () => {
      dismissKeyBoard();
      isSelectingMessages.current ? handleMessageSelect() : handleMessageObj();
   };

   const handleContentLongPress = () => {
      dismissKeyBoard();
      updateSelectedMessage(msgId);
      // handleMsgSelect(message);
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const handleCopyInviteLink = () => {
      Clipboard.setString(INVITE_APP_URL);
      showToast('Link Copied', { id: 'invite-link-copied-toast' });
   };

   const handleInviteContact = () => {
      const ContactInfo = inviteContactMessageRef.current?.msgBody?.contact;
      if (ContactInfo) {
         // open the message app and invite the user to the app with content
         const phoneNumber = ContactInfo.phone_number[0];
         const separator = Platform.OS === 'ios' ? '&' : '?';
         const url = `sms:${phoneNumber}${separator}body=${INVITE_SMS_CONTENT}`;
         Linking.openURL(url);
      }
   };

   const showContactInviteModal = () => {
      inviteContactMessageRef.current = message;
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: 'Invite Friend',
         noButton: 'Send SMS',
         noAction: handleInviteContact,
         yesButton: 'Copy Link',
         yesAction: handleCopyInviteLink,
      });
   };

   const handleContactInvitePress = _message => {
      // Same as handleContentPress but calling showContactInviteModal function with _message as param
      dismissKeyBoard();
      isSelectingMessages.current ? handleMessageSelect() : showContactInviteModal(_message);
   };
   const renderMessageBasedOnType = () => {
      switch (message_type) {
         case 'text':
            return (
               <TextCard
                  isSender={isSender}
                  message={message}
                  data={{
                     message: msgBody?.message,
                     timeStamp: getConversationHistoryTime(createdAt),
                     status: getMessageStatus(msgStatus),
                  }}
               />
            );
         case 'image':
            return (
               <ImageCard
                  messageObject={message}
                  imgSrc={imgSrc}
                  isSender={isSender}
                  status={getMessageStatus(msgStatus)}
                  timeStamp={getConversationHistoryTime(createdAt)}
                  fileSize={fileSize}
               />
            );
         case 'video':
            return (
               <VideoCard
                  messageObject={message}
                  imgSrc={imgSrc}
                  isSender={isSender}
                  status={getMessageStatus(msgStatus)}
                  fileSize={fileSize}
                  timeStamp={getConversationHistoryTime(createdAt)}
               />
            );
         case 'audio':
            return (
               <AudioCard
                  messageObject={message}
                  isSender={isSender}
                  mediaUrl={imageUrl}
                  status={getMessageStatus(msgStatus)}
                  fileSize={fileSize}
                  timeStamp={getConversationHistoryTime(createdAt)}
               />
            );
         case 'file':
            return (
               <DocumentMessageCard
                  message={message}
                  status={getMessageStatus(msgStatus)}
                  timeStamp={getConversationHistoryTime(createdAt)}
                  fileSize={fileSize}
                  isSender={isSender}
                  mediaUrl={imageUrl}
               />
            );
         case 'contact':
            return (
               <ContactCard
                  message={message}
                  status={getMessageStatus(msgStatus)}
                  timeStamp={getConversationHistoryTime(createdAt)}
                  onInvitePress={handleContactInvitePress}
                  handleInvitetLongPress={handleContentLongPress}
                  isSender={isSender}
               />
            );
         case 'location':
            return (
               <MapCard
                  message={message}
                  status={getMessageStatus(msgStatus)}
                  timeStamp={getConversationHistoryTime(createdAt)}
                  handleContentPress={handleContentPress}
                  handleContentLongPress={handleContentLongPress}
                  isSender={isSender}
               />
            );
      }
   };

   const renderChatMessage = React.useMemo(
      () => (
         <Pressable
            style={
               shouldHighlight && {
                  backgroundColor: ApplicationColors.highlighedMessageBg,
               }
            }
            delayLongPress={300}
            pressedStyle={commonStyles.bg_transparent}
            onPress={handleMessageSelect}
            onLongPress={handleMessageLongPress}>
            {({ pressed }) => (
               <View style={[styles.messageContainer, isSelected ? styles.highlightMessage : undefined]}>
                  {console.log('renderChatMessage ==>', message.msgId)}
                  <View
                     style={[
                        commonStyles.paddingHorizontal_12,
                        isSender ? commonStyles.alignSelfFlexEnd : commonStyles.alignSelfFlexStart,
                     ]}>
                     <MessagePressable
                        forcePress={pressed}
                        style={[styles.messageContentPressable, { maxWidth: messageWidth }]}
                        contentContainerStyle={[
                           styles.messageCommonStyle,
                           isSender ? styles.sentMessage : styles.receivedMessage,
                        ]}
                        delayLongPress={300}
                        onPress={handleContentPress}
                        onLongPress={handleContentLongPress}>
                        {showNickName && !isSender && (
                           <NickName style={styles.nickname} userId={item.publisherId} colorCodeRequired={true} />
                        )}
                        {renderMessageBasedOnType()}
                     </MessagePressable>
                  </View>
               </View>
            )}
         </Pressable>
      ),
      [message, local_path, shouldHighlight, msgStatus, isSelected, replyToMsg],
   );

   if (deleteStatus) {
      return null;
   }

   if (message_type === NOTIFICATION) {
      return <NotificationMessage messageObject={message} />;
   }

   if (recallStatus) {
      return <DeletedMessage messageObject={message} currentUserJID={currentUserJID} />;
   }

   return (
      <>
         {renderChatMessage}
         {modalContent && <AlertModal {...modalContent} />}
      </>
   );
};
export default React.memo(ChatMessage);

const styles = StyleSheet.create({
   currentStatus: {
      marginStart: 15,
      width: 6,
      height: 6,
      borderRadius: 3,
   },
   bgClr: {
      backgroundColor: 'red',
   },
   notDelivered: {
      backgroundColor: '#818181',
   },
   delivered: {
      backgroundColor: '#FFA500',
   },
   seen: {
      backgroundColor: '#66E824',
   },
   flex1: { flex: 1 },
   messageContainer: {
      marginBottom: 6,
   },
   highlightMessage: {
      backgroundColor: ApplicationColors.highlighedMessageBg,
   },
   messageContentPressable: {
      minWidth: '30%',
   },
   messageCommonStyle: {
      borderRadius: 10,
      overflow: 'hidden',
      borderColor: '#DDE3E5',
   },
   sentMessage: {
      backgroundColor: '#E2E8F7',
      borderWidth: 0,
      borderBottomRightRadius: 0,
   },
   receivedMessage: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderBottomLeftRadius: 0,
   },
   nickname: {
      marginLeft: 3,
      marginTop: 5,
      padding: 5,
      paddingBottom: 0,
      fontWeight: '500',
      fontSize: 13,
   },
});
