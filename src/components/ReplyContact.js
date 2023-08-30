import { Pressable } from 'react-native';
import React from 'react';
import { HStack, Text, View } from 'native-base';
import { ClearTextIcon, ContactChatIcon } from '../common/Icons';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { useSelector } from 'react-redux';
import useRosterData from '../hooks/useRosterData';

const ReplyContact = props => {
  const { replyMsgItems, handleRemove } = props;
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);
  const profileDetails = useSelector(state => state.navigation.profileDetails);

  const { fromUserJid = '', fromUserId = '' } = replyMsgItems;
  const isSender = fromUserJid === currentUserJID;
  const { nickName = profileDetails?.nickName } = useRosterData(
    isSender ? '' : fromUserId,
  );

  const RemoveHandle = () => {
    handleRemove();
  };

  return (
    <View>
      <HStack justifyContent={'space-between'} alignItems={'center'}>
        {isSender ? (
          <Text
            color={'#000'}
            fontSize={14}
            pl={1}
            mb={1}
            fontWeight={600}
            py="0">
            You
          </Text>
        ) : (
          <Text
            mb={2}
            color={'#000'}
            pl={1}
            fontSize={14}
            fontWeight={600}
            py="0">
            {nickName}
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
      <HStack alignItems={'center'} pl={1}>
        <ContactChatIcon />
        <Text pl={2} color="#313131" fontSize={14} fontWeight={400}>
          Contact:{nickName}
        </Text>
      </HStack>
    </View>
  );
};
export default ReplyContact;
