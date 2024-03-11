import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import { useDispatch, useSelector } from 'react-redux';
import { isKeyboardVisibleRef } from '../ChatApp';
import { openLocationExternally, showCheckYourInternetToast, showToast } from '../Helper';
import { uploadFileToSDK } from '../Helper/Chat/ChatHelper';
import { getThumbBase64URL, getUserIdFromJid } from '../Helper/Chat/Utility';
import { SandTimer } from '../common/Icons';
import MessagePressable from '../common/MessagePressable';
import { getConversationHistoryTime } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../constant';
import { useNetworkStatus } from '../hooks';
import useRosterData from '../hooks/useRosterData';
import AudioCard from './AudioCard';
import { isMessageSelectingRef } from './ChatConversation';
import ContactCard from './ContactCard';
import DocumentMessageCard from './DocumentMessageCard';
import ImageCard from './ImageCard';
import MapCard from './MapCard';
import TextCard from './TextCard';
import VideoCard from './VideoCard';

const ChatMessage = props => {
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const fromUserJId = useSelector(state => state.navigation.fromUserJid);
   const {
      handleRecoverMessage,
      message,
      handleReplyPress,
      shouldHighlightMessage,
      shouldSelectMessage,
      handleMsgSelect,
      showContactInviteModal,
      showNickName,
   } = props;
   let isSame = currentUserJID === message?.publisherJid;
   let statusVisible = 'notSend';
   const {
      msgBody = {},
      publisherId,
      msgBody: {
         media: { file = {}, is_uploading, thumb_image = '', local_path = '', androidWidth = 0 } = {},
         message_type,
      } = {},
      msgId,
   } = message;
   const messageWidth = androidWidth || '80%';
   const { nickName, colorCode } = useRosterData(getUserIdFromJid(publisherId));

   const navigation = useNavigation();
   const imageUrl = local_path || file?.fileDetails?.uri;
   const thumbURL = thumb_image ? getThumbBase64URL(thumb_image) : '';

   const [imgSrc, saveImage] = React.useState(thumbURL);
   const imageSize = message?.msgBody?.media?.file_size || '';
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

   switch (message?.msgStatus) {
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
      if (isSame && currentStatus === 3) {
         return <SandTimer />;
      }
      return <View style={[styles?.currentStatus, isSame ? statusVisible : '']} />;
   };

   const handleMessageObj = () => {
      if (
         ['image', 'video'].includes(message?.msgBody?.message_type) &&
         (message?.msgBody?.media?.is_downloaded === 2 || message?.msgBody?.media?.is_uploading === 2) &&
         (message?.msgBody?.media?.local_path || message?.msgBody?.media?.file?.fileDetails?.uri)
      ) {
         handleRecoverMessage();
         if (isKeyboardVisibleRef.current) {
            let hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
               navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { chatUser: fromUserJId, msgId: message.msgId });
               hideSubscription.remove();
            });
            Keyboard.dismiss();
         } else {
            navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { chatUser: fromUserJId, msgId: message.msgId });
         }
      } else if (
         message?.msgBody?.message_type === 'file' &&
         (message?.msgBody?.media?.local_path || message?.msgBody?.media?.file?.fileDetails?.uri)
      ) {
         FileViewer.open(message?.msgBody?.media?.local_path || message?.msgBody?.media?.file?.fileDetails?.uri, {
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
      } else if (message?.msgBody?.message_type === 'location') {
         if (!isInternetReachable) {
            showCheckYourInternetToast();
            return;
         }
         const { latitude = '', longitude = '' } = message.msgBody?.location || {};
         openLocationExternally(latitude, longitude);
      }
   };

   const dismissKeyBoard = () => {
      Keyboard.dismiss();
   };

   const handleMessageSelect = () => {
      dismissKeyBoard();
      if (isMessageSelectingRef.current) {
         handleMsgSelect(message);
      }
   };

   const handleMessageLongPress = () => {
      dismissKeyBoard();
      handleMsgSelect(message);
   };

   const handleContentPress = () => {
      dismissKeyBoard();
      isMessageSelectingRef.current ? handleMessageSelect() : handleMessageObj();
   };

   const handleContentLongPress = () => {
      dismissKeyBoard();
      handleMsgSelect(message);
   };

   const handleContactInvitePress = _message => {
      // Same as handleContentPress but calling showContactInviteModal function with _message as param
      dismissKeyBoard();
      isMessageSelectingRef.current ? handleMessageSelect() : showContactInviteModal(_message);
   };
   const renderMessageBasedOnType = () => {
      switch (message?.msgBody?.message_type) {
         case 'text':
            return (
               <TextCard
                  handleReplyPress={handleReplyPress}
                  isSame={isSame}
                  message={message}
                  data={{
                     message: message?.msgBody?.message,
                     timeStamp: getConversationHistoryTime(message?.createdAt),
                     status: getMessageStatus(message?.msgStatus),
                  }}
               />
            );
         case 'image':
            return (
               <ImageCard
                  handleReplyPress={handleReplyPress}
                  messageObject={message}
                  imgSrc={imgSrc}
                  isSender={isSame}
                  status={getMessageStatus(message?.msgStatus)}
                  timeStamp={getConversationHistoryTime(message?.createdAt)}
                  fileSize={fileSize}
               />
            );
         case 'video':
            return (
               <VideoCard
                  handleReplyPress={handleReplyPress}
                  messageObject={message}
                  imgSrc={imgSrc}
                  isSender={isSame}
                  status={getMessageStatus(message?.msgStatus)}
                  fileSize={fileSize}
                  timeStamp={getConversationHistoryTime(message?.createdAt)}
               />
            );
         case 'audio':
            return (
               <AudioCard
                  handleReplyPress={handleReplyPress}
                  messageObject={message}
                  isSender={isSame}
                  mediaUrl={imageUrl}
                  status={getMessageStatus(message?.msgStatus)}
                  fileSize={fileSize}
                  timeStamp={getConversationHistoryTime(message?.createdAt)}
               />
            );
         case 'file':
            return (
               <DocumentMessageCard
                  handleReplyPress={handleReplyPress}
                  message={message}
                  status={getMessageStatus(message?.msgStatus)}
                  timeStamp={getConversationHistoryTime(message?.createdAt)}
                  fileSize={fileSize}
                  isSender={isSame}
                  mediaUrl={imageUrl}
               />
            );
         case 'contact':
            return (
               <ContactCard
                  handleReplyPress={handleReplyPress}
                  message={message}
                  status={getMessageStatus(message?.msgStatus)}
                  timeStamp={getConversationHistoryTime(message?.createdAt)}
                  onInvitePress={handleContactInvitePress}
                  handleInvitetLongPress={handleContentLongPress}
                  isSender={isSame}
               />
            );
         case 'location':
            return (
               <MapCard
                  handleReplyPress={handleReplyPress}
                  message={message}
                  status={getMessageStatus(message?.msgStatus)}
                  timeStamp={getConversationHistoryTime(message?.createdAt)}
                  handleContentPress={handleContentPress}
                  handleContentLongPress={handleContentLongPress}
                  isSender={isSame}
               />
            );
      }
   };

   return (
      <Pressable
         style={
            shouldHighlightMessage && {
               backgroundColor: ApplicationColors.highlighedMessageBg,
            }
         }
         delayLongPress={300}
         pressedStyle={commonStyles.bg_transparent}
         onPress={handleMessageSelect}
         onLongPress={handleMessageLongPress}>
         {({ pressed }) => (
            <View style={[styles.messageContainer, shouldSelectMessage ? styles.highlightMessage : undefined]}>
               <View
                  style={[
                     commonStyles.paddingHorizontal_12,
                     isSame ? commonStyles.alignSelfFlexEnd : commonStyles.alignSelfFlexStart,
                  ]}>
                  <MessagePressable
                     forcePress={pressed}
                     style={[styles.messageContentPressable, { maxWidth: messageWidth }]}
                     contentContainerStyle={[
                        styles.messageCommonStyle,
                        isSame ? styles.sentMessage : styles.receivedMessage,
                     ]}
                     delayLongPress={300}
                     onPress={handleContentPress}
                     onLongPress={handleContentLongPress}>
                     {showNickName && !isSame && (
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
                     )}
                     {renderMessageBasedOnType()}
                  </MessagePressable>
               </View>
            </View>
         )}
      </Pressable>
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
});
