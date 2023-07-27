import { HStack, Icon, IconButton, Pressable, Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { DownloadCancel, DownloadIcon, uploadIcon } from "../../../common/Icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated';
import { useNetworkStatus } from "../../../hooks";
import { useSelector } from "react-redux";
import { updateUploadStatus } from "../../../redux/conversationSlice";
import store from "../../../redux/store";
import { updateDownloadData } from "../../../redux/mediaDownloadDataSlice";
import { getUserIdFromJid } from "../../../Helper/Chat/Utility";

/**
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
  const { isSender, imageUrl, fileSize, uploadStatus = 0, msgId, media } = props
  const { file_url = "", thumb_image = "" } = media
  const isNetworkConnected = useNetworkStatus();
  const { data: mediaDownloadData = {} } = useSelector((state) => state.mediaDownloadData);
  const { data: mediaUploadData = {} } = useSelector((state) => state.mediaUploadData);
  const fromUserJId = useSelector(state => state.navigation.fromUserJid)

  const [isDownloading, setisDownloading] = React.useState(false)
  const fileSizeInKB = convertBytesToKB(fileSize);
  const animation = useSharedValue(0);
  const progress = useSharedValue(0);

  function convertBytesToKB(bytes) {
    if (bytes < 1024) {
      // If the size is less than 1KB, return bytes only
      return bytes + ' bytes'
    } else if (bytes < 1024 * 1024) {
      // If the size is less than 1MB, return in KB
      const KB = bytes / 1024;
      return KB.toFixed(2) + ' KB'
    } else {
      // If the size is 1MB or more, return in MB
      const MB = bytes / (1024 * 1024);
      return MB.toFixed(2) + ' MB'
    }
  }

  const startAnimation = () => {
    animation.value = withRepeat(withTiming(1, {
      duration: 1000,
      easing: Easing.linear,
    }), - 1); // -1 means infinite loop
    // animationTimer = setTimeout(() => {
    //   console.log('stopAnimation Called setTimeout', isDownloading)
    //   stopAnimation()
    // }, 5000)
  };

  const stopAnimation = () => {
    clearTimeout(animationTimer)
    animation.value = 0;
  }

  const stopProgress = () => {
    progress.value = 0;
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(-200 / 2 + animation.value * 200, { duration: 0 }) }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: mediaUploadData[msgId]?.progress,
      height: 2,
      backgroundColor: '#66E824',
    };
  });

  /*  const progressDownloadStyle = useAnimatedStyle(() => {
      return {
        width: mediaDownloadData[msgId]?.progress,
        height: 2,
        backgroundColor: '#66E824',
      };
   }); */

  React.useLayoutEffect(() => {
    (mediaUploadData[msgId]?.progress === 100 || uploadStatus === 0 || uploadStatus === 1) && startAnimation()
  }, [uploadStatus])

  React.useLayoutEffect(() => {
    isDownloading && startAnimation()
  }, [isDownloading])

  const getAnimateClass = () => ((mediaUploadData[msgId]?.progress === 100 || uploadStatus === 0 || uploadStatus === 1) ? true : false);

  const getActiveProgressClass = () => (uploadStatus === 1 && mediaUploadData[msgId]?.progress < 100 ? true : false);

  const getAnimateDownloadClass = () => ((mediaDownloadData[msgId]?.progress === 100) ? true : false);

  const getActiveDownloadProgressClass = () => (mediaDownloadData[msgId]?.progress < 100 ? true : false);

  const renderLoader = () => {
    if (!getAnimateClass() && !getActiveProgressClass()) return null
    if (getAnimateClass())
      return <View style={styles.loaderLine}>
        <Animated.View
          style={[{
            width: 40,
            height: 2,
            backgroundColor: '#f2f2f2',
          }, animatedStyle]}
        /></View>
    if (getActiveProgressClass())
      return <View style={styles.loaderLine}><Animated.View style={progressStyle} /></View>
  }

  const renderDownloadLoader = () => {
    if (!getAnimateDownloadClass() && !getActiveDownloadProgressClass()) return null
    if (getAnimateDownloadClass())
      return <View style={styles.loaderLine}>
        <Animated.View
          style={[{
            width: 40,
            height: 2,
            backgroundColor: '#f2f2f2',
          }, animatedStyle]}
        /></View>
    // if (getActiveDownloadProgressClass())
    //   return <View style={styles.loaderLine}><Animated.View style={progressDownloadStyle} /></View>
  }

/**   const cancelMediaUpload = () => {
    if (uploadStatus === 8) return true;

    if (mediaUploadData[msgId]) {
      mediaUploadData[msgId].source.cancel("User Cancelled!");
    }

    if (uploadStatus === 0 || uploadStatus === 1) {
      const cancelObj = {
        msgId,
        fromUserId: fromUserJId,
        uploadStatus: 7
      };
      store.dispatch(CancelMediaUpload(cancelObj));
    }
    return false;
  }; */

  /**  const retryMediaUpload = () => {
        const retryObj = {
        msgId,
        fromUserId: fromUserJId,
        uploadStatus: 1
        };
        store.dispatch(RetryMediaUpload(retryObj));
   }; */

  /** const handleMediaClick = (e) => {
      // if (isSender) {
      //   imgFileDownloadOnclick(e);
      // } else {
      retryMediaUpload();
      // }
    }; */

  /** const commonRetryAction = () => {
      return (
        <>
          <Pressable bg="rgba(0, 0, 0, 0.3)" borderRadius={5} onPress={handleMediaClick}>
            <HStack h='9' w='90' justifyContent={'center'} alignItems={'center'}>
              {isSender ? <IconButton
                p='0'
                icon={<Icon color={mediaData.thumb_image ? '#fff' : '#000'} as={uploadIcon} name="emoji-happy" />}
              /> :
                <IconButton
                  p='0'
                  icon={<Icon color={mediaData.thumb_image ? '#fff' : '#000'} as={uploadIcon} name="emoji-happy" />}
                />}
              <Text pl='2' fontSize={'12'} color={'#fff'}>
                RETRY
              </Text>
            </HStack>
          </Pressable>
        </>
      );
    }; */

  const handleDownload = async () => {
    setisDownloading(true)
    const response = await SDK.downloadMedia(msgId);
    if (response.statusCode === 200) {
      let updateObj = {
        msgId,
        statusCode: response.statusCode,
        fromUserId: getUserIdFromJid(fromUserJId),
        local_path: response.data.local_path,
        fileToken: file_url,
        thumbImage: thumb_image,
      };
      store.dispatch(updateDownloadData(response.data));
      store.dispatch(updateUploadStatus(updateObj));
      stopAnimation();
      stopProgress();
    }
  }

  const isDownload = () => {
    return (
      <>
        <Pressable bg="rgba(0, 0, 0, 0.3)" borderRadius={5} onPress={handleDownload}>
          <HStack h='9' w='90' justifyContent={'center'} alignItems={'center'}>
            {<IconButton
              p='0'
              icon={<Icon color={'#fff'} as={DownloadIcon} name="emoji-happy" />}
            />}
            <Text pl='2' fontSize={'12'} color={'#fff'}>
              {fileSizeInKB}
            </Text>
          </HStack>
        </Pressable>
      </>
    );
  }

  return (
    <>
      <View>
        {isNetworkConnected && (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8) ?
          <View overflow={'hidden'} alignItems={'center'} justifyContent={'space-between'} bg=" rgba(0, 0, 0, 0.3)" borderRadius={5}>
            <Pressable h='9' w='85' alignItems={'center'} justifyContent={'center'}>
              <HStack
                px='2'
                borderRadius={5}
                alignItems={'center'}>
                <IconButton
                  icon={<Icon px='1' color={'#fff'} as={DownloadCancel} name="emoji-happy" />}
                />
              </HStack>
            </Pressable>
            <View style={styles.loaderContent}>
              {renderLoader()}
            </View>
          </View> : null}
        {/** {uploadStatus === 4 && isNetworkConnected ? progressViewdiffer()
          : null} */}
        {
          /**{uploadStatus === 3 && commonRetryAction()}
          */
        }
        {!imageUrl && !isSender && !isDownloading && isDownload()}

        {isDownloading && mediaDownloadData[msgId]?.isDownloaded !== 2 ?
          <View overflow={'hidden'} alignItems={'center'} justifyContent={'space-between'} bg=" rgba(0, 0, 0, 0.3)" borderRadius={5}>
            <Pressable h='9' w='85' alignItems={'center'} justifyContent={'center'}>
              <HStack
                px='2'
                borderRadius={5}
                alignItems={'center'}>
                <IconButton
                  icon={<Icon px='1' color={'#fff'} as={DownloadCancel} name="emoji-happy" />}
                />
              </HStack>
            </Pressable>
            <View style={styles.loaderContent}>
              {renderDownloadLoader()}
            </View>
          </View> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loaderContent: {
    paddingVertical: 1,
    overflow: 'hidden',
    width: 90
  },
  loaderLine: {
    width: 90,
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // You can set the color of the loader line here
  }
});

export default ProgressLoader;
