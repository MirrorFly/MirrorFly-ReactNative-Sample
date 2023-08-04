import { StyleSheet, Pressable, Image } from 'react-native';
import React from 'react';
import { ClearTextIcon, GalleryAllIcon } from '../common/Icons';
import { HStack, Text, View } from 'native-base';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { useSelector } from 'react-redux';

const ReplyImage = props => {
  const { replyMsgItems, handleRemove } = props;
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);

  const RemoveHandle = () => {
    handleRemove();
  };

  return (
    <View style={{ position: 'relative' }}>
      <HStack justifyContent={'space-between'} alignItems={'center'}>
     
        {/* {replyMsgItems.fromUserJid === currentUserJID ? (
          <Text color={'#000'} fontSize={14} mb={2} fontWeight={600} py="0">
            You
          </Text>
        ) : (
          <Text mb={2} color={'#000'} fontSize={14} fontWeight={600} py="0">
            {replyMsgItems.msgBody.nickName}
          </Text>
        )} */}
        <Text mb={2}>Hiiiiiiiiiii</Text>
      </HStack>
      <View
        style={{
          width: 70,
          height: 64,
          alignItems: 'flex-end',
          position: 'absolute',
          top: -15,
          bottom: 0,
          right: -10,
        }}>
       
        {
            replyMsgItems.msgBody.media.local_path ?
           
             (
        <Image
          resizeMode="cover" 
          style={{ width: 70, height: 75 }}
          source={{ uri: replyMsgItems.msgBody.media.local_path }}
        />
        ) :
        (
        <Image
          resizeMode="cover" 
          style={{ width: 70, height: 75 }}
          source={{ uri: `data:image/png;base64,${replyMsgItems.msgBody.media.thumb_image}` }}
        />
        )
        
        }

        <Pressable
          style={{
            padding: 5,
            top:-65,
            right: 10,
            bottom:0,
            backgroundColor: '#FFF',
            borderRadius: 20,
          }}
          onPress={RemoveHandle}>
          <ClearTextIcon />
        </Pressable>
      </View>

      <HStack alignItems={'center'}>
        <GalleryAllIcon />
        <Text pl={4} fontSize={14} color={'#000000'} fontWeight={400}>
          Image
        </Text>
      </HStack>
    </View>
  );
};

export default ReplyImage;

const styles = StyleSheet.create({});
