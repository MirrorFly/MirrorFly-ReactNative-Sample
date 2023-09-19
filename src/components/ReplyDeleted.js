import { ORIGINAL_MESSAGE_DELETED } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { HStack, Text, View } from 'native-base';
import React from 'react';
import { Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { ClearTextIcon } from '../common/Icons';

const ReplyDeleted = props => {
  const { replyMsgItems, handleRemove } = props;
  const { fromUserJid = '' } = replyMsgItems;
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const isSameUser = fromUserJid === currentUserJID;

  const RemoveHandle = () => {
    handleRemove();
  };

  return (
    <View>
      <HStack justifyContent={'space-between'} alignItems={'center'}>
        {isSameUser ? (
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
            pl={0}
            fontSize={14}
            fontWeight={600}
            py="0">
            {profileDetails?.nickName || getUserIdFromJid(currentUserJID)}
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
      <Text numberOfLines={1} pl={1} fontSize={14} color="#313131">
        {ORIGINAL_MESSAGE_DELETED}
      </Text>
    </View>
  );
};

export default ReplyDeleted;
