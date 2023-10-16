import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  DownloadCancel,
  DownloadIcon,
  uploadIcon as UploadIcon,
} from '../../../common/Icons';
import { useNetworkStatus } from '../../../hooks';
import { useSelector, useDispatch } from 'react-redux';
import {
  CancelMediaDownload,
  CancelMediaUpload,
  RetryMediaUpload,
  updateUploadStatus,
} from '../../../redux/Actions/ConversationAction';
import { updateDownloadData } from '../../../redux/Actions/MediaDownloadAction';
import { getUserIdFromJid } from '../../../Helper/Chat/Utility';
import SDK from '../../../SDK/SDK';
import ApplicationColors from '../../../config/appColors';
import Pressable from '../../../common/Pressable';
import commonStyles from '../../../common/commonStyles';
import { showToast } from '../../../Helper';

/**
 * // import {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
//   withRepeat,
// } from 'react-native-reanimated';
import { DownloadCancel, DownloadIcon } from '../../../common/Icons';
  // const animation = useSharedValue(0);
  // const progress = useSharedValue(0);

  const startAnimation = () => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
    ); // -1 means infinite loop
    // animationTimer = setTimeout(() => {
    //   console.log('stopAnimation Called setTimeout', isDownloading)
    //   stopAnimation()
    // }, 5000)
  };

    // animation.value = 0;

    // progress.value = 0;

 * Upload Status
// 0 - Before Upload
// 1 - Uploading Loader - Sender
// 2 - Uploaded
// 3 - Upload Failed
// 4 - Download Loader - Receiver
// 5 - File Not Available
// 6 - Receiver Download Failed
// 7 - Sender - User Cancelled
// 8 - Forward Uploading
// 9 - User Cancelled Downloading
 */

let animationTimer = null;

