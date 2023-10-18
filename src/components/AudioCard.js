import React from 'react';
import { AudioMusicIcon, MicIcon } from '../common/Icons';
import AudioPlayer from './Media/AudioPlayer';
import { StyleSheet, Text, View } from 'react-native';
import AttachmentProgressLoader from './chat/common/AttachmentProgressLoader';
import useMediaProgress from '../hooks/useMediaProgress';
import ReplyMessage from './ReplyMessage';
import commonStyles from '../common/commonStyles';

const AudioCard = props => {
  const { messageObject, isSender, handleReplyPress } = props;

  const {
    msgId = '',
    msgBody: { replyTo = '', media },
  } = messageObject;
  const uri = media.local_path || media?.file?.fileDetails?.uri;

  const { mediaStatus, downloadMedia, retryUploadMedia, cancelUploadMedia } =
    useMediaProgress({
      isSender,
      mediaUrl: uri,
      uploadStatus: media?.is_uploading || 0,
      media: media,
      msgId: msgId,
    });

  return (
    <View style={[styles.container, replyTo ? commonStyles.p_4 : undefined]}>
      {replyTo && (
        <ReplyMessage
          handleReplyPress={handleReplyPress}
          message={messageObject}
          isSame={isSender}
        />
      )}
      <View
        style={styles.audioControlsContainer(isSender ? '#D0D8EB' : '#EFEFEF')}>
        <View style={styles.audioIconContainer}>
          <AudioMusicIcon width="14" height="14" />
        </View>
        <View style={[commonStyles.marginLeft_8, commonStyles.marginRight_4]}>
          <AttachmentProgressLoader
            isSender={isSender}
            mediaStatus={mediaStatus}
            onDownload={downloadMedia}
            onUpload={retryUploadMedia}
            onCancel={cancelUploadMedia}
            msgId={msgId}
          />
        </View>
        <AudioPlayer
          msgId={msgId}
          uri={uri}
          media={media}
          mediaStatus={mediaStatus}
        />
      </View>
      <View style={styles.bottomView(isSender ? '#E2E8F7' : '#fff')}>
        {props.status}
        <Text style={styles.timeStampText}>{props.timeStamp}</Text>
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
