import { Pressable } from 'react-native';
import React from 'react';
import { HStack, Text, View } from 'native-base';
import { ClearTextIcon, ContactChatIcon } from '../common/Icons';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { useSelector } from 'react-redux';

const ReplyContact = props => {
  const { replyMsgItems, handleRemove } = props;
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);

  const RemoveHandle = () => {
    handleRemove();
  };

  return (
    <View>
      <HStack justifyContent={'space-between'} alignItems={'center'}>
        {replyMsgItems.fromUserJid === currentUserJID ? (
          <Text color={'#000'} fontSize={14} pl={1}  mb={1} fontWeight={600} py="0">
            You
          </Text>
        ) : (
          <Text mb={2} color={'#000'} pl={1}  fontSize={14} fontWeight={600} py="0">
            {replyMsgItems.msgBody.nickName}
          </Text>
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
      </HStack>
      <HStack alignItems={'center'}pl={1}>
        <ContactChatIcon />
        <Text pl={2} color="#313131" fontSize={14} fontWeight={400}>
          Contact:{replyMsgItems.msgBody.nickName}
        </Text>
      </HStack>
    </View>
  );
};
export default ReplyContact;

