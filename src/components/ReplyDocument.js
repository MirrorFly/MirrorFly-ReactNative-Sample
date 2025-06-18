import React from 'react';
import { Pressable, View } from 'react-native';
import { ClearTextIcon, DocumentChatIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Text from '../common/Text';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import PropTypes from 'prop-types';

const ReplyDocument = props => {
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
            <DocumentChatIcon />
            <Text pl={2} color="#313131" fontSize={14} mb={1} fontWeight={400} style={{ paddingHorizontal: 4 }}>
               {replyMsgItems.msgBody.media.fileName}
            </Text>
         </View>
      </View>
   );
};

ReplyDocument.propTypes = {
   replyMsgItems: PropTypes.object,
   handleRemove: PropTypes.func,
};

export default ReplyDocument;
