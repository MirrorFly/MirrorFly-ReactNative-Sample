import React from 'react';
import { CloseIcon, DeleteIcon } from '../common/Icons';
import { Text, View } from 'react-native';
import IconButton from '../common/IconButton';
import commonStyles from '../common/commonStyles';
import { MIX_BARE_JID } from '../Helper/Chat/Constant';

const RecentHeader = ({ recentItem, handleRemove, handleDeleteChat }) => {
   const handleDelete = () => {
      handleDeleteChat();
   };

   const handleRemoveClose = () => {
      handleRemove();
   };

   const isUserLeft = recentItem.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));

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
            <Text style={[commonStyles.txtCenter, commonStyles.fontSize_18, commonStyles.colorBlack]}>
               {recentItem?.length}
            </Text>
         </View>
         {renderDeleteIcon()}
      </View>
   );
};

export default RecentHeader;
