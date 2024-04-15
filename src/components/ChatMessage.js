import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import { useSelector } from 'react-redux';
import { isKeyboardVisibleRef } from '../ChatApp';
import { openLocationExternally, showCheckYourInternetToast, showToast } from '../Helper';
import { uploadFileToSDK } from '../Helper/Chat/ChatHelper';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import { SandTimer } from '../common/Icons';
import MessagePressable from '../common/MessagePressable';
import { getConversationHistoryTime } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../constant';
import { useNetworkStatus } from '../hooks';
import { isSelectingMessages, useChatMessage, useSelectedChatMessage } from '../hooks/useChatMessage';
import AudioCard from './AudioCard';
import ContactCard from './ContactCard';
import DocumentMessageCard from './DocumentMessageCard';
import ImageCard from './ImageCard';
import MapCard from './MapCard';
import TextCard from './TextCard';
import VideoCard from './VideoCard';

const ChatMessage = props => {
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const fromUserJId = useSelector(state => state.navigation.fromUserJid);
   const { item } = props;
   let statusVisible = 'notSend';
   const { msgId } = item;

   const message = useChatMessage(msgId);
   const {
      createdAt = '',
      msgStatus,
      msgBody = {},
      publisherJid,
      msgBody: {
         media: { file = {}, is_uploading, thumb_image = '', local_path = '', androidWidth = 0 } = {},
         message_type,
      } = {},
      isSelected = 0,
   } = message;

   let isSender = currentUserJID === publisherJid;

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
         ['image', 'video'].includes(msgBody?.message_type) &&
         msgBody?.media?.is_downloaded === 2 &&
         msgBody?.media?.is_uploading === 2 &&
         (msgBody?.media?.local_path || msgBody?.media?.file?.fileDetails?.uri)
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
                  // handleReplyPress={handleReplyPress}
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
                  // handleReplyPress={handleReplyPress}
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
                  // handleReplyPress={handleReplyPress}
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
                  // handleReplyPress={handleReplyPress}
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
                  // handleReplyPress={handleReplyPress}
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
                  // handleReplyPress={handleReplyPress}
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
                  // handleReplyPress={handleReplyPress}
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
            delayLongPress={300}
            pressedStyle={commonStyles.bg_transparent}
            onPress={handleMessageSelect}
            onLongPress={handleMessageLongPress}>
            {({ pressed }) => (
               <View style={[styles.messageContainer, isSelected ? styles.highlightMessage : undefined]}>
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
                        {/* {showNickName && !isSender && (
                        <Text
                           style={{
                              color: colorCode,
                              marginLeft: 3,
                              marginTop: 5,
                              padding: 5,
                              paddingBottom: 0,
                              fontWeight: '500',
                              fontSize: 13,
                           }}>
                           {nickName}
                        </Text>
                     )} */}
                        {renderMessageBasedOnType()}
                     </MessagePressable>
                  </View>
               </View>
            )}
         </Pressable>
      ),
      [message, isSelected],
   );

   return <>{renderChatMessage}</>;
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
});
