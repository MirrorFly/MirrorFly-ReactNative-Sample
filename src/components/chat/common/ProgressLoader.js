import { HStack, Icon, IconButton, Pressable, Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { DownloadCancel, DownloadIcon, uploadIcon } from "../../../common/Icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated';
import { useNetworkStatus } from "../../../hooks";
import { useSelector } from "react-redux";
import { CancelMediaUpload, RetryMediaUpload } from "../../../redux/conversationSlice";
import store from "../../../redux/store";

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

function convertBytesToKB(bytes) {
  const KB = bytes / 1024;
  return KB.toFixed(0);
}

let animationTimer = null;
let progressIntervel = null

const ProgressLoader = (props = {}) => {
  const { setUploadStatus, isSender } = props
  const isNetworkConnected = useNetworkStatus();
  const { mediaData, fileSize, uploadStatus = 0, msgId } = props
  const fromUserJId = useSelector(state => state.navigation.fromUserJid)
  const { data = {} } = useSelector((state) => state.mediaUploadData)
  const [isDownloading, setisDownloading] = React.useState(false)
  const [isProgressing, setIsProgressing] = React.useState(false)
  const fileSizeInKB = convertBytesToKB(fileSize);
  const animation = useSharedValue(0);
  console.log(data[msgId], "datadata");
  const progress = useSharedValue(0);
  const [percentage, setPercentage] = React.useState(0);

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
    console.log("reanimation");
    setPercentage(0)
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
      width: data[msgId]?.progress,
      height: 2,
      backgroundColor: '#66E824',
    };
  });

  React.useEffect(() => {
    if (percentage == 100) {
      clearInterval(progressIntervel)
      stopProgress()
      setPercentage(0)
    }
  }, [percentage]);


  const increasePercentage = () => {
    setIsProgressing(true)
    progressIntervel = setInterval(() => {
      setPercentage();
    }, 100)
  }

  React.useLayoutEffect(() => {
    (data[msgId]?.progress === 100 || uploadStatus === 0 || uploadStatus === 1) && startAnimation()
  }, [uploadStatus])

  const getAnimateClass = () => ((data[msgId]?.progress === 100 || uploadStatus === 0 || uploadStatus === 1) ? true : false);

  const getActiveProgressClass = () => (uploadStatus === 1 && data[msgId]?.progress < 100 ? true : false);

  console.log(getActiveProgressClass(),"34567890");
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

  const cancelMediaUpload = () => {
    if (uploadStatus === 8) return true;

    if (data[msgId]) {
      data[msgId].source.cancel("User Cancelled!");
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
  };

  const retryMediaUpload = () => {
    const retryObj = {
      msgId,
      fromUserId: fromUserJId,
      uploadStatus: 1
    };
    store.dispatch(RetryMediaUpload(retryObj));
  };

  const handleMediaClick = (e) => {
    console.log(isSender, "isSenderisSenderisSender");
    // if (isSender) {
    //   imgFileDownloadOnclick(e);
    // } else {
    retryMediaUpload();
    // }
  };

  const commonRetryAction = () => {
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
  };

  return (
    <>
      <Pressable
        onPress={() => {
          // if (mediaData.file_url) {
          //   if (!isDownloading) {
          //     startAnimation();
          //     /**  SDK.downloadMedia(mediaData.file_url) */
          //   } else if (isDownloading) {
          //     stopAnimation();
          //   }
          // }
        }}>
        {isNetworkConnected && (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8) ?
          <View overflow={'hidden'} alignItems={'center'} justifyContent={'space-between'} bg=" rgba(0, 0, 0, 0.3)" borderRadius={5}>
            <Pressable h='9' w='85' alignItems={'center'} justifyContent={'center'} onPress={cancelMediaUpload}>
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
        {/* {uploadStatus === 4 && isNetworkConnected ? progressViewdiffer()
          : null} */}
        {uploadStatus === 3 && commonRetryAction()}
      </Pressable>
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
