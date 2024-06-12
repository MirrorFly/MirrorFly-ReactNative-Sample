import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AudioPlayer from '../Media/AudioPlayer';
import AttachmentProgressLoader from '../common/AttachmentProgressLoader';
import { AudioMicIcon, AudioMusicIcon } from '../common/Icons';
import { getConversationHistoryTime } from '../common/timeStamp';
import { getMessageStatus } from '../helpers/chatHelpers';
import useMediaProgress from '../hooks/useMediaProgress';
import commonStyles from '../styles/commonStyles';

const AudioCard = ({ item, isSender }) => {
   const {
      createdAt,
      msgId,
      msgStatus,
      msgBody: {
         media,
         media: { file: { fileDetails = {} } = {}, is_uploading, is_downloaded, local_path = '', audioType = '' } = {},
      } = {},
      replyTo = '',
   } = item;
   const uri = local_path || fileDetails?.uri;

   const { mediaStatus, downloadMedia, retryUploadMedia, cancelUploadMedia } = useMediaProgress({
      mediaUrl: uri,
      uploadStatus: is_uploading || 0,
      downloadStatus: is_downloaded || 0,
      media: media,
      msgId: msgId,
   });

   return (
      <View style={[styles.container, replyTo ? commonStyles.p_4 : undefined]}>
         {/* {Boolean(replyTo) && (
                <ReplyMessage handleReplyPress={handleReplyPress} message={messageObject} isSame={isSender} />
            )} */}
         <View style={styles.audioControlsContainer(isSender ? '#D0D8EB' : '#EFEFEF')}>
            <View style={styles.audioIconContainer}>
               {audioType ? <AudioMicIcon width="14" height="14" /> : <AudioMusicIcon width="14" height="14" />}
            </View>
            <View style={[commonStyles.marginLeft_8, commonStyles.marginRight_4]}>
               <AttachmentProgressLoader
                  mediaStatus={mediaStatus}
                  onDownload={downloadMedia}
                  onUpload={retryUploadMedia}
                  onCancel={cancelUploadMedia}
                  msgId={msgId}
               />
            </View>
            <AudioPlayer msgId={msgId} uri={uri} media={media} mediaStatus={mediaStatus} />
         </View>
         <View style={styles.bottomView(isSender ? '#E2E8F7' : '#fff')}>
            {isSender && getMessageStatus(msgStatus)}
            <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
         </View>
      </View>
   );
};

export default AudioCard;

const styles = StyleSheet.create({
   bottomView: bgColor => ({
      height: 22,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: bgColor,
   }),
   container: {
      width: 250,
      marginBottom: 4,
   },
   audioControlsContainer: bgColor => ({
      flexDirection: 'row',
      alignItems: 'center',
      height: 64,
      paddingHorizontal: 8,
      backgroundColor: bgColor,
   }),
   audioIconContainer: {
      backgroundColor: '#97A5C7',
      borderRadius: 25,
      padding: 8,
      width: 30,
      height: 30,
   },
   timeStampText: {
      paddingHorizontal: 4,
      textAlign: 'right',
      color: '#455E93',
      fontSize: 10,
      fontWeight: '400',
   },
});
