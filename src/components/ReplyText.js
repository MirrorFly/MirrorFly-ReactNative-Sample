import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ClearTextIcon } from '../common/Icons';
import NickName from '../common/NickName';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

const ReplyText = props => {
   const { replyMsgItems, handleRemove } = props;
   const { publisherJid = '' } = replyMsgItems;
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
         <Text numberOfLines={1} pl={2} fontSize={14} color="#313131">
            {replyMsgItems?.msgBody?.message}
         </Text>
      </View>
   );
};

export default ReplyText;
