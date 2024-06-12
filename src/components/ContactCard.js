import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ContactInfoIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { getConversationHistoryTime } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import { getMessageStatus } from '../helpers/chatHelpers';

const ContactCard = ({ item, isSender }) => {
   const { createdAt, msgStatus, msgBody: { contact: ContactInfo, replyTo = '' } = {} } = item;

   const handleInvitePress = () => {
      onInvitePress?.(message);
   };

   return (
      <View style={styles.container}>
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
