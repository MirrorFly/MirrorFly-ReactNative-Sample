import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import ApplicationColors from '../config/appColors';
import { getMessageStatus } from '../helpers/chatHelpers';
import { THIS_MESSAGE_WAS_DELETED, YOU_DELETED_THIS_MESSAGE } from '../helpers/constants';
import { getUserNameFromStore, useTypingData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function RecentChatMessage({ userId, item, index, isSender }) {
   const { msgStatus, recallStatus, msgBody } = item;
   const [isTyping, setIsTyping] = React.useState('');
   const typingStatusData = useTypingData(userId) || {};

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
            return <HighlightedMessage text={item?.msgBody?.message} searchValue={''} index={index} />;
         case 'notification':
            return (
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
                  {item?.msgBody.notificationContent}
               </Text>
            );
         case 'image':
            return (
               <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
                  <ImageIcon />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
                     Image
                  </Text>
               </View>
            );
         case 'video':
            return (
               <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
                  <VideoSmallIcon color={'#767676'} />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
                     Video
                  </Text>
               </View>
            );
         case 'file':
            return (
               <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
                  <DocumentChatIcon />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
                     File
                  </Text>
               </View>
            );
         case 'audio':
            return (
               <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
                  {Boolean(audioType) ? (
                     <AudioMicIcon width="14" height="14" fill={'#767676'} />
                  ) : (
                     <AudioMusicIcon width="14" height="14" color={'#767676'} />
                  )}
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
                     Audio
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
                     style={[styles.lastSentMessageTypeText, commonStyles.paddingLeft_0]}>
                     Location
                  </Text>
               </View>
            );
         case 'contact':
            return (
               <View style={styles.lastSentMessageWrapper}>
                  <ContactChatIcon />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.lastSentMessageTypeText]}>
                     Contact
                  </Text>
               </View>
            );
         default:
            return null;
      }
   };

   if (isTyping) {
      return <Text style={[commonStyles.typingText]}>{isTyping}</Text>;
   }

   if (recallStatus) {
      return (
         <View>
            <Text>{isSender ? YOU_DELETED_THIS_MESSAGE : THIS_MESSAGE_WAS_DELETED}</Text>
         </View>
      );
   }
   return (
      <View style={styles.lastSentMessageContainer}>
         {isSender &&
            Boolean(Object.keys(msgBody).length) &&
            item?.msgBody?.message_type !== 'notification' &&
            getMessageStatus(msgStatus, 8)}
         {renderLastSentMessageBasedOnType()}
         <View style={commonStyles.p_1} />
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
      backgroundColor: ApplicationColors.dividerBg,
   },
   lastSentMessageWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '95%',
   },
   lastSentMessageTypeText: {
      paddingHorizontal: 5,
      color: '#767676',
   },
   lastSentMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
});
