import React from 'react';
import { CloseIcon, DeleteIcon } from '../common/Icons';
import { Text, View } from 'react-native';
import IconButton from '../common/IconButton';
import commonStyles from '../common/commonStyles';
import { MIX_BARE_JID } from '../Helper/Chat/Constant';
import { useSelector } from 'react-redux';

const RecentHeader = ({ recentItem, handleRemove, handleDeleteChat }) => {
   const recentChatList = useSelector(state => state.recentChatData.data || []);
   const handleDelete = () => {
      handleDeleteChat();
   };

   const handleRemoveClose = () => {
      handleRemove();
   };

   const isUserLeft = recentItem.every(res =>
      MIX_BARE_JID.test(res.userJid)
         ? recentChatList.find(r => r.userJid === res.userJid)?.userType === '' && res.userType === ''
         : true,
   );

   const renderDeleteIcon = () => {
      return isUserLeft ? (
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={handleDelete}>
               <DeleteIcon />
            </IconButton>
         </View>
      ) : null;
   };

   return (
      <View
         style={[commonStyles.hstack, commonStyles.alignItemsCenter, commonStyles.p_15]}
         justifyContent={'space-between'}>
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            <IconButton onPress={handleRemoveClose}>
               <CloseIcon />
            </IconButton>
            <Text style={[commonStyles.textCenter, commonStyles.fontSize_18, commonStyles.colorBlack]}>
               {recentItem?.length}
            </Text>
         </View>
         {renderDeleteIcon()}
      </View>
   );
};

export default RecentHeader;
