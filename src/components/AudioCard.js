import React from 'react';
import { StyleSheet, View } from 'react-native';
import AudioPlayer from '../Media/AudioPlayer';
import AttachmentProgressLoader from '../common/AttachmentProgressLoader';
import { AudioMicIcon, AudioMusicIcon } from '../common/Icons';
import Text from '../common/Text';
import { getConversationHistoryTime } from '../common/timeStamp';
import { getMessageStatus } from '../helpers/chatHelpers';
import useMediaProgress from '../hooks/useMediaProgress';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import ReplyMessage from './ReplyMessage';
import PropTypes from 'prop-types';

const AudioCard = ({ item, isSender }) => {
   const {
      createdAt,
      msgId,
      msgStatus,
      msgBody: {
         media,
         media: { file: { fileDetails = {} } = {}, is_uploading, is_downloaded, local_path = '', audioType = '' } = {},
         replyTo = '',
      } = {},
   } = item;
   const uri = local_path || fileDetails?.uri;
   const themeColorPalatte = useThemeColorPalatte();
   const { mediaStatus, downloadMedia, retryUploadMedia, cancelProgress } = useMediaProgress({
      mediaUrl: uri,
      uploadStatus: is_uploading || 0,
      downloadStatus: is_downloaded || 0,
      media: media,
      msgId: msgId,
   });

   return (
      <View style={[styles.container, replyTo ? commonStyles.p_4 : undefined]}>
         {Boolean(replyTo) && <ReplyMessage message={item} isSender={isSender} />}
         <View
            style={[
               styles.audioControlsContainer,
               commonStyles.bg_color(
                  isSender ? themeColorPalatte.chatSenderSecondaryColor : themeColorPalatte.chatReceiverSecondaryColor,
               ),
            ]}>
            <View style={styles.audioIconContainer}>
               {audioType ? <AudioMicIcon width="14" height="14" /> : <AudioMusicIcon width="14" height="14" />}
            </View>
            <View style={[commonStyles.marginLeft_8, commonStyles.marginRight_4]}>
               <AttachmentProgressLoader
                  mediaStatus={mediaStatus}
                  onDownload={downloadMedia}
                  onUpload={retryUploadMedia}
                  onCancel={cancelProgress}
                  msgId={msgId}
               />
            </View>
            <AudioPlayer msgId={msgId} uri={uri} media={media} mediaStatus={mediaStatus} />
         </View>
         <View
            style={[
               styles.bottomView,
               commonStyles.bg_color(
                  isSender ? themeColorPalatte.chatSenderPrimaryColor : themeColorPalatte.chatReceiverPrimaryColor,
               ),
            ]}>
            {isSender && getMessageStatus(msgStatus)}
            <Text
               style={[
                  styles.timeStampText,
                  commonStyles.textColor(
                     isSender
                        ? themeColorPalatte.chatSenderSecondaryTextColor
                        : themeColorPalatte.chatReceiverSecondaryTextColor,
                  ),
               ]}>
               {getConversationHistoryTime(createdAt)}
            </Text>
         </View>
      </View>
   );
};

AudioCard.propTypes = {
   item: PropTypes.shape({
      createdAt: PropTypes.string,
      msgId: PropTypes.string,
      msgStatus: PropTypes.number,
      msgBody: PropTypes.shape({
         media: PropTypes.shape({
            file: PropTypes.shape({
               fileDetails: PropTypes.object,
               is_uploading: PropTypes.bool,
               is_downloaded: PropTypes.bool,
               local_path: PropTypes.string,
            }),
            audioType: PropTypes.string,
         }),
         replyTo: PropTypes.string,
      }),
   }),
   isSender: PropTypes.bool,
};

export default AudioCard;

const styles = StyleSheet.create({
   bottomView: {
      height: 22,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
   },
   container: {
      width: 250,
      marginBottom: 4,
   },
   audioControlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 64,
      paddingHorizontal: 8,
   },
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
      fontSize: 10,
      fontWeight: '400',
   },
});
