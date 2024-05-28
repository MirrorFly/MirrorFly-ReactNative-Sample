import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { DownloadCancel, DownloadIcon, uploadIcon as UploadIcon } from '../../../common/Icons';
import commonStyles from '../../../common/commonStyles';
import { mediaStatusConstants } from '../../../constant';
import AttachementBar from '../../AttachementBar';

const AttachmentProgressLoader = ({ mediaStatus, onDownload, onUpload, onCancel, msgId }) => {
   switch (mediaStatus) {
      case mediaStatusConstants.DOWNLOADING:
      case mediaStatusConstants.UPLOADING:
         return (
            <View style={[commonStyles.positionRelative, commonStyles.overflowHidden, commonStyles.borderRadius_5]}>
               <Pressable style={styles.downloadIcon} onPress={onCancel}>
                  <DownloadCancel color="#7285B5" />
               </Pressable>
               <AttachementBar msgId={msgId} />
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
