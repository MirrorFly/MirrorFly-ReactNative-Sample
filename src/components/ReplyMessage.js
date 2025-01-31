import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import mapStaticBlurImage from '../assets/google-maps-blur.png';
import {
   AudioMusicIcon,
   CameraSmallIcon,
   ContactChatIcon,
   DocIcon,
   DocumentChatIcon,
   LocationMarkerIcon,
   PPTIcon,
   PdfIcon,
   VideoIcon,
   XLSIcon,
   ZipIcon,
} from '../common/Icons';
import NickName from '../common/NickName';
import {
   getCurrentChatUser,
   getExtension,
   getImageSource,
   getUserIdFromJid,
   handleReplyPress,
   millisToMinutesAndSeconds,
} from '../helpers/chatHelpers';
import { ORIGINAL_MESSAGE_DELETED } from '../helpers/constants';
import { toggleMessageSelection } from '../redux/chatMessageDataSlice';
import { getChatMessages, useChatMessage } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

function ReplyMessage(props) {
   const { message: originalMsg } = props;
   const { msgBody: { replyTo = '' } = {} } = originalMsg;
   const chatUser = getCurrentChatUser();
   const dispatch = useDispatch();
   const userId = getUserIdFromJid(chatUser);
   const repliedMessage = useChatMessage(userId, replyTo) || {};
   let { msgId, msgBody: { parentMessage = {} } = {} } = originalMsg;

   if (!Object.keys(parentMessage).length) {
      parentMessage = repliedMessage;
   }

   const {
      msgBody = {},
      msgBody: { message_type = '', message = '', media = {} } = {},
      deleteStatus = 0,
      recallStatus = 0,
      publisherJid = '',
   } = parentMessage;

   /**const fromUserId = React.useMemo(() => getUserIdFromJid(fromUserJId), [fromUserJId]);*/
   const publisherId = getUserIdFromJid(publisherJid);

   const isSameUser = publisherJid === getCurrentUserJid();

   const fileExtension = getExtension(media?.fileName, false);

   const renderFileIcon = React.useCallback(() => {
      switch (fileExtension) {
         case 'pdf':
            return <PdfIcon width={35} height={35} />;
         case 'ppt':
         case 'pptx':
            return <PPTIcon width={35} height={35} />;
         case 'xls':
         case 'xlsx':
         case 'csv':
            return <XLSIcon width={35} height={35} />;
         case 'doc':
         case 'docx':
            return <DocIcon width={35} height={35} />;
         case 'zip':
         case 'rar':
            return <ZipIcon width={35} height={35} />;
         case 'txt':
         case 'text':
            return <DocIcon width={35} height={35} />;
         default:
            return null;
      }
   }, [fileExtension]);

   const durationString = millisToMinutesAndSeconds(media.duration);

   const renderReplyItem = () => {
      if (message_type === 'text') {
         return (
            <View style={[styles.replyContainer, props.isSame ? styles.senderBg : styles.receiverBg]}>
               <NickName userId={publisherId} style={styles.nickNameText} />
               <Text numberOfLines={1} ellipsizeMode="tail">
                  {message}
               </Text>
            </View>
         );
      }

      if (message_type === 'image') {
         return (
            <View style={[styles.mediaReplyContainer, props.isSame ? styles.senderBg : styles.receiverBg]}>
               <NickName userId={publisherId} style={styles.nickNameText} />
               <View style={styles.mediaLeftStack}>
                  <CameraSmallIcon color={'#7285B5'} width={13} height={13} />
                  <Text style={styles.attachmentTypeText}>Photo</Text>
               </View>
               <View style={styles.miniMediaPreviewWrapper}>
                  <Image
                     alt="reply-img"
                     style={styles.miniMediaPreviewImage}
                     source={{
                        uri: `data:image/png;base64,${media?.thumb_image}`,
                     }}
                  />
               </View>
            </View>
         );
      }

      if (message_type === 'video') {
         return (
            <View style={[styles.mediaReplyContainer, props.isSame ? styles.senderBg : styles.receiverBg]}>
               <NickName userId={publisherId} style={styles.nickNameText} />

               <View style={styles.mediaLeftStack}>
                  <VideoIcon color={'#767676'} width="13" height="13" />
                  <Text style={styles.attachmentTypeText}>Video</Text>
               </View>
               <View style={styles.miniMediaPreviewWrapper}>
                  <Image
                     alt="reply-img"
                     style={styles.miniMediaPreviewImage}
                     source={{
                        uri: `data:image/png;base64,${media?.thumb_image}`,
                     }}
                  />
               </View>
            </View>
         );
      }
      if (message_type === 'audio') {
         return (
            <View style={[styles.mediaReplyContainer, props.isSame ? styles.senderBg : styles.receiverBg]}>
               <NickName userId={publisherId} style={styles.nickNameText} />

               <Text style={styles.audioDurationText}>{durationString}</Text>
               <View style={[styles.miniMediaPreviewWrapper, styles.audioMiniPreviewWrapperBg]}>
                  <AudioMusicIcon width="22" height="22" color={'#fff'} />
               </View>
            </View>
         );
      }
      if (message_type === 'file') {
         return (
            <View
               style={[
                  styles.mediaReplyContainer,
                  commonStyles.minWidth_250,
                  props.isSame ? styles.senderBg : styles.receiverBg,
               ]}>
               <NickName userId={publisherId} style={styles.nickNameText} />
               <View style={[styles.mediaLeftStack, commonStyles.paddingLeft_0]}>
                  <DocumentChatIcon width="12" height="12" color={props.isSame ? '#7285B5' : '#959595'} />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.documentFileNameText}>
                     {media?.fileName}
                  </Text>
               </View>
               <View style={styles.miniMediaPreviewWrapperForFile(isSameUser ? '#fff' : '#A9A9A9')}>
                  {renderFileIcon()}
               </View>
            </View>
         );
      }

      if (message_type === 'contact') {
         return (
            <View style={[styles.replyContainer, props.isSame ? styles.senderBg : styles.receiverBg]}>
               <NickName userId={publisherId} style={styles.nickNameText} />
               <View style={styles.mediaLeftStack}>
                  <ContactChatIcon width="12" height="12" color={props.isSame ? '#7285B5' : '#959595'} />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.attachmentTypeText}>
                     Contact: {msgBody?.contact?.name}
                  </Text>
               </View>
            </View>
         );
      }

      if (message_type === 'location') {
         return (
            <View style={[styles.locationReplyContainer, props.isSame ? styles.senderBg : styles.receiverBg]}>
               <NickName userId={publisherId} style={styles.nickNameText} />
               <View style={styles.miniPreviewImageWrapperForLocation}>
                  <Image
                     alt="location"
                     style={styles.miniMediaPreviewImage}
                     source={getImageSource(mapStaticBlurImage)}
                  />
               </View>
               <View style={[styles.mediaLeftStack, commonStyles.paddingLeft_0]}>
                  <LocationMarkerIcon color={props.isSame ? '#7285B5' : '#959595'} />
                  <Text style={styles.attachmentTypeText}>Location</Text>
               </View>
            </View>
         );
      }
   };

   const passReplyTo = () => {
      const messsageList = getChatMessages(userId);
      const isAnySelected = messsageList.some(item => item.isSelected === 1);
      if (isAnySelected) {
         const selectData = {
            chatUserId: userId,
            msgId,
         };
         dispatch(toggleMessageSelection(selectData));
      } else {
         handleReplyPress(userId, replyTo, parentMessage);
      }
   };

   const handleLongPress = () => {
      const selectData = {
         chatUserId: userId,
         msgId,
      };
      dispatch(toggleMessageSelection(selectData));
   };

   return (
      <Pressable onPress={passReplyTo} onLongPress={handleLongPress}>
         {recallStatus !== 0 || deleteStatus !== 0 || Object.keys(msgBody).length === 0 ? (
            <View style={[styles.replyContainer, props.isSame ? styles.senderBg : styles.receiverBg]}>
               <NickName userId={publisherId} style={commonStyles.fontWeight_bold} />
               <Text numberOfLines={1} ellipsizeMode="tail">
                  {ORIGINAL_MESSAGE_DELETED}
               </Text>
            </View>
         ) : (
            renderReplyItem()
         )}
      </Pressable>
   );
}

