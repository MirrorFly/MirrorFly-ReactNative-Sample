import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { CameraSmallIcon, ClearTextIcon } from '../common/Icons';
import NickName from '../common/NickName';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

const ReplyImage = props => {
   const { replyMsgItems, handleRemove } = props;
   const { publisherJid = '' } = replyMsgItems;
   const isSameUser = publisherJid === getCurrentUserJid();
   const publisherId = getUserIdFromJid(publisherJid);

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <View style={{ position: 'relative' }}>
         <View flexDirection="row" justifyContent={'space-between'} alignItems={'center'}>
            {isSameUser ? (
               <Text style={[commonStyles.userName]}>You</Text>
            ) : (
               <NickName style={commonStyles.userName} userId={publisherId} />
            )}
         </View>
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
            {replyMsgItems.msgBody.media.local_path ? (
               <Image
                  resizeMode="cover"
                  style={{ width: 60, height: 69 }}
                  source={{ uri: replyMsgItems.msgBody.media.local_path }}
               />
            ) : (
               <Image
                  resizeMode="cover"
                  style={{ width: 60, height: 69 }}
                  source={{
                     uri: `data:image/png;base64,${replyMsgItems.msgBody.media.thumb_image}`,
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
                  borderRadius: 10,
                  borderColor: '#000',
                  borderWidth: 1,
               }}
               onPress={RemoveHandle}>
               <ClearTextIcon />
            </Pressable>
         </View>

         <View flexDirection="row" alignItems={'center'} pl={1}>
            <CameraSmallIcon width="12" height="13" color={'#7285B5'} />
            <Text style={{ fontSize: 14, color: '#313131', paddingLeft: 8 }}>Photo</Text>
         </View>
      </View>
   );
};

export default ReplyImage;
