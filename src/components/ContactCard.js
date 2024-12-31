import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AlertModal from '../common/AlertModal';
import { ContactInfoIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { getConversationHistoryTime } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import { getCurrentChatUser, getMessageStatus, getUserIdFromJid, showToast } from '../helpers/chatHelpers';
import { toggleMessageSelection } from '../redux/chatMessageDataSlice';
import { getChatMessage, getChatMessages } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import ReplyMessage from './ReplyMessage';

const ContactCard = ({ item, isSender }) => {
   const chatUser = getCurrentChatUser();
   const dispatch = useDispatch();
   const userId = getUserIdFromJid(chatUser);
   const [modalContent, setModalContent] = React.useState(null);
   const { createdAt, msgStatus, msgBody: { contact: ContactInfo = {}, replyTo = '' } = {} } = item;

   const handleInviteContact = () => {
      const ContactInfo = getChatMessage(userId, msgId)?.msgBody?.contact;
      if (ContactInfo) {
         // open the message app and invite the user to the app with content
         const phoneNumber = ContactInfo.phone_number[0];
         const separator = Platform.OS === 'ios' ? '&' : '?';
         const url = `sms:${phoneNumber}${separator}body=${config.INVITE_SMS_CONTENT}`;
         Linking.openURL(url);
      }
   };

   const handleCopyInviteLink = () => {
      Clipboard.setString(config.INVITE_APP_URL);
      showToast('Link Copied');
   };

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const showContactInviteModal = () => {
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

   const handleInvitePress = () => {
      const messsageList = getChatMessages(userId);
      const isAnySelected = messsageList.some(item => item.isSelected === 1);
      if (isAnySelected) {
         const selectData = {
            chatUserId: userId,
            msgId,
         };
         dispatch(toggleMessageSelection(selectData));
      } else {
         showContactInviteModal();
      }
   };

   return (
      <View style={styles.container}>
         {Boolean(replyTo) && (
            <View style={commonStyles.marginHorizontal_4}>
               {Boolean(replyTo) && <ReplyMessage message={item} isSame={isSender} />}
            </View>
         )}
         <View style={styles.contactInfo}>
            <View style={styles.SelectedIcon}>
               <ContactInfoIcon width={15} height={15} />
            </View>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.contactNickname}>
               {ContactInfo.name}
            </Text>
         </View>
         <View style={styles.timeStampWrapper}>
            {isSender && getMessageStatus(msgStatus)}
            <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
         </View>
         {!isSender && (
            <>
               <View style={styles.borderLine} />
               <Pressable contentContainerStyle={styles.inviteTextWrapper} onPress={handleInvitePress}>
                  <Text style={styles.inviteText}>Invite</Text>
               </Pressable>
            </>
         )}
         {modalContent && <AlertModal {...modalContent} />}
      </View>
   );
};

export default ContactCard;

const styles = StyleSheet.create({
   container: {
      width: 230,
      position: 'relative',
   },
   contactInfo: {
      paddingTop: 17,
      paddingBottom: 7,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
   },
   imageBackground: {
      alignItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 20,
      resizeMode: 'cover',
   },
   contactNickname: {
      color: '#313131',
      fontSize: 13,
      fontWeight: '400',
      paddingLeft: 5,
      flex: 1,
   },
   timeStampWrapper: {
      flexDirection: 'row',
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
      padding: 2,
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
   timeStampText: {
      paddingLeft: 4,
      color: '#455E93',
      fontSize: 10,
      fontWeight: '400',
   },
   borderLine: {
      borderWidth: 0.5,
      borderColor: ApplicationColors.mainBorderColor,
   },
   inviteTextWrapper: { justifyContent: 'center', paddingVertical: 10 },
   inviteText: {
      color: '#313131',
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
   },
   SelectedIcon: {
      width: 30,
      height: 30,
      marginRight: 5,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 1,
      backgroundColor: '#9D9D9D',
      borderRadius: 15,
   },
});
