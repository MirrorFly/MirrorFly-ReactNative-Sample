import { StyleSheet, Pressable, Image } from 'react-native';
import React from 'react';
import { ClearTextIcon, VideoIcon } from '../common/Icons';
import { HStack, Text, View } from 'native-base';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from 'Helper/Chat/Utility';

const ReplyVideo = props => {
  const { replyMsgItems, handleRemove } = props;
  const { fromUserJid = '' } = replyMsgItems;
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const isSameUser = fromUserJid === currentUserJID;

  const RemoveHandle = () => {
    handleRemove();
  };
  return (
    <View style={{ position: 'relative' }}>
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
            mb={1}
            color={'#000'}
            pl={1}
            fontSize={14}
            fontWeight={600}
            py="0">
            {profileDetails.nickName || getUserIdFromJid(currentUserJID)}
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
        {replyMsgItems?.msgBody?.media?.local_path ? (
          <Image
            resizeMode="cover"
            style={{ width: 60, height: 69 }}
            source={{ uri: replyMsgItems?.msgBody?.media?.local_path }}
          />
        ) : (
          <Image
            resizeMode="cover"
            style={{ width: 60, height: 69 }}
            source={{
              uri: `data:image/png;base64,${replyMsgItems?.msgBody?.media?.thumb_image}`,
            }}
          />
        )}
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
        <VideoIcon color={'#767676'} width="13" height="13" />
        <Text pl={2} fontSize={14} color="#313131" fontWeight={400}>
          Video
        </Text>
      </HStack>
    </View>
  );
};

export default ReplyVideo;

const styles = StyleSheet.create({});
