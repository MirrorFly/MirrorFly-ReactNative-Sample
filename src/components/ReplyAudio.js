import React from 'react';
import { Pressable, View } from 'react-native';
import { AudioMusicIcon, ClearTextIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Text from '../common/Text';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

const ReplyAudio = props => {
   const { replyMsgItems, handleRemove, stringSet } = props;
   const { publisherJid = '', msgBody = {} } = replyMsgItems;
   const publisherId = getUserIdFromJid(publisherJid);

   const RemoveHandle = () => {
      handleRemove();
   };

   const durationInSeconds = msgBody.media.duration;
   const durationInMinutes = Math.floor(durationInSeconds / 1000);

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
            <AudioMusicIcon width="14" height="14" color={'#767676'} />
            <Text style={{ paddingHorizontal: 8, color: '#000' }}>
               {`${String(Math.floor(durationInMinutes / 60)).padStart(2, '0')}:${String(
                  durationInMinutes % 60,
               ).padStart(2, '0')} `}
               {stringSet.COMMON_TEXT.AUDIO_MSG_TYPE}
            </Text>
         </View>
      </View>
   );
};

export default ReplyAudio;
