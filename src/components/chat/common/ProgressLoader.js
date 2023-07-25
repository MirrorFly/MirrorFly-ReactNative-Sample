import { HStack, Pressable, Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { DownloadIcon } from "../../../common/Icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated';
import { useNetworkStatus } from "../../../hooks";
import { useSelector } from "react-redux";

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
  const isNetworkConnected = useNetworkStatus();
  const { mediaData, fileSize, uploadStatus = 0, msgId } = props
  const mediaUploadData = useSelector((state) => state.mediaUploadData?.data)
  const [isDownloading, setisDownloading] = React.useState(false)
  const [isProgressing, setIsProgressing] = React.useState(false)
  const fileSizeInKB = convertBytesToKB(fileSize);
  const animation = useSharedValue(0);

  const progress = useSharedValue(0);
  const [percentage, setPercentage] = React.useState(0);

  const startAnimation = () => {
    setisDownloading(true)
    animation.value = withRepeat(withTiming(1, {
      duration: 1000,
      easing: Easing.linear,
    }), - 1); // -1 means infinite loop
    animationTimer = setTimeout(() => {
      console.log('stopAnimation Called setTimeout', isDownloading)
      stopAnimation()
    }, 5000)
  };

  const stopAnimation = () => {
    setPercentage(0)
    clearTimeout(animationTimer)
    setisDownloading(false)
    increasePercentage()
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
      width: percentage,
      height: 2,
      backgroundColor: '#66E824',
    };
  });

  React.useEffect(() => {
    if (percentage == 100) {
      clearInterval(progressIntervel)
      stopProgress()
      setPercentage(0)
      setIsProgressing(false)
    }
  }, [percentage]);


  const increasePercentage = () => {
    setIsProgressing(true)
    progressIntervel = setInterval(() => {
      setPercentage((prevPercentage) => (prevPercentage + 10));
    }, 100)
  }

  const getAnimateClass = () => ((data[msgId]?.progress === 100 || uploadStatus === 0 ) ? true : false);

  const getActiveProgressClass = () => (uploadStatus === 1 && data[msgId]?.progress < 100 ? true : false);

  const renderLoader = () => {
    if (!isDownloading && !isProgressing) return null
    if (isDownloading)
      return <View style={styles.loaderLine}>
        <Animated.View
          style={[{
            width: 40,
            height: 2,
            backgroundColor: '#f2f2f2',
          }, animatedStyle]}
        /></View>
    if (isProgressing)
      return <View style={styles.loaderLine}><Animated.View style={progressStyle} /></View>
  }

  return (
    <>
      <Pressable
        onPress={() => {
          if (mediaData.file_url) {
            if (!isDownloading) {
              startAnimation();
              /**  SDK.downloadMedia(mediaData.file_url) */
            } else if (isDownloading) {
              stopAnimation();
            }
          }
        }}>
        {isNetworkConnected && (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8) ?
          <View overflow={'hidden'} alignItems={'center'} justifyContent={'space-between'} bg=" rgba(0, 0, 0, 0.3)" borderRadius={5}>
            <View h='9' w='85' alignItems={'center'} justifyContent={'center'}>
              <HStack
                px='2'
                borderRadius={5}
                alignItems={'center'}>
                {/* {!isDownloading && !isProgressing && <DownloadIcon color={mediaData.thumb_image ? '#fff' : '#000'} width='18' height='15' />} */}
                <Text textAlign={'center'} px='1' fontSize={'12'} color={'#fff'}>
                  {isDownloading || isProgressing ? 'X' : 'RETRY'}
                </Text>
              </HStack>
            </View>
            <View style={styles.loaderContent}>
              {renderLoader()}
            </View>
          </View> : null}
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
