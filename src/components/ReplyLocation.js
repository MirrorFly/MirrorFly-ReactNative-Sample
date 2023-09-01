import { Pressable, Image } from 'react-native';
import React from 'react';
import { ClearTextIcon, LocationIcon } from '../common/Icons';
import { HStack, Text, View } from 'native-base';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { useSelector } from 'react-redux';
import useRosterData from 'hooks/useRosterData';

const ReplyLocation = props => {
  const { replyMsgItems, handleRemove } = props;
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);
  const profileDetails = useSelector(state => state.navigation.profileDetails);

  const { fromUserJid = '', fromUserId = '' } = replyMsgItems;
  const isSender = fromUserJid === currentUserJID;
  let { nickName } = useRosterData(isSender ? '' : fromUserId);
  // updating default values
  nickName = nickName || profileDetails?.nickName || '';

  const RemoveHandle = () => {
    handleRemove();
  };
  const imageUrl =
    'https://subli.info/wp-content/uploads/2015/05/google-maps-blur.png';

  return (
    <View style={{ position: 'relative' }}>
      <HStack justifyContent={'space-between'} alignItems={'center'}>
        {isSender ? (
          <Text
            color={'#000'}
            fontSize={14}
            mb={1}
            pl={1}
            fontWeight={600}
            py="0">
            You
          </Text>
        ) : (
          <Text
            mb={1}
            pl={1}
            color={'#000'}
            fontSize={14}
            fontWeight={600}
            py="0">
            {nickName}
          </Text>
        )}
      </HStack>
      <View
        style={{
          width: 70,
          height: 64,
          alignItems: 'flex-end',
          position: 'absolute',
          top: -12,
          bottom: 0,
          right: -10,
        }}>
        <Image
          resizeMode="cover"
          style={{ width: 60, height: 69 }}
          source={{ uri: imageUrl }}
        />

        <Pressable
          style={{
            padding: 5,
            top: -65,
            right: 10,
            bottom: 0,
            backgroundColor: '#FFF',
            borderRadius: 20,
          }}
          onPress={RemoveHandle}>
          <ClearTextIcon />
        </Pressable>
      </View>

      <HStack alignItems={'center'} pl={1}>
        <LocationIcon color={'#767676'} />
        <Text pl={2} fontSize={14} color={'#313131'} fontWeight={400}>
          Location
        </Text>
      </HStack>
    </View>
  );
};

export default ReplyLocation;
