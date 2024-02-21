import React from 'react';
import { mediaStatusConstants } from '../../../constant';
import { StyleSheet, Text, View } from 'react-native';
import { DownloadCancel, DownloadIcon, uploadIcon as UploadIcon } from '../../../common/Icons';
import { Bar } from 'react-native-progress';
import commonStyles from '../../../common/commonStyles';
import { useSelector } from 'react-redux';
import { convertBytesToKB } from '../../../Helper';
import ApplicationColors from '../../../config/appColors';
import Pressable from '../../../common/Pressable';

const MediaProgressLoader = ({ mediaStatus, onDownload, onUpload, onCancel, msgId, fileSize }) => {
   const { data: mediaDownloadData = {} } = useSelector(state => state.mediaDownloadData);

   const { data: mediaUploadData = {} } = useSelector(state => state.mediaUploadData);

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
                  <Bar
                     useNativeDriver={true}
                     indeterminate={!mediaDownloadData[msgId]?.progress || !mediaUploadData[msgId]?.progress}
                     progress={mediaDownloadData[msgId]?.progress / 100 || mediaUploadData[msgId]?.progress / 100}
                     width={80}
                     height={2}
                     color="#fff"
                     borderWidth={0}
                     unfilledColor={'rgba(0, 0, 0, 0.5)'}
                  />
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
