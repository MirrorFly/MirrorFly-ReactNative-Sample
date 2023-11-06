import React from 'react';
import { mediaStatusConstants } from '../../../constant';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  DownloadCancel,
  DownloadIcon,
  uploadIcon as UploadIcon,
} from '../../../common/Icons';
import { Bar } from 'react-native-progress';
import commonStyles from '../../../common/commonStyles';
import { useSelector } from 'react-redux';

const AttachmentProgressLoader = ({
  mediaStatus,
  onDownload,
  onUpload,
  onCancel,
  msgId,
}) => {
  const { data: mediaDownloadData = {} } = useSelector(
    state => state.mediaDownloadData,
  );

  const { data: mediaUploadData = {} } = useSelector(
    state => state.mediaUploadData,
  );

  switch (mediaStatus) {
    case mediaStatusConstants.DOWNLOADING:
    case mediaStatusConstants.UPLOADING:
      return (
        <View
          style={[
            commonStyles.positionRelative,
            commonStyles.overflowHidden,
            commonStyles.borderRadius_5,
          ]}>
          <Pressable style={styles.downloadIcon} onPress={onCancel}>
            <DownloadCancel color='#7285B5'/>
          </Pressable>
          {mediaDownloadData[msgId]?.progress ||
          mediaUploadData[msgId]?.progress ? (
            <Bar
              style={[
                commonStyles.positionAbsolute,
                commonStyles.bottom_0,
              ]}
              progress={
                mediaDownloadData[msgId]?.progress / 100 ||
                mediaUploadData[msgId]?.progress / 100
              }
              width={36}
              height={3.5}
              color="#7285B5"
              borderWidth={0}
              unfilledColor={'#AFB8D0'}
            />
          ) : (
            <Bar
              style={[commonStyles.positionAbsolute, commonStyles.bottom_0]}
              indeterminate
              width={36}
              height={3.5}
              color="#7285B5"
              borderWidth={0}
              unfilledColor={'#AFB8D0'}
            />
          )}
        </View>
      );
    case mediaStatusConstants.NOT_DOWNLOADED:
      return (
        <Pressable onPress={onDownload} style={styles.downloadIcon}>
          {pressed => <DownloadIcon width="16" height="15" color={'#7285B5'} />}
        </Pressable>
      );
    case mediaStatusConstants.NOT_UPLOADED:
      return (
        <Pressable onPress={onUpload} style={styles.downloadIcon}>
          {pressed => <UploadIcon width="16" height="15" color={'#7285B5'} />}
        </Pressable>
      );
    default:
      return null;
  }
};

export default React.memo(AttachmentProgressLoader);

const styles = StyleSheet.create({
  downloadIcon: {
    borderRadius: 5,
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: '#AFB8D0',
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
