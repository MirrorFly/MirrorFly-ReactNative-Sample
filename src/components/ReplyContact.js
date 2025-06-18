import PropTypes from 'prop-types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { ClearTextIcon, ContactChatIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Text from '../common/Text';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

const ReplyContact = props => {
   const { replyMsgItems, handleRemove, stringSet } = props;
   const { publisherJid = '', msgBody = {} } = replyMsgItems;
   const contactInfo = msgBody?.contact;
   const publisherId = getUserIdFromJid(publisherJid);

   return (
      <View>
         <View flexDirection="row" justifyContent={'space-between'} alignItems={'center'}>
            <NickName style={commonStyles.userName} userId={publisherId} />
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
               onPress={handleRemove}>
               <ClearTextIcon />
            </Pressable>
         </View>
         <View flexDirection="row" alignItems={'center'}>
            <ContactChatIcon />
            <Text pl={2} color="#313131" fontSize={14} fontWeight={400} style={{ paddingHorizontal: 4 }}>
               {stringSet.CHAT_SCREEN.REPLY_CONTACT_TYPE.replace('{nickName}', contactInfo?.name)}
            </Text>
         </View>
      </View>
   );
};

ReplyContact.propTypes = {
   replyMsgItems: PropTypes.object,
   handleRemove: PropTypes.func,
   stringSet: PropTypes.object,
};

export default ReplyContact;
