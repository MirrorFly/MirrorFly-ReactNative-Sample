import React from 'react';
import { mediaStatusConstants } from '../../../constant';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { DownloadIcon, uploadIcon as UploadIcon } from '../../../common/Icons';

const AttachmentProgressLoader = ({
  isSender,
  mediaStatus,
  onDownload,
  onUpload,
}) => {
  switch (mediaStatus) {
    case mediaStatusConstants.DOWNLOADING:
    case mediaStatusConstants.UPLOADING:
      return <ActivityIndicator size={'small'} />;
    case mediaStatusConstants.NOT_DOWNLOADED:
      return (
        <Pressable onPress={onDownload} style={styles.downloadIcon(isSender)}>
          {pressed => <DownloadIcon width="16" height="15" color={'#b0b0b0'} />}
        </Pressable>
      );
    case mediaStatusConstants.NOT_UPLOADED:
      return (
        <Pressable onPress={onUpload} style={styles.downloadIcon(isSender)}>
          {pressed => <UploadIcon width="16" height="15" color={'#999ea9'} />}
        </Pressable>
      );
    default:
      return null;
  }
};

export default React.memo(AttachmentProgressLoader);

const styles = StyleSheet.create({
  downloadIcon: isSender => ({
    borderRadius: 5,
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: isSender ? '#b9c2dc' : '#d3d3d3',
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  }),
});
