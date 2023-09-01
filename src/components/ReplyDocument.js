import { Pressable } from 'react-native';
import React from 'react';
import { HStack, Text, View } from 'native-base';
import { ClearTextIcon, DocumentChatIcon } from '../common/Icons';
import { useSelector } from 'react-redux';
import useRosterData from 'hooks/useRosterData';

const ReplyDocument = props => {
  const { replyMsgItems, handleRemove } = props;
  const { fromUserJid = '', fromUserId = '' } = replyMsgItems;
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const isSameUser = fromUserJid === currentUserJID;

  let { nickName } = useRosterData(isSameUser ? '' : fromUserId);
  // updating default values
  nickName = nickName || profileDetails?.nickName || '';

  const RemoveHandle = () => {
    handleRemove();
  };
  return (
    <View>
      <HStack justifyContent={'space-between'} alignItems={'center'}>
        {isSameUser ? (
          <Text
            color={'#000'}
            pl={1}
            fontSize={14}
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
            {nickName || fromUserId}
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
        <DocumentChatIcon />
        <Text pl={2} color="#313131" fontSize={14} mb={1} fontWeight={400}>
          {replyMsgItems.msgBody.media.fileName}
        </Text>
      </HStack>
    </View>
  );
};

export default ReplyDocument;
