import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ClearTextIcon } from '../common/Icons';
import NickName from '../common/NickName';
import { getCurrentChatUser, getUserIdFromJid } from '../helpers/chatHelpers';
import { ORIGINAL_MESSAGE_DELETED } from '../helpers/constants';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

const ReplyDeleted = props => {
   const { replyMsgItems, handleRemove } = props;
   const { publisherJid = '' } = replyMsgItems;
   const isSameUser = publisherJid === getCurrentUserJid();

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <View>
         <View style={[commonStyles.hstack, commonStyles.justifyContentSpaceBetween, commonStyles.alignItemsCenter]}>
            {isSameUser ? (
               <Text color={'#000'} fontSize={14} pl={1} mb={1} fontWeight={600} py="0">
                  You
               </Text>
            ) : (
               <NickName userId={getUserIdFromJid(getCurrentChatUser())} />
               // <Text mb={2} color={'#000'} pl={0} fontSize={14} fontWeight={600} py="0">
               //    {profileDetails?.nickName || getUserIdFromJid(currentUserJID)}
               // </Text>
            )}
            <Pressable
               style={{
                  padding: 5,
                  backgroundColor: '#FFF',
                  borderRadius: 20,
               }}
               onPress={RemoveHandle}>
               <ClearTextIcon />
            </Pressable>
         </View>
         <Text numberOfLines={1} pl={1} fontSize={14} color="#313131">
            {ORIGINAL_MESSAGE_DELETED}
         </Text>
      </View>
   );
};

export default ReplyDeleted;
