import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HighlightedMessage } from '../common/HighlightedMessage';
import {
   AudioMicIcon,
   AudioMusicIcon,
   ContactChatIcon,
   DocumentChatIcon,
   ImageIcon,
   LocationMarkerIcon,
   VideoSmallIcon,
} from '../common/Icons';
import Text from '../common/Text';
import { getMessageStatus, getUserIdFromJid, groupNotifyStatus } from '../helpers/chatHelpers';
import { messageNotificationTypes } from '../helpers/constants';
import { getUserNameFromStore, useRoasterData, useTypingData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function RecentChatMessage({ userId, item, index, isSender, stringSet, themeColorPalatte }) {
   const { msgBody: { message = '' } = {}, publisherId = '', toUserJid = '', recallStatus } = item;
   const [isTyping, setIsTyping] = React.useState('');
   const typingStatusData = useTypingData(userId) || {};
   const publisherName = useRoasterData(publisherId)?.nickName || userId;
   const toUserID = getUserIdFromJid(toUserJid);
   const toUserName = useRoasterData(toUserID)?.nickName || toUserJid;

   React.useEffect(() => {
      if (typingStatusData.groupId) {
         setIsTyping(`${getUserNameFromStore(typingStatusData.fromUserId)} typing...`);
      } else if (typingStatusData.fromUserId) {
         setIsTyping('typing...');
      } else {
         setIsTyping('');
      }
   }, [typingStatusData]);

   const renderLastSentMessageBasedOnType = () => {
      const audioType = item?.msgBody?.media?.audioType;
      switch (item?.msgBody?.message_type) {
         case 'text':
         case 'auto_text':
            return (
               <HighlightedMessage
                  text={item?.msgBody?.message}
                  searchValue={''}
                  index={index}
                  themeColorPalatte={themeColorPalatte}
               />
            );
         case 'notification':
            return (
               <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: themeColorPalatte.secondaryTextColor }}>
                  {groupNotifyStatus(
                     publisherId,
                     toUserID,
                     messageNotificationTypes[message],
                     publisherName,
                     toUserName,
                  )}
               </Text>
            );
         case 'image':
            return (
               <View style={[styles.lastSentMessageWrapper, isSender && commonStyles.paddingLeft_4]}>
                  <ImageIcon />
                  <Text
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[styles.lastSentMessageTypeText, { color: themeColorPalatte.secondaryTextColor }]}>
                     {stringSet.COMMON_TEXT.IMAGE_MSG_TYPE}
                  </Text>
               </View>
            );
         case 'video':
            return (
               <View style={[styles.lastSentMessageWrapper, isSender && commonStyles.paddingLeft_4]}>
                  <VideoSmallIcon color={themeColorPalatte.secondaryTextColor} />
                  <Text
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[styles.lastSentMessageTypeText, { color: themeColorPalatte.secondaryTextColor }]}>
                     {stringSet.COMMON_TEXT.VIDEO_MSG_TYPE}
                  </Text>
               </View>
            );
         case 'file':
            return (
               <View style={[styles.lastSentMessageWrapper, isSender && commonStyles.paddingLeft_4]}>
                  <DocumentChatIcon />
                  <Text
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[styles.lastSentMessageTypeText, { color: themeColorPalatte.secondaryTextColor }]}>
                     {stringSet.COMMON_TEXT.FILE_MSG_TYPE}
                  </Text>
               </View>
            );
         case 'audio':
            return (
               <View style={[styles.lastSentMessageWrapper, isSender && commonStyles.paddingLeft_4]}>
                  {Boolean(audioType) ? (
                     <AudioMicIcon width="14" height="14" fill={themeColorPalatte.secondaryTextColor} />
                  ) : (
                     <AudioMusicIcon width="14" height="14" color={themeColorPalatte.secondaryTextColor} />
                  )}
                  <Text
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[styles.lastSentMessageTypeText, { color: themeColorPalatte.secondaryTextColor }]}>
                     {stringSet.COMMON_TEXT.AUDIO_MSG_TYPE}
                  </Text>
               </View>
            );
         case 'location':
            return (
               <View style={styles.lastSentMessageWrapper}>
                  <LocationMarkerIcon width="23" height="23" color={'#000'} />
                  <Text
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[
                        styles.lastSentMessageTypeText,
                        commonStyles.paddingLeft_0,
                        { color: themeColorPalatte.secondaryTextColor },
                     ]}>
                     {stringSet.COMMON_TEXT.LOCATION_MSG_TYPE}
                  </Text>
               </View>
            );
         case 'contact':
            return (
               <View style={styles.lastSentMessageWrapper}>
                  <ContactChatIcon />
                  <Text
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[styles.lastSentMessageTypeText, { color: themeColorPalatte.secondaryTextColor }]}>
                     {stringSet.COMMON_TEXT.CONTACT_MSG_TYPE}
                  </Text>
               </View>
            );
         default:
            return null;
      }
   };

   if (isTyping) {
      return <Text style={[commonStyles.textColor(themeColorPalatte.primaryColor)]}>{isTyping}</Text>;
   }

   if (recallStatus) {
      return (
         <View style={styles.lastSentMessageWrapper}>
            <View style={commonStyles.p_1} />
            <Text style={{ color: themeColorPalatte.secondaryTextColor }}>
               {isSender
                  ? stringSet.COMMON_TEXT.YOU_DELETED_THIS_MESSAGE
                  : stringSet.COMMON_TEXT.THIS_MESSAGE_WAS_DELETED}
            </Text>
         </View>
      );
   }
   return (
      <View style={styles.lastSentMessageWrapper}>
         {isSender &&
            Boolean(Object.keys(item?.msgBody).length) &&
            item?.msgBody?.message_type !== 'notification' &&
            !recallStatus &&
            getMessageStatus(item?.msgStatus, 8)}

         <View style={commonStyles.paddingLeft_4} />
         {renderLastSentMessageBasedOnType()}
      </View>
   );
}

export default RecentChatMessage;

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
   },
   avatarContainer: {
      marginRight: 10,
   },
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
   },
   nickname: {
      fontWeight: 'bold',
      marginBottom: 5,
   },
   message: {
      color: '#555',
   },
   time: {
      fontSize: 10,
      color: '#1f2937',
   },
   userName: {
      color: '#1f2937',
      fontWeight: 'bold',
      maxWidth: '90%',
   },
   divider: {
      width: '83%',
      height: 1,
      alignSelf: 'flex-end',
   },
   lastSentMessageWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '95%',
   },
   lastSentMessageTypeText: {
      paddingHorizontal: 5,
   },
   lastSentMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
});
