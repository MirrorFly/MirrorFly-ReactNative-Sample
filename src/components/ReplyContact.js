import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ClearTextIcon, ContactChatIcon } from '../common/Icons';
import NickName from '../common/NickName';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

const ReplyContact = props => {
   const { replyMsgItems, handleRemove } = props;
   const { publisherJid = '', msgBody = {} } = replyMsgItems;
   const contactInfo = msgBody?.contact;
   const isSameUser = publisherJid === getCurrentUserJid();
   const publisherId = getUserIdFromJid(publisherJid);

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <View>
         <View flexDirection="row" justifyContent={'space-between'} alignItems={'center'}>
            {isSameUser ? (
               <Text style={commonStyles.userName}>You</Text>
            ) : (
               <NickName style={commonStyles.userName} userId={publisherId} />
            )}
            <Pressable
               style={{
                  padding: 5,
                  top: -3,
                  right: 10,
                  bottom: 0,
                  backgroundColor: '#FFF',
                  borderRadius: 10,
                  borderColor: '#000',
                  borderWidth: 1,
               }}
               onPress={RemoveHandle}>
               <ClearTextIcon />
            </Pressable>
         </View>
         <View flexDirection="row" alignItems={'center'}>
            <ContactChatIcon />
            <Text pl={2} color="#313131" fontSize={14} fontWeight={400}>
               Contact: {contactInfo?.name}
            </Text>
         </View>
      </View>
   );
};

export default ReplyContact;
