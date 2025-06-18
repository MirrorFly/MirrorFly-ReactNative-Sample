import PropTypes from 'prop-types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AudioMicIcon, AudioMusicIcon, ClearTextIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Text from '../common/Text';
import { getUserIdFromJid, millisToHoursMinutesAndSeconds } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

const ReplyAudio = props => {
   const { replyMsgItems, handleRemove, stringSet } = props;
   const { publisherJid = '', msgBody = {} } = replyMsgItems;
   const publisherId = getUserIdFromJid(publisherJid);

   const RemoveHandle = () => {
      handleRemove();
   };

   const durationInSeconds = msgBody.media.duration || msgBody.media.file.fileDetails.duration;
   const audioType = msgBody.media.audioType;
   const durationInMinutes = millisToHoursMinutesAndSeconds(durationInSeconds);

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
            {audioType ? (
               <AudioMicIcon width="14" height="14" fill="#767676" />
            ) : (
               <AudioMusicIcon width="14" height="14" color={'#767676'} />
            )}
            <Text style={{ paddingHorizontal: 8, color: '#000' }}>
               {durationInMinutes} {stringSet.COMMON_TEXT.AUDIO_MSG_TYPE}
            </Text>
         </View>
      </View>
   );
};

ReplyAudio.propTypes = {
   replyMsgItems: PropTypes.object,
   handleRemove: PropTypes.func,
   stringSet: PropTypes.object,
};

export default ReplyAudio;
