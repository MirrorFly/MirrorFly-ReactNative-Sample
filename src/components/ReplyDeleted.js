import React from 'react';
import { Pressable, View } from 'react-native';
import { ClearTextIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Text from '../common/Text';
import { getCurrentChatUser, getUserIdFromJid } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import commonStyles from '../styles/commonStyles';

const ReplyDeleted = props => {
   const stringSet = getStringSet();
   const { handleRemove } = props;

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <View>
         <View style={[commonStyles.hstack, commonStyles.justifyContentSpaceBetween, commonStyles.alignItemsCenter]}>
            <NickName userId={getUserIdFromJid(getCurrentChatUser())} />
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
            {stringSet.COMMON_TEXT.ORIGINAL_MESSAGE_DELETED}
         </Text>
      </View>
   );
};

export default ReplyDeleted;
