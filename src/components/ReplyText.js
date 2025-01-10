import React from 'react';
import { View } from 'react-native';
import { ClearTextIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

const ReplyText = props => {
   const { replyMsgItems, handleRemove } = props;
   const { publisherJid = '' } = replyMsgItems;
   const publisherId = getUserIdFromJid(publisherJid);

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <View>
         <View flexDirection="row" justifyContent={'space-between'} alignItems={'center'}>
            <NickName style={commonStyles.userName} userId={publisherId} />
            <Pressable
               contentContainerStyle={{
                  padding: 5,
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
