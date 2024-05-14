import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { convertBytesToKB } from '../../../Helper';
import { DownloadCancel, DownloadIcon, uploadIcon as UploadIcon } from '../../../common/Icons';
import Pressable from '../../../common/Pressable';
import commonStyles from '../../../common/commonStyles';
import ApplicationColors from '../../../config/appColors';
import { mediaStatusConstants } from '../../../constant';
import MediaBar from './MediaBar';

const MediaProgressLoader = ({ mediaStatus, onDownload, onUpload, onCancel, msgId, fileSize }) => {
   const fileSizeInKB = convertBytesToKB(fileSize);

   const renderMediaStatus = () => {
      switch (mediaStatus) {
         case mediaStatusConstants.DOWNLOADING:
         case mediaStatusConstants.UPLOADING:
            return (
               <View style={[commonStyles.positionRelative, commonStyles.overflowHidden, commonStyles.borderRadius_5]}>
                  <Pressable
                     contentContainerStyle={[commonStyles.alignItemsCenter, commonStyles.padding_10_15]}
                     style={[commonStyles.bgBlack_04, commonStyles.width_80]}
                     onPress={onCancel}>
                     <DownloadCancel />
                  </Pressable>
                  <MediaBar msgId={msgId} />
               </View>
            );
         case mediaStatusConstants.NOT_DOWNLOADED:
            return (
               <Pressable contentContainerStyle={styles.downloadIconWrapper} onPress={onDownload}>
                  <DownloadIcon />
                  <Text style={styles.fileSizeText}>{fileSizeInKB}</Text>
               </Pressable>
            );
         case mediaStatusConstants.NOT_UPLOADED:
            return (
               <Pressable
                  contentContainerStyle={[
                     commonStyles.hstack,
                     commonStyles.alignItemsCenter,
                     commonStyles.padding_10_15,
                  ]}
                  style={[commonStyles.bgBlack_04]}
                  onPress={onUpload}>
                  <UploadIcon />
                  <Text style={[commonStyles.colorWhite, commonStyles.fontSize_12, commonStyles.marginLeft_10]}>
                     RETRY
                  </Text>
               </Pressable>
            );
         default:
            return null;
      }
   };

   return <View style={styles.container}>{renderMediaStatus()}</View>;
};

export default React.memo(MediaProgressLoader);

const styles = StyleSheet.create({
   container: {
      overflow: 'hidden',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 5,
   },
   loaderContent: {
      paddingVertical: 1,
      overflow: 'hidden',
      width: 90,
   },
   loaderLine: {
      width: 90,
      height: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.2)', // You can set the color of the loader line here
   },
   downloadIconWrapper: {
      flexDirection: 'row',
      // height: 9,
      padding: 10,
      width: 90,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 5,
   },
   fileSizeText: {
      paddingLeft: 8,
      fontSize: 12,
      color: ApplicationColors.white,
   },
   loaderBg: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      /** width: 85, Add this during Animation */
   },
   loaderWrapper: {
      overflow: 'hidden',
      borderRadius: 5,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
   },
   cancelBtn: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
   },
});
