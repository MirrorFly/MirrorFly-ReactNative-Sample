import { Pressable } from 'react-native';
import React from 'react';
import { HStack, Text, View } from 'native-base';
import { AudioMusicIcon, ClearTextIcon } from '../common/Icons';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from 'Helper/Chat/Utility';

const ReplyAudio = props => {
  const { replyMsgItems, handleRemove } = props;
  const { fromUserJid = '' } = replyMsgItems;
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const isSameUser = fromUserJid === currentUserJID;

  const durationInSeconds = replyMsgItems.msgBody.media.duration;
  const durationInMinutes = Math.floor(durationInSeconds / 1000);

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
            pl={1}
            fontSize={14}
            fontWeight={600}
            py="0">
            {profileDetails.nickName || getUserIdFromJid(currentUserJID)}
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
        <AudioMusicIcon width="14" height="14" color={'#767676'} />
        <Text color="#313131" fontSize={14} pl={2} fontWeight={400}>
          {`${String(Math.floor(durationInMinutes / 60)).padStart(
            2,
            '0',
          )}:${String(durationInMinutes % 60).padStart(2, '0')}`}
        </Text>
      </HStack>
    </View>
  );
};

export default ReplyAudio;
