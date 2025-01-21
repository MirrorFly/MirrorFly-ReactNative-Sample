import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
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
   TXTIcon,
   VideoIcon,
   XLSIcon,
   ZipIcon,
} from '../common/Icons';
import NickName from '../common/NickName';
import Text from '../common/Text';
import {
   getCurrentChatUser,
   getExtension,
   getImageSource,
   getUserIdFromJid,
   handleReplyPress,
   millisToHoursMinutesAndSeconds,
} from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { toggleMessageSelection } from '../redux/chatMessageDataSlice';
import { getChatMessages, useParentMessage, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

function ReplyMessage(props) {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const { message: originalMsg, isSender } = props;
   const { msgBody: { replyTo = '' } = {} } = originalMsg;
   const chatUser = getCurrentChatUser();
   const dispatch = useDispatch();
   const userId = getUserIdFromJid(chatUser);
   const repliedMessage = useParentMessage(replyTo);
   let { msgId } = originalMsg;

   const {
      msgBody = {},
      msgBody: { message_type = '', message = '', media = {}, } = {},
      deleteStatus = 0,
      recallStatus = 0,
      publisherJid = '',
   } = repliedMessage || {};

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
            return <TXTIcon width={35} height={35} />;
         default:
            return null;
      }
   }, [fileExtension]);

   const durationString = millisToHoursMinutesAndSeconds(media.duration);

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
         handleReplyPress(userId, replyTo, repliedMessage);
      }
   };

   const handleLongPress = () => {
      const selectData = {
         chatUserId: userId,
         msgId,
      };
      dispatch(toggleMessageSelection(selectData));
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
         handleReplyPress(userId, replyTo, repliedMessage);
      }
   };

   const handleLongPress = () => {
      const selectData = {
         chatUserId: userId,
         msgId,
      };
      dispatch(toggleMessageSelection(selectData));
   };

   const renderReplyItem = () => {
      if (message_type === 'text') {
         return (
            <View
               style={[
                  styles.replyContainer,
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />
               <Text
                  style={commonStyles.textColor(
                     isSender
                        ? themeColorPalatte.chatSenderPrimaryTextColor
                        : themeColorPalatte.chatReceiverPrimaryTextColor,
                  )}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {message}
               </Text>
            </View>
         );
      }

      if (message_type === 'image') {
         return (
            <View
               style={[
                  styles.mediaReplyContainer,
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />
               <View style={styles.mediaLeftStack}>
                  <CameraSmallIcon color={'#7285B5'} width={13} height={13} />
                  <Text
                     style={[
                        styles.attachmentTypeText,
                        commonStyles.textColor(
                           isSender
                              ? themeColorPalatte.chatSenderPrimaryTextColor
                              : themeColorPalatte.chatReceiverPrimaryTextColor,
                        ),
                     ]}>
                     {' '}
                     {stringSet.COMMON_TEXT.PHOTO_LABEL}
                  </Text>
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
            <View
               style={[
                  styles.mediaReplyContainer,
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />

               <View style={styles.mediaLeftStack}>
                  <VideoIcon color={themeColorPalatte.secondaryTextColor} width="13" height="13" />
                  <Text
                     style={[
                        styles.attachmentTypeText,
                        commonStyles.textColor(
                           isSender
                              ? themeColorPalatte.chatSenderPrimaryTextColor
                              : themeColorPalatte.chatReceiverPrimaryTextColor,
                        ),
                     ]}>
                     {stringSet.COMMON_TEXT.VIDEO_MSG_TYPE}
                  </Text>
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
            <View
               style={[
                  styles.mediaReplyContainer,
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />
               <Text
                  style={[
                     styles.audioDurationText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}>
                  {durationString}
               </Text>
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
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />
               <View style={[styles.mediaLeftStack, commonStyles.paddingLeft_0]}>
                  <DocumentChatIcon width="12" height="12" color={isSender ? '#7285B5' : '#959595'} />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.documentFileNameText}>
                     {media?.fileName}
                  </Text>
               </View>
               <View
                  style={[
                     styles.miniMediaPreviewWrapperForFile,
                     commonStyles.bg_color(isSameUser ? '#fff' : '#A9A9A9'),
                  ]}>
                  {renderFileIcon()}
               </View>
            </View>
         );
      }

      if (message_type === 'contact') {
         return (
            <View
               style={[
                  styles.replyContainer,
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />
               <View style={styles.mediaLeftStack}>
                  <ContactChatIcon width="12" height="12" color={isSender ? '#7285B5' : '#959595'} />
                  <Text
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[
                        styles.attachmentTypeText,
                        commonStyles.textColor(
                           isSender
                              ? themeColorPalatte.chatSenderPrimaryTextColor
                              : themeColorPalatte.chatReceiverPrimaryTextColor,
                        ),
                     ]}>
                     {stringSet.CHAT_SCREEN.REPLY_CONTACT_TYPE.replace('{nickName}', msgBody?.contact?.name)}
                  </Text>
               </View>
            </View>
         );
      }

      if (message_type === 'location') {
         return (
            <View
               style={[
                  styles.locationReplyContainer,
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />
               <View style={styles.miniPreviewImageWrapperForLocation}>
                  <Image
                     alt="location"
                     style={styles.miniMediaPreviewImage}
                     source={getImageSource(mapStaticBlurImage)}
                  />
               </View>
               <View style={[styles.mediaLeftStack, commonStyles.paddingLeft_0]}>
                  <LocationMarkerIcon color={isSender ? '#7285B5' : '#959595'} />
                  <Text
                     style={[
                        styles.attachmentTypeText,
                        commonStyles.textColor(
                           isSender
                              ? themeColorPalatte.chatSenderPrimaryTextColor
                              : themeColorPalatte.chatReceiverPrimaryTextColor,
                        ),
                     ]}>
                     {stringSet.COMMON_TEXT.LOCATION_MSG_TYPE}
                  </Text>
               </View>
            </View>
         );
      }
   };

   return (
      <Pressable onPress={passReplyTo} onLongPress={handleLongPress}>
         {recallStatus !== 0 || deleteStatus !== 0 || Object.keys(msgBody).length === 0 ? (
            <View
               style={[
                  styles.replyContainer,
                  isSender
                     ? commonStyles.bg_color(themeColorPalatte.chatSenderSecondaryColor)
                     : commonStyles.bg_color(themeColorPalatte.chatReceiverSecondaryColor),
               ]}>
               <NickName
                  userId={publisherId}
                  style={[
                     styles.nickNameText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderPrimaryTextColor
                           : themeColorPalatte.chatReceiverPrimaryTextColor,
                     ),
                  ]}
               />
               <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={commonStyles.textColor(
                     isSender
                        ? themeColorPalatte.chatSenderPrimaryTextColor
                        : themeColorPalatte.chatReceiverPrimaryTextColor,
                  )}>
                  {stringSet.COMMON_TEXT.ORIGINAL_MESSAGE_DELETED}
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
      paddingHorizontal: 4,
      fontSize: 14,
      fontWeight: '400',
   },
   audioDurationText: {
      marginTop: 4,
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
   miniMediaPreviewWrapperForFile: {
      width: 60,
      height: 60,
      position: 'absolute',
      right: 0,
      borderBottomRightRadius: 5,
      borderTopRightRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
   },
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