export default ReplyMessage;

const styles = StyleSheet.create({
   replyContainer: {
      marginVertical: 4,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 7,
   },
   mediaReplyContainer: {
      marginTop: 4,
      marginBottom: 4,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 7,
      position: 'relative',
      minWidth: 200,
      minHeight: 60,
   },
   locationReplyContainer: {
      marginTop: 4,
      marginBottom: 4,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 7,
      position: 'relative',
      minWidth: 180,
      minHeight: 60,
   },
   senderBg: {
      backgroundColor: '#D0D8EB',
   },
   receiverBg: {
      backgroundColor: '#EFEFEF',
   },
   nickNameText: {
      fontWeight: 'bold',
      fontSize: 14,
   },
   nickNameTextForFile: {
      width: 200,
      fontWeight: 'bold',
      fontSize: 14,
   },
   mediaLeftStack: {
      flexDirection: 'row',
      marginTop: 4,
      alignItems: 'center',
      paddingLeft: 4,
   },
   attachmentTypeText: {
      paddingLeft: 4,
      color: '#313131',
      fontSize: 14,
      fontWeight: '400',
   },
   audioDurationText: {
      marginTop: 4,
      color: '#313131',
      fontSize: 14,
      fontWeight: '400',
   },
   miniMediaPreviewWrapper: {
      width: 60,
      height: 60,
      position: 'absolute',
      right: 0,
      borderBottomRightRadius: 5,
      borderTopRightRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
   },
   miniMediaPreviewWrapperForFile: bgColor => ({
      width: 60,
      height: 60,
      position: 'absolute',
      right: 0,
      backgroundColor: bgColor,
      borderBottomRightRadius: 5,
      borderTopRightRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
   }),
   miniPreviewImageWrapperForLocation: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
   },
   audioMiniPreviewWrapperBg: {
      backgroundColor: '#97A5C7',
   },
   miniMediaPreviewImage: {
      width: 60,
      height: 60,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
      resizeMode: 'cover',
   },
   fileNameText: {
      width: 200,
      paddingLeft: 4,
      color: '#313131',
      fontSize: 14,
      fontWeight: '400',
   },
   documentFileNameText: {
      width: 165,
      paddingLeft: 4,
      color: '#313131',
      fontSize: 12,
      fontWeight: '400',
   },
});