const ProgressLoader = (props = {}) => {
  const {
    isSender,
    imageUrl,
    fileSize,
    uploadStatus = 0,
    msgId,
    media,
  } = props;
  const dispatch = useDispatch();
  const { file_url = '', thumb_image = '' } = media;
  const isNetworkConnected = useNetworkStatus();
  const { data: mediaDownloadData = {} } = useSelector(
    state => state.mediaDownloadData,
  );
  const { data: mediaUploadData = {} } = useSelector(
    state => state.mediaUploadData,
  );
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);

  const [isDownloading, setisDownloading] = React.useState(false);
  const fileSizeInKB = convertBytesToKB(fileSize);

  function convertBytesToKB(bytes) {
    if (bytes < 1024) {
      // If the size is less than 1KB, return bytes only
      return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
      // If the size is less than 1MB, return in KB
      const KB = bytes / 1024;
      return KB.toFixed(2) + ' KB';
    } else {
      // If the size is 1MB or more, return in MB
      const MB = bytes / (1024 * 1024);
      return MB.toFixed(2) + ' MB';
    }
  }

  /**
   const stopAnimation = () => {
     clearTimeout(animationTimer);
   };
   const stopProgress = () => {};
  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [
  //       {
  //         translateX: withTiming(-200 / 2 + animation.value * 200, {
  //           duration: 0,
  //         }),
  //       },
  //     ],
  //   };
  // });

  // const progressStyle = useAnimatedStyle(() => {
  //   return {
  //     width: mediaUploadData[msgId]?.progress,
  //     height: 2,
  //     backgroundColor: '#66E824',
  //   };
  // });
 */
  /**  const progressDownloadStyle = useAnimatedStyle(() => {
      return {
        width: mediaDownloadData[msgId]?.progress,is_uploading
        height: 2,
        backgroundColor: '#66E824',
      };
   });

   // React.useLayoutEffect(() => {
   //   (mediaUploadData[msgId]?.progress === 100 ||
   //     uploadStatus === 0 ||
   //     uploadStatus === 1) &&
   //     startAnimation();
   // }, [uploadStatus]);

   // React.useLayoutEffect(() => {
   //   isDownloading && startAnimation();
   // }, [isDownloading]);
   */

  const getAnimateClass = () =>
    mediaUploadData[msgId]?.progress === 100 ||
    uploadStatus === 0 ||
    uploadStatus === 1
      ? true
      : false;

  const getActiveProgressClass = () =>
    uploadStatus === 1 && mediaUploadData[msgId]?.progress < 100 ? true : false;

  const getAnimateDownloadClass = () =>
    mediaDownloadData[msgId]?.progress !== 100 &&
    mediaDownloadData[msgId]?.isDownloaded !== 2
      ? true
      : false;

  const getActiveDownloadProgressClass = () =>
    mediaDownloadData[msgId]?.progress < 100 ? true : false;

  const renderUploadProgressLoader = () => {
    if (!getAnimateClass() && !getActiveProgressClass()) {
      return null;
    }
    if (getAnimateClass()) {
      return (
        <View>
          {/* <Animated.View
          style={styles.loaderLine} // Add this to View tag
            style={[
              {
                width: 40,
                height: 2,
                backgroundColor: '#f2f2f2',
              },
              animatedStyle,
            ]}
          /> */}
        </View>
      );
    }
    if (getActiveProgressClass()) {
      return (
        <View style={styles.loaderLine}>
          {/* <Animated.View style={progressStyle} /> */}
        </View>
      );
    }
  };

  const renderDownloadProgressLoader = () => {
    if (!getAnimateDownloadClass() && !getActiveDownloadProgressClass()) {
      return null;
    }
    if (getAnimateDownloadClass()) {
      return (
        <View style={styles.loaderLine}>
          {/* <Animated.View
            style={[
              {
                width: 40,
                height: 2,
                backgroundColor: '#f2f2f2',
              },
              animatedStyle,
            ]}
          /> */}
        </View>
      );
    }
    /** if (getActiveDownloadProgressClass()) {
     return (
       <View style={styles.loaderLine}>
          <Animated.View style={progressDownloadStyle} />
        </View>
      );
    } */
  };

  const cancelMediaDownload = () => {
    const cancelObj = {
      msgId,
      fromUserId: fromUserJId,
      is_downloaded: 9,
    };
    setisDownloading(false);
    dispatch(CancelMediaDownload(cancelObj));

    if (mediaDownloadData[msgId]) {
      console.log(
        ' mediaDownloadData[msgId]?.source? -->',
        mediaDownloadData[msgId]?.source,
      );
      mediaDownloadData[msgId]?.source?.cancel?.('User Cancelled!');
    }
  };

  const cancelMediaUpload = () => {
    console.log(uploadStatus, 'uploadStatus');
    const cancelObj = {
      msgId,
      fromUserId: fromUserJId,
      uploadStatus: 7,
    };
    dispatch(CancelMediaUpload(cancelObj));
    if (uploadStatus === 8) {
      return true;
    }
    if (mediaUploadData[msgId]) {
      mediaUploadData[msgId]?.source?.cancel?.('User Cancelled!');
    }
    return false;
  };

  const retryMediaUpload = () => {
    if (!isNetworkConnected) {
      showToast('Please check your internet connection', { id: 'MEDIA_RETRY' });
      return;
    }
    const retryObj = {
      msgId,
      fromUserId: getUserIdFromJid(fromUserJId),
      uploadStatus: 1,
    };
    dispatch(RetryMediaUpload(retryObj));
  };

  const handleMediaClick = async e => {
    console.log(msgId, fromUserJId, 'handleMediaClick');
    retryMediaUpload();
  };

  const commonRetryAction = () => {
    return (
      <Pressable
        contentContainerStyle={[
          commonStyles.hstack,
          commonStyles.alignItemsCenter,
          commonStyles.padding_10_15,
        ]}
        style={[commonStyles.bgBlack_04]}
        onPress={handleMediaClick}>
        <UploadIcon />
        <Text
          style={[
            commonStyles.colorWhite,
            commonStyles.fontSize_12,
            commonStyles.marginLeft_10,
          ]}>
          RETRY
        </Text>
      </Pressable>
    );
  };

  const handleDownload = async () => {
    setisDownloading(true);
    let downloadData = {
      msgId,
      statusCode: 200,
      fromUserId: getUserIdFromJid(fromUserJId),
      local_path: '',
      is_downloaded: 1,
      fileToken: file_url,
      thumbImage: thumb_image,
    };
    dispatch(updateUploadStatus(downloadData));
    const response = await SDK.downloadMedia(msgId);
    if (response.statusCode === 200) {
      let updateObj = {
        msgId,
        statusCode: response.statusCode,
        fromUserId: getUserIdFromJid(fromUserJId),
        local_path: response.data.local_path,
        is_downloaded: 2,
        fileToken: file_url,
        thumbImage: thumb_image,
      };
      dispatch(updateDownloadData(response.data));
      dispatch(updateUploadStatus(updateObj));
    }
    /**
    setTimeout(() => {
      setisDownloading(false);
      stopAnimation();
       *  stopProgress();
    }, 3000);
    */
  };
  const isDownload = () => {
    return (
      <>
        <Pressable
          contentContainerStyle={styles.downloadIconWrapper}
          onPress={handleDownload}>
          {/* <IconButton> */}
          <DownloadIcon />
          {/* </IconButton> */}
          <Text style={styles.fileSizeText}>{fileSizeInKB}</Text>
        </Pressable>
      </>
    );
  };

  const renderLoader = () => (
    <View style={styles.loaderBg}>
      <View style={styles.loaderWrapper}>
        <Pressable onPress={isSender ? cancelMediaUpload : cancelMediaDownload}>
          <ActivityIndicator size="large" color={'#3276E2'} />
          <View style={styles.cancelBtn}>
            <DownloadCancel />
          </View>
        </Pressable>
      </View>
      {/* <HStack px="2" borderRadius={5} alignItems={'center'}>
        <IconButton
          onPress={handleCancel}
          icon={
            <Icon
              px="1"
              color={'#fff'}
              as={DownloadCancel}
              name="emoji-happy"
            />
          }
        />
      </HStack> */}
    </View>
  );

  return (
    <>
      {isNetworkConnected &&
      (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8) ? (
        <View style={styles.container}>
          {renderLoader()}
          {/* <View style={styles.loaderContent}>
            {renderUploadProgressLoader()}
          </View> */}
        </View>
      ) : null}
      {/** {uploadStatus === 4 && isNetworkConnected ? progressViewdiffer()
          : null} */}
      {isSender &&
        (uploadStatus === 3 || uploadStatus === 7) &&
        commonRetryAction()}

      {!imageUrl && !isSender && !isDownloading && isDownload()}

      {isDownloading && mediaDownloadData[msgId]?.isDownloaded !== 2 ? (
        <View style={styles.container}>
          {renderLoader()}
          <View style={styles.loaderContent}>
            {renderDownloadProgressLoader()}
          </View>
        </View>
      ) : null}
    </>
  );
};

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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    /** width: 85, Add this during Animation */
  },
  loaderWrapper: {
    overflow: 'hidden',
    borderRadius: 50,
  },
  cancelBtn: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressLoader;
